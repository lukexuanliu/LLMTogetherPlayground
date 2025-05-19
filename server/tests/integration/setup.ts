import { afterAll, beforeAll } from 'vitest';
import { createServer } from 'http';
import express from 'express';
import { registerRoutes } from '../../routes';
import { storage } from '../../storage';

export let server: ReturnType<typeof createServer>;

export const setupTestServer = async () => {
  const app = express();
  app.use(express.json());
  
  // Setup routes
  server = await registerRoutes(app);
  
  // Start server on a random port
  return new Promise<{ server: typeof server; baseUrl: string }>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'string' ? 0 : address?.port || 0;
      const baseUrl = `http://127.0.0.1:${port}`;
      resolve({ server, baseUrl });
    });
  });
};

export const teardownTestServer = () => {
  return new Promise<void>((resolve) => {
    if (server) {
      server.close(() => {
        storage.clearPromptHistory();
        resolve();
      });
    } else {
      resolve();
    }
  });
};
