/**
 * Server-side type definitions for consistent type safety
 */

/**
 * Together.ai API request parameters
 */
export interface TogetherAIParameters {
  model: string;
  max_tokens: number;
  temperature: number;
  top_p: number;
  top_k: number;
  repetition_penalty: number;
  stop: string | null;
  frequency_penalty: number;
}

/**
 * Together.ai API request
 */
export interface TogetherAIRequest {
  prompt: string;
  parameters: TogetherAIParameters;
  apiKey?: string;
}

/**
 * Together.ai API completion choice
 */
export interface TogetherAIChoice {
  text: string;
  index: number;
  finish_reason: string;
}

/**
 * Together.ai API usage statistics
 */
export interface TogetherAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/**
 * Together.ai API response
 */
export interface TogetherAIResponse {
  id: string;
  choices: TogetherAIChoice[];
  created: number;
  model: string;
  usage: TogetherAIUsage;
  object: string;
}

/**
 * Together.ai API error response
 */
export interface TogetherAIErrorResponse {
  message: string;
  type?: string;
  param?: string;
  code?: string;
}

/**
 * API error response
 */
export interface APIErrorResponse {
  error: string;
  details?: Record<string, unknown>;
  status?: number;
}

/**
 * API success response for generation endpoint
 */
export interface GenerationSuccessResponse {
  text: string;
  headers?: Record<string, string>;
  body?: any;
  usage?: TogetherAIUsage;
}

/**
 * API success response for history endpoint
 */
export interface HistorySuccessResponse {
  history: any[];
}

/**
 * API success response for clearing history
 */
export interface ClearHistorySuccessResponse {
  message: string;
}
