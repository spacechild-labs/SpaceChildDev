import { Router } from "express";
import type { WebSocketServer } from "ws";
import { db } from "../db";
import { qualityMetrics, testRuns, flakyTests } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { QE_SKILLS } from "@shared/types/qe.types";
import { log } from "../utils/logger";

export default function qeRoutes(wss: WebSocketServer) {
  const router = Router();

  // List QE skills
  router.get("/skills", (_req, res) => {
    res.json({
      skills: QE_SKILLS,
      total: QE_SKILLS.length,
      byPhase: {
        phase1: QE_SKILLS.filter((s) => s.phase === 1).length,
        phase2: QE_SKILLS.filter((s) => s.phase === 2).length,
        phase3: QE_SKILLS.filter((s) => s.phase === 3).length,
      },
      byCategory: {
        core: QE_SKILLS.filter((s) => s.category === "core").length,
        methodology: QE_SKILLS.filter((s) => s.category === "methodology").length,
        technique: QE_SKILLS.filter((s) => s.category === "technique").length,
        specialized: QE_SKILLS.filter((s) => s.category === "specialized").length,
        strategic: QE_SKILLS.filter((s) => s.category === "strategic").length,
        infrastructure: QE_SKILLS.filter((s) => s.category === "infrastructure").length,
      },
    });
  });

  // Run quality analysis
  router.post("/analyze", async (req, res) => {
    try {
      const { projectId, files, options } = req.body;

      log(`Starting quality analysis for project ${projectId}`);

      // Broadcast analysis start
      broadcastEvent(wss, {
        type: "qe_analysis_started",
        projectId,
        timestamp: new Date(),
      });

      // TODO: Implement actual quality analysis
      // For now, return mock metrics
      const metrics = {
        coverage: 75.5,
        securityScore: 85.0,
        performanceScore: 78.0,
        accessibilityScore: 92.0,
        maintainabilityScore: 70.0,
        testQualityScore: 80.0,
        overallScore: 80.1,
        dimensions: {
          coverage: 75.5,
          security: 85.0,
          performance: 78.0,
          accessibility: 92.0,
          maintainability: 70.0,
          testQuality: 80.0,
          reliability: 88.0,
        },
      };

      // Store metrics
      const [storedMetrics] = await db
        .insert(qualityMetrics)
        .values({
          id: uuid(),
          projectId,
          ...metrics,
          recordedAt: new Date(),
        })
        .returning();

      broadcastEvent(wss, {
        type: "qe_analysis_completed",
        projectId,
        metrics,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        metrics,
        metricsId: storedMetrics.id,
      });
    } catch (error) {
      log(`Quality analysis error: ${error}`);
      res.status(500).json({ error: "Failed to run quality analysis" });
    }
  });

  // Generate tests
  router.post("/generate-tests", async (req, res) => {
    try {
      const { projectId, targetPath, framework, coverageThreshold } = req.body;

      log(`Generating tests for ${targetPath} using ${framework}`);

      // TODO: Implement actual test generation
      const generatedTests = {
        success: true,
        testsGenerated: 5,
        framework,
        targetPath,
        files: [
          {
            path: `${targetPath}.test.ts`,
            content: "// Generated test file",
            assertions: 10,
          },
        ],
      };

      res.json(generatedTests);
    } catch (error) {
      log(`Test generation error: ${error}`);
      res.status(500).json({ error: "Failed to generate tests" });
    }
  });

  // Get coverage report
  router.get("/coverage/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const [latestMetrics] = await db
        .select()
        .from(qualityMetrics)
        .where(eq(qualityMetrics.projectId, projectId))
        .orderBy(desc(qualityMetrics.recordedAt))
        .limit(1);

      if (!latestMetrics) {
        return res.json({
          coverage: 0,
          gaps: [],
          message: "No coverage data available",
        });
      }

      res.json({
        coverage: latestMetrics.coverage,
        lastUpdated: latestMetrics.recordedAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get coverage report" });
    }
  });

  // Run quality gate
  router.post("/quality-gate", async (req, res) => {
    try {
      const { projectId, conditions } = req.body;

      // Default conditions if not provided
      const gateConditions = conditions || [
        { metric: "coverage", operator: ">=", threshold: 80 },
        { metric: "securityScore", operator: ">=", threshold: 70 },
        { metric: "maintainabilityScore", operator: ">=", threshold: 60 },
      ];

      // Get latest metrics
      const [metrics] = await db
        .select()
        .from(qualityMetrics)
        .where(eq(qualityMetrics.projectId, projectId))
        .orderBy(desc(qualityMetrics.recordedAt))
        .limit(1);

      if (!metrics) {
        return res.json({
          status: "failed",
          message: "No metrics available for quality gate",
          conditions: gateConditions.map((c: any) => ({ ...c, passed: false, actual: 0 })),
        });
      }

      // Evaluate conditions
      const evaluatedConditions = gateConditions.map((condition: any) => {
        const actual = (metrics as any)[condition.metric] || 0;
        let passed = false;
        switch (condition.operator) {
          case ">=":
            passed = actual >= condition.threshold;
            break;
          case ">":
            passed = actual > condition.threshold;
            break;
          case "<=":
            passed = actual <= condition.threshold;
            break;
          case "<":
            passed = actual < condition.threshold;
            break;
          case "==":
            passed = actual === condition.threshold;
            break;
        }
        return { ...condition, actual, passed };
      });

      const allPassed = evaluatedConditions.every((c: any) => c.passed);

      res.json({
        status: allPassed ? "passed" : "failed",
        conditions: evaluatedConditions,
        timestamp: new Date(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to run quality gate" });
    }
  });

  // Get quality metrics history
  router.get("/metrics/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const limit = parseInt(req.query.limit as string) || 30;

      const metrics = await db
        .select()
        .from(qualityMetrics)
        .where(eq(qualityMetrics.projectId, projectId))
        .orderBy(desc(qualityMetrics.recordedAt))
        .limit(limit);

      res.json({
        metrics,
        total: metrics.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get metrics history" });
    }
  });

  // Get flaky tests
  router.get("/flaky/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);

      const flaky = await db
        .select()
        .from(flakyTests)
        .where(eq(flakyTests.projectId, projectId))
        .orderBy(desc(flakyTests.flakyScore));

      res.json({
        flakyTests: flaky,
        total: flaky.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get flaky tests" });
    }
  });

  // Get test runs history
  router.get("/test-runs/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const limit = parseInt(req.query.limit as string) || 20;

      const runs = await db
        .select()
        .from(testRuns)
        .where(eq(testRuns.projectId, projectId))
        .orderBy(desc(testRuns.createdAt))
        .limit(limit);

      res.json({
        testRuns: runs,
        total: runs.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get test runs" });
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
