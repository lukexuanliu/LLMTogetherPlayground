export interface Parameters {
  model: string;
  max_tokens: number;
  temperature: number;
  top_p: number;
  top_k: number;
  repetition_penalty: number;
  stop: string;
  frequency_penalty: number;
}

export interface History {
  id: string;
  prompt: string;
  model: string;
  timestamp: Date;
  tokensUsed: number;
}

export interface TogetherAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text: string;
    index: number;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GenerationRequest {
  prompt: string;
  parameters: Parameters;
  apiKey: string;
}

export interface GenerationResponse {
  text: string;
  headers?: any;
  body?: any;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
