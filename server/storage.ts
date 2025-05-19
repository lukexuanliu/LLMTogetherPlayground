import { InsertPromptHistory, PromptHistory } from "@shared/schema";

/**
 * Interface for storage operations 
 * Focused only on prompt history as per current application needs
 */
export interface IStorage {
  /**
   * Saves a prompt history record
   * @param history The prompt history data without ID
   * @returns Promise resolving to the saved history with ID
   */
  savePromptHistory(history: Omit<InsertPromptHistory, "id">): Promise<PromptHistory>;
  
  /**
   * Retrieves prompt history records
   * @param limit Maximum number of records to return
   * @returns Promise resolving to an array of prompt history records
   */
  getPromptHistory(limit?: number): Promise<PromptHistory[]>;
  
  /**
   * Clears all prompt history
   * @returns Promise resolving when history is cleared
   */
  clearPromptHistory(): Promise<void>;
}

/**
 * In-memory storage implementation
 * 
 * Note: This is a simple non-persistent implementation suitable for development.
 * For production, consider replacing with a database implementation.
 */
export class MemStorage implements IStorage {
  private promptHistory: Map<number, PromptHistory>;
  private currentPromptHistoryId: number;

  constructor() {
    this.promptHistory = new Map();
    this.currentPromptHistoryId = 1;
  }

  /**
   * Saves a prompt history record
   * @param historyItem The prompt history data without ID
   * @returns The saved prompt history with ID
   */
  async savePromptHistory(historyItem: Omit<InsertPromptHistory, "id">): Promise<PromptHistory> {
    const id = this.currentPromptHistoryId++;
    
    // Ensure timestamp is a valid Date object
    const timestamp = historyItem.timestamp instanceof Date 
      ? historyItem.timestamp 
      : new Date();
    
    const promptHistoryItem: PromptHistory = { 
      ...historyItem, 
      id,
      timestamp
    };
    
    this.promptHistory.set(id, promptHistoryItem);
    return promptHistoryItem;
  }

  /**
   * Retrieves prompt history records sorted by most recent first
   * @param limit Maximum number of records to return (default: 50)
   * @returns Array of prompt history records
   */
  async getPromptHistory(limit: number = 50): Promise<PromptHistory[]> {
    // Convert to array, sort by timestamp (most recent first), and limit
    return Array.from(this.promptHistory.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, Math.max(0, limit)); // Ensure limit is not negative
  }

  /**
   * Clears all prompt history
   */
  async clearPromptHistory(): Promise<void> {
    this.promptHistory.clear();
  }
}

// Instantiate and export storage
export const storage = new MemStorage();
