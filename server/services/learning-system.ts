import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { learningEpisodes, patternBank } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { log, error } from "../utils/logger";

interface LearningEpisode {
  id: string;
  agentType: string;
  taskType: string;
  input: unknown;
  output: unknown;
  reward: number;
  state: unknown;
  action: string;
  nextState: unknown;
  metadata?: unknown;
  createdAt: Date;
}

interface Pattern {
  id: string;
  name: string;
  description: string;
  category: string;
  conditions: unknown;
  actions: unknown;
  effectiveness: number;
  usageCount: number;
  lastUsed?: Date;
}

interface QTableEntry {
  state: string;
  action: string;
  value: number;
}

type LearningAlgorithm = "q-learning" | "sarsa" | "a2c" | "ppo";

interface LearningConfig {
  algorithm: LearningAlgorithm;
  learningRate: number;
  discountFactor: number;
  explorationRate: number;
  explorationDecay: number;
  minExploration: number;
}

const DEFAULT_CONFIG: LearningConfig = {
  algorithm: "q-learning",
  learningRate: 0.1,
  discountFactor: 0.95,
  explorationRate: 1.0,
  explorationDecay: 0.995,
  minExploration: 0.1,
};

export class LearningSystem extends EventEmitter {
  private config: LearningConfig;
  private qTable: Map<string, Map<string, number>> = new Map();
  private episodeCount = 0;
  private totalReward = 0;
  private recentRewards: number[] = [];

  constructor(config: Partial<LearningConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadQTable();
  }

  setAlgorithm(algorithm: LearningAlgorithm): void {
    this.config.algorithm = algorithm;
    log(`Learning algorithm set to: ${algorithm}`);
  }

  async recordEpisode(episode: Omit<LearningEpisode, "id" | "createdAt">): Promise<string> {
    const id = uuidv4();
    
    try {
      await db.insert(learningEpisodes).values({
        id,
        agentType: episode.agentType,
        taskType: episode.taskType,
        state: JSON.stringify(episode.state),
        action: episode.action,
        reward: episode.reward.toString(),
        nextState: JSON.stringify(episode.nextState),
        algorithmUsed: this.config.algorithm,
      });

      // Update learning
      this.updateLearning(episode);
      
      this.episodeCount++;
      this.totalReward += episode.reward;
      this.recentRewards.push(episode.reward);
      if (this.recentRewards.length > 100) {
        this.recentRewards.shift();
      }

      this.emit("episode_recorded", { id, reward: episode.reward });
      
      return id;
    } catch (err) {
      error("Failed to record episode:", err);
      throw err;
    }
  }

  private updateLearning(episode: Omit<LearningEpisode, "id" | "createdAt">): void {
    const stateKey = this.stateToKey(episode.state);
    const nextStateKey = this.stateToKey(episode.nextState);

    switch (this.config.algorithm) {
      case "q-learning":
        this.qLearningUpdate(stateKey, episode.action, episode.reward, nextStateKey);
        break;
      case "sarsa":
        this.sarsaUpdate(stateKey, episode.action, episode.reward, nextStateKey);
        break;
      case "a2c":
      case "ppo":
        // These require neural network - simplified for now
        this.qLearningUpdate(stateKey, episode.action, episode.reward, nextStateKey);
        break;
    }

    // Decay exploration
    this.config.explorationRate = Math.max(
      this.config.minExploration,
      this.config.explorationRate * this.config.explorationDecay
    );
  }

  private qLearningUpdate(
    state: string,
    action: string,
    reward: number,
    nextState: string
  ): void {
    const currentQ = this.getQValue(state, action);
    const maxNextQ = this.getMaxQValue(nextState);
    
    const newQ = currentQ + this.config.learningRate * (
      reward + this.config.discountFactor * maxNextQ - currentQ
    );

    this.setQValue(state, action, newQ);
  }

  private sarsaUpdate(
    state: string,
    action: string,
    reward: number,
    nextState: string
  ): void {
    const currentQ = this.getQValue(state, action);
    const nextAction = this.selectAction(nextState, this.getActions(nextState));
    const nextQ = this.getQValue(nextState, nextAction);
    
    const newQ = currentQ + this.config.learningRate * (
      reward + this.config.discountFactor * nextQ - currentQ
    );

    this.setQValue(state, action, newQ);
  }

  selectAction(state: unknown, availableActions: string[]): string {
    const stateKey = this.stateToKey(state);

    // Epsilon-greedy exploration
    if (Math.random() < this.config.explorationRate) {
      return availableActions[Math.floor(Math.random() * availableActions.length)];
    }

    // Exploit: choose best action
    let bestAction = availableActions[0];
    let bestValue = -Infinity;

    for (const action of availableActions) {
      const value = this.getQValue(stateKey, action);
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }

    return bestAction;
  }

