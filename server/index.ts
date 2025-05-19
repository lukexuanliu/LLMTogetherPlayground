import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { env, api } from "./config";

/**
 * Setup application middleware
 * @param app Express application instance
 */
function setupMiddleware(app: express.Express): void {
  // Enable CORS for all routes
  app.use(cors());
  
  // Parse JSON request bodies
  app.use(express.json());
  
  // Parse URL-encoded request bodies
  app.use(express.urlencoded({ extended: false }));

  // Log API requests
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        console.log(logLine);
      }
    });

    next();
  });
}

/**
 * Error handling middleware
 */
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error("Unhandled error:", err);
  
  // Only send response if one hasn't already been sent
  if (!res.headersSent) {
    res.status(500).json({ 
      error: api.errors.INTERNAL_ERROR, 
      message: env.isProd() ? undefined : err.message 
    });
  }
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Create Express application
    const app = express();
    
    // Validate environment variables before proceeding
    env.validate();
    
    // Setup middleware
    setupMiddleware(app);
    
    // Setup API routes
    const httpServer = await registerRoutes(app);
    
    // Add error handler - must be after route registration
    app.use(errorHandler);
    
    // If in development mode, set up Vite middleware for serving the client app
    if (!env.isProd()) {
      log("Setting up Vite development middleware");
      await setupVite(app, httpServer);
    } else {
      log("Setting up static file serving for production");
      serveStatic(app);
    }
    
    // Start the server
    httpServer.listen(env.PORT, () => {
      console.log(`✅ Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`   API available at http://localhost:${env.PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
