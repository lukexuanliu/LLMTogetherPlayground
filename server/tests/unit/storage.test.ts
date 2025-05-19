import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from '../../storage';
import type { InsertPromptHistory } from '@shared/schema';

describe('Storage Module', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('savePromptHistory', () => {
    it('should save a prompt history item and return it with an ID', async () => {
      const historyItem: Omit<InsertPromptHistory, 'id'> = {
        prompt: 'Test prompt',
        model: 'test-model',
        timestamp: new Date(),
        tokensUsed: 100,
        parameters: {
          model: 'test-model',
          max_tokens: 100,
          temperature: 0.7,
          top_p: 0.8,
          top_k: 40,
          repetition_penalty: 1,
          stop: null,
          frequency_penalty: 0
        },
        response: 'Test response'
      };

      const result = await storage.savePromptHistory(historyItem);

      expect(result).toHaveProperty('id');
      expect(result.id).toBe(1);
      expect(result.prompt).toBe(historyItem.prompt);
      expect(result.model).toBe(historyItem.model);
      expect(result.timestamp).toEqual(historyItem.timestamp);
      expect(result.tokensUsed).toBe(historyItem.tokensUsed);
      expect(result.parameters).toEqual(historyItem.parameters);
      expect(result.response).toBe(historyItem.response);
    });

    it('should generate sequential IDs for multiple items', async () => {
      const historyItem1 = {
        prompt: 'Test prompt 1',
        model: 'test-model',
        timestamp: new Date(),
        tokensUsed: 100,
        parameters: { model: 'test-model' },
        response: 'Test response 1'
      };

      const historyItem2 = {
        prompt: 'Test prompt 2',
        model: 'test-model',
        timestamp: new Date(),
        tokensUsed: 100,
        parameters: { model: 'test-model' },
        response: 'Test response 2'
      };

      const result1 = await storage.savePromptHistory(historyItem1);
      const result2 = await storage.savePromptHistory(historyItem2);

      expect(result1.id).toBe(1);
      expect(result2.id).toBe(2);
    });

    it('should handle timestamp conversion if string provided', async () => {
      const now = new Date();
      const historyItem = {
        prompt: 'Test prompt',
        model: 'test-model',
        // @ts-ignore - intentionally testing with wrong type
        timestamp: now.toISOString(),
        tokensUsed: 100,
        parameters: { model: 'test-model' },
        response: 'Test response'
      };

      const result = await storage.savePromptHistory(historyItem);
      
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getPromptHistory', () => {
    it('should return an empty array when no items exist', async () => {
      const result = await storage.getPromptHistory();
      expect(result).toEqual([]);
    });

    it('should return all items when limit exceeds number of items', async () => {
      await storage.savePromptHistory({
        prompt: 'Test 1',
        model: 'model',
        timestamp: new Date(),
        tokensUsed: 100,
        parameters: { model: 'model' },
        response: 'Response 1'
      });

      await storage.savePromptHistory({
        prompt: 'Test 2',
        model: 'model',
        timestamp: new Date(),
        tokensUsed: 100,
        parameters: { model: 'model' },
        response: 'Response 2'
      });

      const result = await storage.getPromptHistory(10);
      expect(result.length).toBe(2);
    });

    it('should respect the limit parameter', async () => {
      await storage.savePromptHistory({
        prompt: 'Test 1',
        model: 'model',
        timestamp: new Date(),
        tokensUsed: 100,
        parameters: { model: 'model' },
        response: 'Response 1'
      });

      await storage.savePromptHistory({
        prompt: 'Test 2',
        model: 'model',
        timestamp: new Date(),
        tokensUsed: 100,
        parameters: { model: 'model' },
        response: 'Response 2'
      });

      await storage.savePromptHistory({
        prompt: 'Test 3',
        model: 'model',
        timestamp: new Date(),
        tokensUsed: 100,
        parameters: { model: 'model' },
        response: 'Response 3'
      });

      const result = await storage.getPromptHistory(2);
      expect(result.length).toBe(2);
    });

    it('should sort items by timestamp in descending order (newest first)', async () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-02');
      const date3 = new Date('2023-01-03');

      await storage.savePromptHistory({
        prompt: 'Oldest',
        model: 'model',
        timestamp: date1,
        tokensUsed: 100,
        parameters: { model: 'model' },
        response: 'Response 1'
      });

      await storage.savePromptHistory({
        prompt: 'Middle',
        model: 'model',
        timestamp: date2,
        tokensUsed: 100,
        parameters: { model: 'model' },
        response: 'Response 2'
      });

      await storage.savePromptHistory({
        prompt: 'Newest',
        model: 'model',
        timestamp: date3,
        tokensUsed: 100,
        parameters: { model: 'model' },
        response: 'Response 3'
      });

      const result = await storage.getPromptHistory();
      
      expect(result[0].prompt).toBe('Newest');
      expect(result[1].prompt).toBe('Middle');
      expect(result[2].prompt).toBe('Oldest');
    });

    it('should handle negative limit value by returning empty array', async () => {
      await storage.savePromptHistory({
        prompt: 'Test',
        model: 'model',
        timestamp: new Date(),
        tokensUsed: 100,
        parameters: { model: 'model' },
        response: 'Response'
      });

      const result = await storage.getPromptHistory(-1);
      expect(result.length).toBe(0);
    });
  });

  describe('clearPromptHistory', () => {
    it('should clear all prompt history items', async () => {
      await storage.savePromptHistory({
        prompt: 'Test 1',
        model: 'model',
        timestamp: new Date(),
        tokensUsed: 100,
        parameters: { model: 'model' },
        response: 'Response 1'
      });

      await storage.savePromptHistory({
        prompt: 'Test 2',
        model: 'model',
        timestamp: new Date(),
        tokensUsed: 100,
        parameters: { model: 'model' },
        response: 'Response 2'
      });

      let result = await storage.getPromptHistory();
      expect(result.length).toBe(2);

      await storage.clearPromptHistory();
      
      result = await storage.getPromptHistory();
      expect(result.length).toBe(0);
    });

    it('should be idempotent - clearing an empty storage should not throw', async () => {
      await expect(storage.clearPromptHistory()).resolves.not.toThrow();
    });
  });
});
