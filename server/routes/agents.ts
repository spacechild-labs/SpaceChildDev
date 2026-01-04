import { Router } from "express";
import type { WebSocketServer } from "ws";
import { db } from "../db";
import { agentTasks, agentEvents } from "@shared/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { ALL_AGENTS } from "@shared/types/agent.types";
import { log } from "../utils/logger";

export default function agentRoutes(wss: WebSocketServer) {
  const router = Router();

  // List available agents
  router.get("/types", (_req, res) => {
    res.json({
      agents: ALL_AGENTS.map((agent) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        category: agent.category,
        isSubagent: agent.isSubagent || false,
      })),
      total: ALL_AGENTS.length,
      mainAgents: ALL_AGENTS.filter((a) => !a.isSubagent).length,
      subagents: ALL_AGENTS.filter((a) => a.isSubagent).length,
    });
  });

  // Execute single agent
  router.post("/execute", async (req, res) => {
    try {
      const { agentType, input, projectId } = req.body;
      const userId = req.session?.userId || "anonymous";

      // Validate agent type
      const agent = ALL_AGENTS.find((a) => a.id === agentType);
      if (!agent) {
        return res.status(400).json({ error: `Unknown agent type: ${agentType}` });
      }

      // Create task record
      const taskId = uuid();
      const [task] = await db
        .insert(agentTasks)
        .values({
          id: taskId,
          userId,
          projectId,
          agentType,
          status: "pending",
          input,
          createdAt: new Date(),
        })
        .returning();

      log(`Agent task created: ${taskId} (${agentType})`);

      // Broadcast task start event
      broadcastEvent(wss, {
        type: "task_started",
        taskId,
        agentType,
        timestamp: new Date(),
      });

      // Execute agent asynchronously
      executeAgent(wss, task.id, agent, input, projectId);

      res.json({
        taskId: task.id,
        status: "pending",
        agent: agent.name,
      });
    } catch (error) {
      log(`Agent execution error: ${error}`);
      res.status(500).json({ error: "Failed to execute agent" });
    }
  });

  // Execute agent fleet (multiple agents)
  router.post("/fleet/execute", async (req, res) => {
    try {
      const { agents, projectId, parallel = true } = req.body;
      const userId = req.session?.userId || "anonymous";

      if (!Array.isArray(agents) || agents.length === 0) {
        return res.status(400).json({ error: "No agents specified" });
      }

      const tasks = [];
      for (const agentConfig of agents) {
        const agent = ALL_AGENTS.find((a) => a.id === agentConfig.agentType);
        if (!agent) continue;

        const taskId = uuid();
        const [task] = await db
          .insert(agentTasks)
          .values({
            id: taskId,
            userId,
            projectId,
            agentType: agentConfig.agentType,
            status: "pending",
            input: agentConfig.input || {},
            createdAt: new Date(),
          })
          .returning();

        tasks.push(task);

        if (parallel) {
          executeAgent(wss, task.id, agent, agentConfig.input, projectId);
        }
      }

      // Sequential execution
      if (!parallel) {
        executeAgentsSequentially(wss, tasks, projectId);
      }

      res.json({
        fleetId: uuid(),
        tasks: tasks.map((t) => ({ taskId: t.id, agentType: t.agentType })),
        parallel,
      });
    } catch (error) {
      log(`Fleet execution error: ${error}`);
      res.status(500).json({ error: "Failed to execute fleet" });
    }
  });

  // Get task status
  router.get("/status/:taskId", async (req, res) => {
    try {
      const { taskId } = req.params;
      const [task] = await db
        .select()
        .from(agentTasks)
        .where(eq(agentTasks.id, taskId));

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json({
        taskId: task.id,
        agentType: task.agentType,
        status: task.status,
        output: task.output,
        tokensUsed: task.tokensUsed,
        costUsd: task.costUsd,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get task status" });
    }
  });

  // Cancel task
  router.post("/cancel/:taskId", async (req, res) => {
    try {
      const { taskId } = req.params;
      await db
        .update(agentTasks)
        .set({ status: "cancelled" })
        .where(eq(agentTasks.id, taskId));

      broadcastEvent(wss, {
        type: "task_cancelled",
        taskId,
        timestamp: new Date(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel task" });
    }
  });

  // Get task events
  router.get("/events/:taskId", async (req, res) => {
    try {
      const { taskId } = req.params;
      const events = await db
        .select()
        .from(agentEvents)
        .where(eq(agentEvents.taskId, taskId));

      res.json({ events });
    } catch (error) {
      res.status(500).json({ error: "Failed to get task events" });
    }
  });

  return router;
}

// Helper: Broadcast event to all WebSocket clients
function broadcastEvent(wss: WebSocketServer, event: unknown) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(event));
    }
  });
}

// Helper: Execute single agent (async)
async function executeAgent(
  wss: WebSocketServer,
  taskId: string,
  agent: (typeof ALL_AGENTS)[0],
  input: unknown,
  projectId?: number
) {
  try {
    // Update status to running
    await db
      .update(agentTasks)
      .set({ status: "running", startedAt: new Date() })
      .where(eq(agentTasks.id, taskId));

    broadcastEvent(wss, {
      type: "task_progress",
      taskId,
      agentType: agent.id,
      progress: 0,
      timestamp: new Date(),
    });

    // TODO: Implement actual agent execution with AI providers
    // For now, simulate execution
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate completion
    const output = {
      success: true,
      result: `${agent.name} completed successfully`,
      metrics: {
        executionTime: 2000,
      },
    };

    await db
      .update(agentTasks)
      .set({
        status: "completed",
        output,
        completedAt: new Date(),
        tokensUsed: 1000,
        costUsd: "0.01",
      })
      .where(eq(agentTasks.id, taskId));

    broadcastEvent(wss, {
      type: "task_completed",
      taskId,
      agentType: agent.id,
      output,
      timestamp: new Date(),
    });

    log(`Agent task completed: ${taskId}`);
  } catch (error) {
    await db
      .update(agentTasks)
      .set({
        status: "failed",
        error: String(error),
        completedAt: new Date(),
      })
      .where(eq(agentTasks.id, taskId));

    broadcastEvent(wss, {
      type: "task_failed",
      taskId,
      error: String(error),
      timestamp: new Date(),
    });

    log(`Agent task failed: ${taskId} - ${error}`);
  }
}

// Helper: Execute agents sequentially
async function executeAgentsSequentially(
  wss: WebSocketServer,
  tasks: Array<{ id: string; agentType: string }>,
  projectId?: number
) {
  for (const task of tasks) {
    const agent = ALL_AGENTS.find((a) => a.id === task.agentType);
    if (agent) {
      await executeAgent(wss, task.id, agent, {}, projectId);
    }
  }
}
