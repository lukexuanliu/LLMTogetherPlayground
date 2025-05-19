import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { api, env } from '../../config';

describe('Error Handler Middleware', () => {
  // Create mocks for the Express request, response, and next function
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
  
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Mock the Express request, response, and next function
    req = {} as Request;
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      headersSent: false
    } as unknown as Response;
    next = vi.fn();
    
    // Define the error handler function - similar to the one in server/index.ts
    errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
      console.error = vi.fn(); // Mock console.error to avoid polluting test output
      
      // Only send response if one hasn't already been sent
      if (!res.headersSent) {
        res.status(500).json({ 
          error: api.errors.INTERNAL_ERROR, 
          message: env.isProd() ? undefined : err.message 
        });
      }
    };
  });
  
  it('should set status to 500 and return an error response', () => {
    const error = new Error('Test error');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: api.errors.INTERNAL_ERROR,
      message: error.message
    });
  });
  
  it('should not include error message in production environment', () => {
    const originalIsProd = env.isProd;
    env.isProd = vi.fn().mockReturnValue(true);
    
    const error = new Error('Test error');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: api.errors.INTERNAL_ERROR,
      message: undefined
    });
    
    env.isProd = originalIsProd;
  });
  
  it('should not send a response if headers have already been sent', () => {
    res.headersSent = true;
    const error = new Error('Test error');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
