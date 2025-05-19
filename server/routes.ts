import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import { z } from "zod";

// Validation schema for generation requests
const generationRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  parameters: z.object({
    model: z.string(),
    max_tokens: z.number().int().min(1).max(4096),
    temperature: z.number().min(0).max(2),
    top_p: z.number().min(0).max(1),
    top_k: z.number().int().min(1).max(100),
    repetition_penalty: z.number().min(1).max(2),
    stop: z.string().nullable(),
    frequency_penalty: z.number().min(-2).max(2),
  }),
  apiKey: z.string().min(1, "API key is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to handle LLM generation requests
  app.post("/api/generate", async (req, res) => {
    try {
      // Validate request
      const validationResult = generationRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request parameters",
          details: validationResult.error.format()
        });
      }
      
      const { prompt, parameters, apiKey } = validationResult.data;
      
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
        frequency_penalty: parameters.frequency_penalty,
      };
      
      // Call Together.ai API
      const apiResponse = await fetch("https://api.together.xyz/v1/completions", {
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
      const data = await apiResponse.json() as any;
      
      if (!apiResponse.ok) {
        return res.status(apiResponse.status).json({
          error: data.message || "Error from Together.ai API",
          headers,
          body: data
        });
      }
      
      // Save to history (in-memory for now)
      const tokensUsed = data.usage?.total_tokens || 0;
      const responseText = data.choices?.[0]?.text || "";
      
      await storage.savePromptHistory({
        prompt,
        model: parameters.model,
        timestamp: new Date(),
        tokensUsed,
        parameters: requestBody,
        response: responseText
      });
      
      // Return successful response
      return res.status(200).json({
        text: responseText,
        headers,
        body: data,
        usage: data.usage
      });
    } catch (error) {
      console.error("Error calling Together.ai API:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  });
  
  // Endpoint to get prompt history
  app.get("/api/history", async (req, res) => {
    try {
      const history = await storage.getPromptHistory();
      return res.status(200).json(history);
    } catch (error) {
      console.error("Error retrieving history:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  });
  
  // Endpoint to clear history
  app.delete("/api/history", async (req, res) => {
    try {
      await storage.clearPromptHistory();
      return res.status(200).json({ message: "History cleared successfully" });
    } catch (error) {
      console.error("Error clearing history:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
