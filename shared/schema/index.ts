// Shared schema types
export interface PromptHistory {
  id: number;
  prompt: string;
  model: string;
  timestamp: Date;
  tokensUsed: number;
  parameters: Record<string, any>;
  response: string;
}

export type InsertPromptHistory = PromptHistory;
