import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Prompt history table
export const promptHistory = pgTable("prompt_history", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  model: text("model").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  tokensUsed: integer("tokens_used").notNull(),
  parameters: jsonb("parameters").notNull(),
  response: text("response").notNull(),
});

export const insertPromptHistorySchema = createInsertSchema(promptHistory).omit({
  id: true,
});

export type InsertPromptHistory = z.infer<typeof insertPromptHistorySchema>;
export type PromptHistory = typeof promptHistory.$inferSelect;

// User configuration table
export const userConfig = pgTable("user_config", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  defaultModel: text("default_model").notNull(),
  defaultMaxTokens: integer("default_max_tokens").notNull(),
  defaultTemperature: text("default_temperature").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertUserConfigSchema = createInsertSchema(userConfig).omit({
  id: true,
});

export type InsertUserConfig = z.infer<typeof insertUserConfigSchema>;
export type UserConfig = typeof userConfig.$inferSelect;

// API keys table - for development/testing purposes only
// In production, API keys should be stored more securely
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
