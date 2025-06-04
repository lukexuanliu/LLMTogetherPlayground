import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { setupTestServer, teardownTestServer } from './setup';
import { storage } from '../../storage';
import { env } from '../../config';

// Mock node-fetch to avoid real API calls
vi.mock('node-fetch', () => ({
  default: vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Map([['content-type', 'application/json']]),
    json: vi.fn().mockResolvedValue({
      choices: [{ text: 'Test response' }],
      usage: { total_tokens: 10 }
    })
  })
}));

describe('API Integration Tests', () => {
  let baseUrl: string;
  let server: any;
  
  beforeAll(async () => {
    // Start test server
    const result = await setupTestServer();
    baseUrl = result.baseUrl;
    server = result.server;
    
    // Set a test API key
    process.env.TOGETHER_API_KEY = 'test-api-key';
  });
  
  afterAll(async () => {
    // Clean up
    await teardownTestServer();
    delete process.env.TOGETHER_API_KEY;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    storage.clearPromptHistory();
  });
  
  describe('POST /api/generate', () => {
    it('should return 400 for invalid request body', async () => {
      const response = await request(baseUrl)
        .post('/api/generate')
        .send({ invalid: 'data' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should return 200 and generate text for valid request', async () => {
      const response = await request(baseUrl)
        .post('/api/generate')
        .send({
          prompt: 'Test prompt',
          parameters: {
            model: 'test-model',
            max_tokens: 100,
            temperature: 0.7,
            top_p: 0.8,
            top_k: 40,
            repetition_penalty: 1,
            frequency_penalty: 0
          },
          apiKey: 'test-api-key'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('text', 'Test response');
    });
    
    it('should return 400 if no API key is provided', async () => {
      // Remove the environment API key for this test
      const originalApiKey = process.env.TOGETHER_API_KEY;
      delete process.env.TOGETHER_API_KEY;
      
      const response = await request(baseUrl)
        .post('/api/generate')
        .send({
          prompt: 'Test prompt',
          parameters: {
            model: 'test-model',
            max_tokens: 100,
            temperature: 0.7
          }
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      
      // Restore the API key for other tests
      process.env.TOGETHER_API_KEY = originalApiKey;
    });
    
    it('should return 400 when API call fails', async () => {
      // Mock a failed API response
      const { default: fetch } = await import('node-fetch');
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: {
            message: 'API error'
          }
        })
      });
      
      const response = await request(baseUrl)
        .post('/api/generate')
        .send({
          prompt: 'Test prompt',
          parameters: {
            model: 'test-model',
            max_tokens: 100
          },
          apiKey: 'test-api-key'
        });
      
      // The API converts all errors to 400 for consistency
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/history', () => {
    it('should return empty array when no history', async () => {
      const response = await request(baseUrl).get('/api/history');
      
      expect(response.status).toBe(200);
      expect(response.body.history).toEqual([]);
    });
    
    it('should return history items', async () => {
      // First, add some history
      await storage.savePromptHistory({
        prompt: 'Test prompt',
        model: 'test-model',
        timestamp: new Date(),
        tokensUsed: 10,
        parameters: {},
        response: 'Test response'
      });
      
      const response = await request(baseUrl).get('/api/history');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.history)).toBe(true);
      expect(response.body.history.length).toBe(1);
      expect(response.body.history[0]).toHaveProperty('prompt', 'Test prompt');
    });
    
    it('should respect limit parameter', async () => {
      // Add multiple history items
      for (let i = 0; i < 5; i++) {
        await storage.savePromptHistory({
          prompt: `Test prompt ${i}`,
          model: 'test-model',
          timestamp: new Date(),
          tokensUsed: 10,
          parameters: {},
          response: `Test response ${i}`
        });
      }
      
      const response = await request(baseUrl).get('/api/history?limit=2');
      
      expect(response.status).toBe(200);
      expect(response.body.history.length).toBe(2);
    });

    it('should use default limit when limit parameter is invalid', async () => {
      // Add multiple history items
      for (let i = 0; i < 3; i++) {
        await storage.savePromptHistory({
          prompt: `Test prompt ${i}`,
          model: 'test-model',
          timestamp: new Date(),
          tokensUsed: 10,
          parameters: {},
          response: `Test response ${i}`
        });
      }

      const response = await request(baseUrl).get('/api/history?limit=abc');

      expect(response.status).toBe(200);
      expect(response.body.history.length).toBe(3);
    });

    it('should use default limit when limit parameter is non-positive', async () => {
      // Add multiple history items
      for (let i = 0; i < 3; i++) {
        await storage.savePromptHistory({
          prompt: `Test prompt ${i}`,
          model: 'test-model',
          timestamp: new Date(),
          tokensUsed: 10,
          parameters: {},
          response: `Test response ${i}`
        });
      }

      const response = await request(baseUrl).get('/api/history?limit=0');

      expect(response.status).toBe(200);
      expect(response.body.history.length).toBe(3);
    });
  });
  
  describe('DELETE /api/history', () => {
    it('should clear history', async () => {
      // First, add some history
      await storage.savePromptHistory({
        prompt: 'Test prompt',
        model: 'test-model',
        timestamp: new Date(),
        tokensUsed: 10,
        parameters: {},
        response: 'Test response'
      });
      
      // Clear history
      const clearResponse = await request(baseUrl).delete('/api/history');
      expect(clearResponse.status).toBe(200);
      
      // Verify history is empty
      const historyResponse = await request(baseUrl).get('/api/history');
      expect(historyResponse.body.history).toEqual([]);
    });
  });
  
  describe('Error handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(baseUrl).get('/non-existent-route');
      expect(response.status).toBe(404);
    });
    
    it('should handle errors in route handlers', async () => {
      // Force an error in the route handler
      const { default: fetch } = await import('node-fetch');
      (fetch as any).mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      const response = await request(baseUrl)
        .post('/api/generate')
        .send({
          prompt: 'Test prompt',
          parameters: {
            model: 'test-model',
            max_tokens: 100
          },
          apiKey: 'test-api-key' // Make sure to include API key
        });
      
      // The error handler converts this to a 400
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
