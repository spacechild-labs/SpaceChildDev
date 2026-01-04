import { Router } from "express";
import { db } from "../db";
import { patternBank, learningEpisodes } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { log } from "../utils/logger";

const router = Router();

// Get learning status for an agent
router.get("/status/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;

    // Get episode count
    const episodeCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(learningEpisodes)
      .where(eq(learningEpisodes.agentId, agentId));

    // Get average reward
    const avgReward = await db
      .select({ avg: sql<number>`avg(reward)` })
      .from(learningEpisodes)
      .where(eq(learningEpisodes.agentId, agentId));

    res.json({
      agentId,
      episodeCount: episodeCount[0]?.count || 0,
      averageReward: avgReward[0]?.avg || 0,
      algorithm: "q-learning",
      convergenceScore: 0.5, // Placeholder
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get learning status" });
  }
});

// List patterns for a framework
router.get("/patterns/:framework", async (req, res) => {
  try {
    const { framework } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const patterns = await db
      .select()
      .from(patternBank)
      .where(eq(patternBank.framework, framework))
      .orderBy(desc(patternBank.confidence))
      .limit(limit);

    res.json({
      framework,
      patterns,
      total: patterns.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get patterns" });
  }
});

// Get algorithm metrics
router.get("/metrics/:algorithm", async (req, res) => {
  try {
    const { algorithm } = req.params;

    const episodes = await db
      .select()
      .from(learningEpisodes)
      .where(eq(learningEpisodes.algorithm, algorithm))
      .orderBy(desc(learningEpisodes.createdAt))
      .limit(100);

    // Calculate metrics
    const totalReward = episodes.reduce((sum, e) => sum + (e.reward || 0), 0);
    const avgReward = episodes.length > 0 ? totalReward / episodes.length : 0;

    res.json({
      algorithm,
      episodeCount: episodes.length,
      averageReward: avgReward,
      totalReward,
      recentEpisodes: episodes.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get algorithm metrics" });
  }
});

// Set learning algorithm for an agent
router.post("/algorithm", async (req, res) => {
  try {
    const { agentId, algorithm } = req.body;

    const validAlgorithms = ["q-learning", "sarsa", "actor-critic", "ppo"];
    if (!validAlgorithms.includes(algorithm)) {
      return res.status(400).json({
        error: `Invalid algorithm. Must be one of: ${validAlgorithms.join(", ")}`,
      });
    }

    // Store algorithm preference (in a real implementation)
    log(`Set learning algorithm for ${agentId} to ${algorithm}`);

    res.json({
      success: true,
      agentId,
      algorithm,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to set algorithm" });
  }
});

// Record learning episode
router.post("/episode", async (req, res) => {
  try {
    const { agentId, state, action, reward, nextState, algorithm } = req.body;

    const [episode] = await db
      .insert(learningEpisodes)
      .values({
        id: uuid(),
        agentId,
        state,
        action,
        reward,
        nextState,
        algorithm: algorithm || "q-learning",
        createdAt: new Date(),
      })
      .returning();

    res.json({
      success: true,
      episodeId: episode.id,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to record episode" });
  }
});

// Store pattern
router.post("/patterns", async (req, res) => {
  try {
    const { framework, patternType, patternContent, confidence } = req.body;

    const [pattern] = await db
      .insert(patternBank)
      .values({
        id: uuid(),
        framework,
        patternType,
        patternContent,
        confidence: confidence || 0.5,
        qValue: 0,
        successCount: 0,
        failureCount: 0,
        createdAt: new Date(),
      })
      .returning();

    res.json({
      success: true,
      patternId: pattern.id,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to store pattern" });
  }
});

// Update pattern success/failure
router.patch("/patterns/:patternId", async (req, res) => {
  try {
    const { patternId } = req.params;
    const { success } = req.body;

    const [pattern] = await db
      .select()
      .from(patternBank)
      .where(eq(patternBank.id, patternId));

    if (!pattern) {
      return res.status(404).json({ error: "Pattern not found" });
    }

    const successCount = (pattern.successCount || 0) + (success ? 1 : 0);
    const failureCount = (pattern.failureCount || 0) + (success ? 0 : 1);
    const total = successCount + failureCount;
    const newConfidence = total > 0 ? successCount / total : 0.5;

    await db
      .update(patternBank)
      .set({
        successCount,
        failureCount,
        confidence: newConfidence,
        lastUsed: new Date(),
      })
      .where(eq(patternBank.id, patternId));

    res.json({
      success: true,
      patternId,
      newConfidence,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update pattern" });
  }
});

// Get learning summary
router.get("/summary", async (req, res) => {
  try {
    const [episodeStats] = await db
      .select({
        total: sql<number>`count(*)`,
        avgReward: sql<number>`avg(reward)`,
      })
      .from(learningEpisodes);

    const [patternStats] = await db
      .select({
        total: sql<number>`count(*)`,
        avgConfidence: sql<number>`avg(confidence)`,
      })
      .from(patternBank);

    res.json({
      episodes: {
        total: episodeStats?.total || 0,
        averageReward: episodeStats?.avgReward || 0,
      },
      patterns: {
        total: patternStats?.total || 0,
        averageConfidence: patternStats?.avgConfidence || 0,
      },
      algorithms: ["q-learning", "sarsa", "actor-critic", "ppo"],
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get learning summary" });
  }
});

export default router;
