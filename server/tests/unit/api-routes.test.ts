import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { createServer, type Server } from 'http';
import express, { type Express } from 'express';
import request from 'supertest';
import { storage } from '../../storage';
import { registerRoutes } from '../../routes';
import { env } from '../../config';

// Mock the storage module
vi.mock('../../storage', () => {
  const MemStorage = vi.fn().mockImplementation(() => ({
    savePromptHistory: vi.fn().mockResolvedValue({
      id: 1,
      prompt: 'Test prompt',
      model: 'test-model',
      timestamp: new Date(),
      tokensUsed: 10,
      parameters: {},
      response: 'Test response'
    }),
    getPromptHistory: vi.fn().mockResolvedValue([
      {
        id: 1,
        prompt: 'Test prompt',
        model: 'test-model',
        timestamp: new Date(),
        tokensUsed: 10,
        parameters: {},
        response: 'Test response'
      }
    ]),
    clearPromptHistory: vi.fn().mockResolvedValue(undefined)
  }));

  return {
    storage: new MemStorage(),
    MemStorage
  };
});

// Mock node-fetch
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

describe('API Routes', () => {
  let app: Express;
  let server: Server;
  
  beforeAll(async () => {
    // Create Express app
    app = express();
    app.use(express.json());
    
    // Setup routes
    server = await registerRoutes(app);
  });
  
  afterAll(() => {
    server.close();
    vi.clearAllMocks();
  });
  
  describe('POST /api/generate', () => {
    it('should return 400 for invalid request body', async () => {
      const response = await request(server)
        .post('/api/generate')
        .send({ invalid: 'data' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should return 200 for valid request', async () => {
      const response = await request(server)
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
            stop: null,
            frequency_penalty: 0
          },
          apiKey: 'test-api-key'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('text', 'Test response');
    });
  });
  
  describe('GET /api/history', () => {
    it('should return history items', async () => {
      const response = await request(server).get('/api/history');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.history)).toBe(true);
      expect(response.body.history.length).toBeGreaterThan(0);
    });
    
    it('should respect limit parameter', async () => {
      const response = await request(server).get('/api/history?limit=1');
      
      expect(response.status).toBe(200);
      expect(response.body.history.length).toBe(1);
    });
  });
  
  describe('DELETE /api/history', () => {
    it('should clear history', async () => {
      const response = await request(server).delete('/api/history');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'History cleared successfully');
    });
  });
});
