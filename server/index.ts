import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { log } from "./utils/logger";

const app = express();
const MemoryStoreSession = MemoryStore(session);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "spacechilddev-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // 24 hours
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

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
        logLine += ` :: ${JSON.stringify(capturedJsonResponse).substring(0, 100)}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = createServer(app);

  // WebSocket server for real-time events
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    log(`WebSocket client connected from ${req.socket.remoteAddress}`);

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        log(`WebSocket message: ${data.type}`);
        
        // Handle different message types
        switch (data.type) {
          case "subscribe":
            // Subscribe to agent events, metrics, etc.
            break;
          case "ping":
            ws.send(JSON.stringify({ type: "pong" }));
            break;
        }
      } catch (error) {
        log(`WebSocket message parse error: ${error}`);
      }
    });

    ws.on("close", () => {
      log("WebSocket client disconnected");
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));
  });

  // Store WSS reference for broadcasting
  app.set("wss", wss);

  // Register API routes
  registerRoutes(app, wss);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error: ${status} - ${message}`);
    res.status(status).json({ message });
  });

  // Setup Vite or static serving
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`SpaceChildDev server running on port ${PORT}`);
    log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
})();