  async storePattern(pattern: Omit<Pattern, "id">): Promise<string> {
    const id = uuidv4();
    
    try {
      await db.insert(patternBank).values({
        id,
        name: pattern.name,
        description: pattern.description,
        category: pattern.category,
        conditions: JSON.stringify(pattern.conditions),
        actions: JSON.stringify(pattern.actions),
        effectiveness: pattern.effectiveness.toString(),
        usageCount: pattern.usageCount,
      });

      this.emit("pattern_stored", { id, name: pattern.name });
      return id;
    } catch (err) {
      error("Failed to store pattern:", err);
      throw err;
    }
  }

  async getPatterns(category?: string): Promise<Pattern[]> {
    try {
      const query = category 
        ? db.select().from(patternBank).where(eq(patternBank.category, category))
        : db.select().from(patternBank);
      
      const results = await query.orderBy(desc(patternBank.effectiveness));
      
      return results.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description || "",
        category: r.category,
        conditions: r.conditions,
        actions: r.actions,
        effectiveness: parseFloat(r.effectiveness || "0"),
        usageCount: r.usageCount || 0,
        lastUsed: r.lastUsed || undefined,
      }));
    } catch (err) {
      error("Failed to get patterns:", err);
      return [];
    }
  }

  async updatePatternEffectiveness(patternId: string, effectiveness: number): Promise<void> {
    try {
      await db.update(patternBank)
        .set({ 
          effectiveness: effectiveness.toString(),
          lastUsed: new Date(),
          usageCount: 1, // Would need to increment properly
        })
        .where(eq(patternBank.id, patternId));
    } catch (err) {
      error("Failed to update pattern:", err);
    }
  }

  getStatus(): {
    algorithm: LearningAlgorithm;
    episodeCount: number;
    averageReward: number;
    explorationRate: number;
    qTableSize: number;
  } {
    const avgReward = this.recentRewards.length > 0
      ? this.recentRewards.reduce((a, b) => a + b, 0) / this.recentRewards.length
      : 0;

    let qTableSize = 0;
    for (const actions of this.qTable.values()) {
      qTableSize += actions.size;
    }

    return {
      algorithm: this.config.algorithm,
      episodeCount: this.episodeCount,
      averageReward: avgReward,
      explorationRate: this.config.explorationRate,
      qTableSize,
    };
  }

  getAlgorithmMetrics(): Record<string, number> {
    const avgReward = this.recentRewards.length > 0
      ? this.recentRewards.reduce((a, b) => a + b, 0) / this.recentRewards.length
      : 0;

    return {
      learningRate: this.config.learningRate,
      discountFactor: this.config.discountFactor,
      explorationRate: this.config.explorationRate,
      averageReward: avgReward,
      episodeCount: this.episodeCount,
      convergenceRate: this.calculateConvergenceRate(),
    };
  }

  private calculateConvergenceRate(): number {
    if (this.recentRewards.length < 20) return 0;
    
    const recent = this.recentRewards.slice(-20);
    const older = this.recentRewards.slice(-40, -20);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    return Math.max(0, Math.min(1, (recentAvg - olderAvg + 1) / 2));
  }

  private getQValue(state: string, action: string): number {
    const stateActions = this.qTable.get(state);
    if (!stateActions) return 0;
    return stateActions.get(action) || 0;
  }

  private setQValue(state: string, action: string, value: number): void {
    let stateActions = this.qTable.get(state);
    if (!stateActions) {
      stateActions = new Map();
      this.qTable.set(state, stateActions);
    }
    stateActions.set(action, value);
  }

  private getMaxQValue(state: string): number {
    const stateActions = this.qTable.get(state);
    if (!stateActions || stateActions.size === 0) return 0;
    
    let maxValue = -Infinity;
    for (const value of stateActions.values()) {
      if (value > maxValue) maxValue = value;
    }
    return maxValue;
  }

  private getActions(state: string): string[] {
    const stateActions = this.qTable.get(state);
    if (!stateActions) return [];
    return Array.from(stateActions.keys());
  }

  private stateToKey(state: unknown): string {
    return JSON.stringify(state);
  }

  private async loadQTable(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const episodes = await db.select()
        .from(learningEpisodes)
        .where(gte(learningEpisodes.createdAt, thirtyDaysAgo))
        .orderBy(desc(learningEpisodes.createdAt))
        .limit(10000);

      for (const episode of episodes) {
        if (episode.state && episode.action && episode.reward) {
          const stateKey = this.stateToKey(episode.state);
          const reward = parseFloat(episode.reward);
          this.setQValue(stateKey, episode.action, reward);
        }
      }

      log(`Loaded ${episodes.length} episodes into Q-table`);
    } catch (err) {
      error("Failed to load Q-table:", err);
    }
  }
}

// Singleton instance
export const learningSystem = new LearningSystem();
