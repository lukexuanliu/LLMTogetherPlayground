import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env, togetherAI, api } from '../../config.js';

describe('Config Module', () => {
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  describe('env object', () => {
    it('should return correct PORT value', async () => {
      process.env.PORT = '4000';
      const { env: freshEnv } = await import('../../config.js');
      expect(freshEnv.PORT).toBe(4000);
    });
    
    it('should default PORT to 3000 if not set', async () => {
      delete process.env.PORT;
      const { env: freshEnv } = await import('../../config.js');
      expect(freshEnv.PORT).toBe(3000);
    });
    
    it('should recognize production environment', async () => {
      process.env.NODE_ENV = 'production';
      const { env: freshEnv } = await import('../../config.js');
      expect(freshEnv.isProd()).toBe(true);
    });
    
    it('should recognize non-production environment', async () => {
      process.env.NODE_ENV = 'development';
      const { env: freshEnv } = await import('../../config.js');
      expect(freshEnv.isProd()).toBe(false);
    });
    
    it('should return API key from environment', async () => {
      const testApiKey = 'test-api-key';
      process.env.TOGETHER_API_KEY = testApiKey;
      const { env: freshEnv } = await import('../../config.js');
      expect(freshEnv.TOGETHER_API_KEY).toBe(testApiKey);
    });
    
    it('should validate successfully when all required env vars are present', async () => {
      process.env.TOGETHER_API_KEY = 'test-api-key';
      const { env: freshEnv } = await import('../../config.js');
      expect(() => freshEnv.validate()).not.toThrow();
    });
    
    it('should throw when API key is missing', async () => {
      delete process.env.TOGETHER_API_KEY;
      const { env: freshEnv } = await import('../../config.js');
      expect(() => freshEnv.validate()).toThrow('Missing required environment variables: TOGETHER_API_KEY');
    });
  });
  
  describe('togetherAI object', () => {
    it('should have a valid completions endpoint URL', () => {
      expect(togetherAI.COMPLETIONS_ENDPOINT).toMatch(/^https:\/\/api\.together\.xyz\/v1\/completions$/);
    });
    
    it('should have a valid models array', () => {
      expect(Array.isArray(togetherAI.models)).toBe(true);
      expect(togetherAI.models.length).toBeGreaterThan(0);
      togetherAI.models.forEach(model => {
        expect(typeof model).toBe('string');
      });
    });
    
    it('should have valid default parameters', () => {
      expect(togetherAI.defaultParameters).toHaveProperty('model');
      expect(togetherAI.defaultParameters).toHaveProperty('max_tokens');
      expect(togetherAI.defaultParameters).toHaveProperty('temperature');
      expect(togetherAI.defaultParameters).toHaveProperty('top_p');
      expect(togetherAI.defaultParameters).toHaveProperty('top_k');
      expect(togetherAI.defaultParameters).toHaveProperty('repetition_penalty');
      expect(togetherAI.defaultParameters).toHaveProperty('frequency_penalty');
    });
  });
  
  describe('api object', () => {
    it('should have a MAX_HISTORY_ITEMS property greater than 0', () => {
      expect(api.MAX_HISTORY_ITEMS).toBeGreaterThan(0);
    });
    
    it('should have an errors object with required error messages', () => {
      expect(api.errors).toHaveProperty('INTERNAL_ERROR');
      expect(api.errors).toHaveProperty('INVALID_REQUEST');
      expect(api.errors).toHaveProperty('API_KEY_MISSING');
    });
  });
});
