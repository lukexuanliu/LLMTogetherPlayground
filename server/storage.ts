import { InsertPromptHistory, PromptHistory } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Prompt history operations
  savePromptHistory(history: Omit<InsertPromptHistory, "id">): Promise<PromptHistory>;
  getPromptHistory(limit?: number): Promise<PromptHistory[]>;
  clearPromptHistory(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private promptHistory: Map<number, PromptHistory>;
  private currentUserId: number;
  private currentPromptHistoryId: number;

  constructor() {
    this.users = new Map();
    this.promptHistory = new Map();
    this.currentUserId = 1;
    this.currentPromptHistoryId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Prompt history operations
  async savePromptHistory(historyItem: Omit<InsertPromptHistory, "id">): Promise<PromptHistory> {
    const id = this.currentPromptHistoryId++;
    const promptHistoryItem: PromptHistory = { 
      ...historyItem, 
      id,
      timestamp: new Date(historyItem.timestamp)
    };
    this.promptHistory.set(id, promptHistoryItem);
    return promptHistoryItem;
  }

  async getPromptHistory(limit: number = 50): Promise<PromptHistory[]> {
    // Convert to array, sort by timestamp (most recent first), and limit
    return Array.from(this.promptHistory.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async clearPromptHistory(): Promise<void> {
    this.promptHistory.clear();
  }
}

// Instantiate and export storage
export const storage = new MemStorage();
