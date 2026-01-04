import { Router } from "express";
import type { WebSocketServer } from "ws";
import { db } from "../db";
import { tddSessions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { log } from "../utils/logger";

export default function tddRoutes(wss: WebSocketServer) {
  const router = Router();

  // Start TDD session
  router.post("/start", async (req, res) => {
    try {
      const { projectId, testFilePath, implFilePath } = req.body;
      const userId = req.session?.userId || "anonymous";

      const [session] = await db
        .insert(tddSessions)
        .values({
          id: uuid(),
          projectId,
          userId,
          currentPhase: "red",
          cycleCount: 0,
          testFilePath,
          implFilePath,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      log(`TDD session started: ${session.id}`);

      broadcastEvent(wss, {
        type: "tdd_session_started",
        sessionId: session.id,
        phase: "red",
        timestamp: new Date(),
      });

      res.json({
        sessionId: session.id,
        currentPhase: "red",
        cycleCount: 0,
        status: "active",
      });
    } catch (error) {
      log(`TDD start error: ${error}`);
      res.status(500).json({ error: "Failed to start TDD session" });
    }
  });

  // Execute RED phase
  router.post("/red", async (req, res) => {
    try {
      const { sessionId, testDescription, assertions } = req.body;

      const [session] = await db
        .select()
        .from(tddSessions)
        .where(eq(tddSessions.id, sessionId));

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.currentPhase !== "red") {
        return res.status(400).json({
          error: `Cannot execute RED phase. Current phase is ${session.currentPhase}`,
        });
      }

      // TODO: Implement actual RED phase execution
      // - Generate failing test based on description
      // - Run test to verify it fails
      
      const generatedTest = {
        success: true,
        testCode: `
describe('${testDescription}', () => {
  it('should fail initially', () => {
    // TODO: Implement test
    expect(true).toBe(false);
  });
});
        `,
        assertions: assertions || [],
        testPasses: false,
      };

      await db
        .update(tddSessions)
        .set({
          currentPhase: "green",
          assertions: generatedTest.assertions,
          updatedAt: new Date(),
        })
        .where(eq(tddSessions.id, sessionId));

      broadcastEvent(wss, {
        type: "tdd_phase_completed",
        sessionId,
        phase: "red",
        nextPhase: "green",
        timestamp: new Date(),
      });

      res.json({
        phase: "red",
        completed: true,
        nextPhase: "green",
        generatedTest,
      });
    } catch (error) {
      log(`TDD RED phase error: ${error}`);
      res.status(500).json({ error: "Failed to execute RED phase" });
    }
  });

  // Execute GREEN phase
  router.post("/green", async (req, res) => {
    try {
      const { sessionId, implementation } = req.body;

      const [session] = await db
        .select()
        .from(tddSessions)
        .where(eq(tddSessions.id, sessionId));

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.currentPhase !== "green") {
        return res.status(400).json({
          error: `Cannot execute GREEN phase. Current phase is ${session.currentPhase}`,
        });
      }

      // TODO: Implement actual GREEN phase execution
      // - Generate minimal implementation to pass tests
      // - Run tests to verify they pass

      const result = {
        success: true,
        implementation: implementation || "// Minimal implementation",
        testPasses: true,
      };

      await db
        .update(tddSessions)
        .set({
          currentPhase: "refactor",
          updatedAt: new Date(),
        })
        .where(eq(tddSessions.id, sessionId));

      broadcastEvent(wss, {
        type: "tdd_phase_completed",
        sessionId,
        phase: "green",
        nextPhase: "refactor",
        timestamp: new Date(),
      });

      res.json({
        phase: "green",
        completed: true,
        nextPhase: "refactor",
        result,
      });
    } catch (error) {
      log(`TDD GREEN phase error: ${error}`);
      res.status(500).json({ error: "Failed to execute GREEN phase" });
    }
  });

  // Execute REFACTOR phase
  router.post("/refactor", async (req, res) => {
    try {
      const { sessionId, refactoredCode } = req.body;

      const [session] = await db
        .select()
        .from(tddSessions)
        .where(eq(tddSessions.id, sessionId));

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.currentPhase !== "refactor") {
        return res.status(400).json({
          error: `Cannot execute REFACTOR phase. Current phase is ${session.currentPhase}`,
        });
      }

      // TODO: Implement actual REFACTOR phase execution
      // - Suggest refactoring improvements
      // - Apply refactoring
      // - Run tests to verify they still pass

      const result = {
        success: true,
        refactoredCode: refactoredCode || "// Refactored code",
        testPasses: true,
        improvements: [
          "Extracted helper function",
          "Improved naming",
          "Reduced complexity",
        ],
      };

      // Complete cycle and start new RED phase
      await db
        .update(tddSessions)
        .set({
          currentPhase: "red",
          cycleCount: (session.cycleCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(tddSessions.id, sessionId));

      broadcastEvent(wss, {
        type: "tdd_cycle_completed",
        sessionId,
        cycleCount: (session.cycleCount || 0) + 1,
        timestamp: new Date(),
      });

      res.json({
        phase: "refactor",
        completed: true,
        nextPhase: "red",
        cycleCompleted: true,
        cycleCount: (session.cycleCount || 0) + 1,
        result,
      });
    } catch (error) {
      log(`TDD REFACTOR phase error: ${error}`);
      res.status(500).json({ error: "Failed to execute REFACTOR phase" });
    }
  });

  // Get session status
  router.get("/status/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;

      const [session] = await db
        .select()
        .from(tddSessions)
        .where(eq(tddSessions.id, sessionId));

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json({
        sessionId: session.id,
        projectId: session.projectId,
        currentPhase: session.currentPhase,
        cycleCount: session.cycleCount,
        status: session.status,
        testFilePath: session.testFilePath,
        implFilePath: session.implFilePath,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get session status" });
    }
  });

  // End TDD session
  router.post("/end/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;

      await db
        .update(tddSessions)
        .set({
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(tddSessions.id, sessionId));

      broadcastEvent(wss, {
        type: "tdd_session_ended",
        sessionId,
        timestamp: new Date(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  return router;
}

function broadcastEvent(wss: WebSocketServer, event: unknown) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(event));
    }
  });
}
