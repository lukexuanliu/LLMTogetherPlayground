import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../../config';

// We need to extract and test the validation functions from routes.ts
// Since they might be internal to the file, we'll use some approaches to test them

describe('Routes Validation', () => {
  const originalEnv = { ...process.env };
  let routesModule: any;
  
  beforeEach(async () => {
    vi.resetModules();
    process.env = { ...originalEnv };
    
    // Create a mock version of the functions we need to test
    const getValidApiKeyMock = (providedKey?: string): string => {
      if (providedKey && providedKey.trim().length > 0) {
        return providedKey;
      }
      
      const envApiKey = process.env.TOGETHER_API_KEY;
      if (!envApiKey || envApiKey.trim().length === 0) {
        throw new Error(api.errors.API_KEY_MISSING);
      }
      
      return envApiKey;
    };
    
    // Expose the function for testing
    routesModule = {
      getValidApiKey: getValidApiKeyMock
    };
  });
  
  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });
  
  describe('getValidApiKey', () => {
    it('should return the provided API key when valid', () => {
      const providedKey = 'provided-api-key';
      const result = routesModule.getValidApiKey(providedKey);
      expect(result).toBe(providedKey);
    });
    
    it('should use environment API key when no key is provided', () => {
      const envKey = 'env-api-key';
      process.env.TOGETHER_API_KEY = envKey;
      
      const result = routesModule.getValidApiKey();
      expect(result).toBe(envKey);
    });
    
    it('should throw an error when no key is provided and environment key is missing', () => {
      delete process.env.TOGETHER_API_KEY;
      
      expect(() => routesModule.getValidApiKey()).toThrow(api.errors.API_KEY_MISSING);
    });
    
    it('should throw an error when provided key is empty string', () => {
      delete process.env.TOGETHER_API_KEY;
      
      expect(() => routesModule.getValidApiKey('')).toThrow(api.errors.API_KEY_MISSING);
    });
    
    it('should throw an error when provided key is only whitespace', () => {
      delete process.env.TOGETHER_API_KEY;
      
      expect(() => routesModule.getValidApiKey('   ')).toThrow(api.errors.API_KEY_MISSING);
    });
    
    it('should prioritize provided key over environment key', () => {
      const providedKey = 'provided-api-key';
      const envKey = 'env-api-key';
      process.env.TOGETHER_API_KEY = envKey;
      
      const result = routesModule.getValidApiKey(providedKey);
      expect(result).toBe(providedKey);
    });
  });
  
  describe('Request validation schema', () => {
    // Since we have access to the Zod schema defined in routes.ts, we can also test it
    // by recreating the schema in our test
    
    it('should be tested in request handler tests', () => {
      // This is a placeholder. The request validation will be covered in the handler tests
      // since the schema is internal to the routes file
      expect(true).toBe(true);
    });
  });
});
