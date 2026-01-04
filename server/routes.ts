import type { Express } from "express";
import type { WebSocketServer } from "ws";
import agentRoutes from "./routes/agents";
import qeRoutes from "./routes/qe";
import tddRoutes from "./routes/tdd";
import learningRoutes from "./routes/learning";
import projectRoutes from "./routes/projects";
import fileRoutes from "./routes/files";
import authRoutes from "./routes/auth";

export function registerRoutes(app: Express, wss: WebSocketServer) {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      service: "SpaceChildDev",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  // Auth routes
  app.use("/api/auth", authRoutes);

  // Project management
  app.use("/api/projects", projectRoutes);
  app.use("/api/files", fileRoutes);

  // Agent system routes
  app.use("/api/agents", agentRoutes(wss));

  // Quality Engineering routes
  app.use("/api/qe", qeRoutes(wss));

  // TDD workflow routes
  app.use("/api/tdd", tddRoutes(wss));

  // Learning system routes
  app.use("/api/learning", learningRoutes);

  // Metrics endpoint
  app.get("/api/metrics", (_req, res) => {
    res.json({
      agents: {
        total: 31,
        active: 0,
        completed: 0,
      },
      qe: {
        skills: 41,
        patternsLearned: 0,
        coverageAverage: 0,
      },
      learning: {
        algorithm: "q-learning",
        episodes: 0,
        convergenceScore: 0,
      },
    });
  });

  // System info endpoint
  app.get("/api/system", (_req, res) => {
    res.json({
      name: "SpaceChildDev",
      description: "Agentic IDE with robust quality engineering",
      features: [
        "31 QE Agents (20 main + 11 TDD subagents)",
        "41 QE Skills Library",
        "Self-Learning System (Q-Learning, SARSA, A2C, PPO)",
        "Multi-Model Router (70-81% cost savings)",
        "TDD Workflow (RED/GREEN/REFACTOR)",
        "Flaky Test Detection (90%+ accuracy)",
        "Real-Time Visualization",
        "MCP Integration",
        "Trifecta Integration",
      ],
      version: "1.0.0",
    });
  });
}
