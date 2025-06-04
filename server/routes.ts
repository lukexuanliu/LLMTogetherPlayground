import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import { z } from "zod";
import { env, togetherAI, api } from "./config";
import {
  TogetherAIRequest,
  TogetherAIResponse,
  TogetherAIErrorResponse,
  APIErrorResponse,
  GenerationSuccessResponse,
  HistorySuccessResponse,
  ClearHistorySuccessResponse
} from "./types";

/**
 * Validation schema for generation requests
 * Uses centralized configuration for consistency
 */
const generationRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  parameters: z.object({
    model: z.string(),
    max_tokens: z.number().int().min(1).max(4096),
    temperature: z.number().min(0).max(2),
    top_p: z.number().min(0).max(1),
    top_k: z.number().int().min(1).max(100),
    repetition_penalty: z.number().min(1).max(2),
    stop: z.string().nullable().optional(),
    frequency_penalty: z.number().min(-2).max(2).optional(),
  }),
  // API key is optional as we'll use the one from environment variables by default
  apiKey: z.string().optional(),
});

/**
 * Helper function to validate and retrieve API key
 * @param providedKey Optional API key provided in the request
 * @returns Valid API key to use for the request
 * @throws Error if no valid API key is available
 */
const getValidApiKey = (providedKey?: string): string => {
  // First check if a key was provided in the request (for override or testing)
  if (providedKey && providedKey.trim().length > 0) {
    return providedKey;
  }
  
  // Then check environment variable
  const envApiKey = env.TOGETHER_API_KEY;
  if (!envApiKey || envApiKey.trim().length === 0) {
    throw new Error(api.errors.API_KEY_MISSING);
  }
  
  return envApiKey;
};

/**
 * Send a typed error response
 * @param res Express response object
 * @param status HTTP status code
 * @param message Error message
 * @param details Optional error details
 */
const sendErrorResponse = (res: Response, status: number, message: string, details?: Record<string, unknown>): void => {
  const errorResponse: APIErrorResponse = { error: message };
  if (details) errorResponse.details = details;
  res.status(status).json(errorResponse);
};

/**
 * Generate completion handler
 * @param req Express request
 * @param res Express response
 */
async function handleGeneration(req: Request, res: Response): Promise<void> {
  try {
    // Validate request
    const validationResult = generationRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      sendErrorResponse(res, 400, api.errors.INVALID_REQUEST, validationResult.error.format());
      return;
    }
    
    const { prompt, parameters, apiKey: requestApiKey } = validationResult.data;
    
    // Get valid API key (from request or environment)
    let apiKey: string;
    try {
      apiKey = getValidApiKey(requestApiKey);
    } catch (error) {
      sendErrorResponse(res, 400, (error as Error).message);
      return;
    }
    
    // Prepare request to Together.ai API
    const requestBody = {
      model: parameters.model,
      prompt,
      max_tokens: parameters.max_tokens,
      temperature: parameters.temperature,
      top_p: parameters.top_p,
      top_k: parameters.top_k,
      repetition_penalty: parameters.repetition_penalty,
      stop: parameters.stop || null,
      frequency_penalty: parameters.frequency_penalty || 0,
    };
    
    // Call Together.ai API
    const apiResponse = await fetch(togetherAI.COMPLETIONS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // Extract headers for debug information
    const headers: Record<string, string> = {};
    apiResponse.headers.forEach((value, name) => {
      headers[name] = value;
    });
    
    // Process API response
    const data = await apiResponse.json();
    
    if (!apiResponse.ok) {
      // Handle error response
      const errorData = data as TogetherAIErrorResponse;
      sendErrorResponse(
        res, 
        apiResponse.status, 
        errorData.message || "Error from Together.ai API", 
        { headers, body: errorData }
      );
      return;
    }
    
    // Handle success response
    const responseData = data as TogetherAIResponse;
    
    // Save to history (in-memory for now)
    const tokensUsed = responseData.usage?.total_tokens || 0;
    const responseText = responseData.choices[0]?.text || "";
    
    await storage.savePromptHistory({
      prompt,
      model: parameters.model,
      timestamp: new Date(),
      tokensUsed,
      parameters: requestBody,
      response: responseText
    });
    
    // Return successful response
    const response: GenerationSuccessResponse = {
      text: responseText,
      headers,
      body: responseData,
      usage: responseData.usage
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Error calling Together.ai API:", error);
    sendErrorResponse(res, 500, error instanceof Error ? error.message : api.errors.INTERNAL_ERROR);
  }
}

/**
 * Get history handler
 * @param req Express request
 * @param res Express response
 */
async function handleGetHistory(req: Request, res: Response): Promise<void> {
  try {
    let limit = api.MAX_HISTORY_ITEMS;
    if (req.query.limit !== undefined) {
      const parsed = parseInt(req.query.limit as string, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        limit = parsed;
      }
    }
    const history = await storage.getPromptHistory(limit);
    const response: HistorySuccessResponse = { history };
    res.status(200).json(response);
  } catch (error) {
    console.error("Error retrieving history:", error);
    sendErrorResponse(res, 500, error instanceof Error ? error.message : api.errors.INTERNAL_ERROR);
  }
}

/**
 * Clear history handler
 * @param req Express request
 * @param res Express response
 */
async function handleClearHistory(_req: Request, res: Response): Promise<void> {
  try {
    await storage.clearPromptHistory();
    const response: ClearHistorySuccessResponse = { message: "History cleared successfully" };
    res.status(200).json(response);
  } catch (error) {
    console.error("Error clearing history:", error);
    sendErrorResponse(res, 500, error instanceof Error ? error.message : api.errors.INTERNAL_ERROR);
  }
}

/**
 * Register all API routes
 * @param app Express application instance
 * @returns HTTP server instance
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to handle LLM generation requests
  app.post("/api/generate", handleGeneration);
  
  // Endpoint to get prompt history
  app.get("/api/history", handleGetHistory);
  
  // Endpoint to clear history
  app.delete("/api/history", handleClearHistory);

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
