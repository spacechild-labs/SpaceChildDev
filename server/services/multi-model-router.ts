import { log, error } from "../utils/logger";
import { db } from "../db";
import { aiProviderUsage } from "@shared/schema";

interface ModelConfig {
  provider: string;
  model: string;
  maxTokens: number;
  costPer1kTokens: number;
  capabilities: string[];
  contextWindow: number;
  latency: "low" | "medium" | "high";
}

interface RoutingContext {
  taskType: string;
  complexity: "low" | "medium" | "high";
  codeContext?: string;
  expectedOutputLength?: number;
  requiresReasoning?: boolean;
  budget?: number;
}

interface RoutingResult {
  provider: string;
  model: string;
  reason: string;
  estimatedCost: number;
  estimatedLatency: string;
}

const MODELS: ModelConfig[] = [
  // Fast & cheap models
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    maxTokens: 8192,
    costPer1kTokens: 0.001,
    capabilities: ["code", "analysis", "fast-response"],
    contextWindow: 200000,
    latency: "low",
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    maxTokens: 16384,
    costPer1kTokens: 0.00015,
    capabilities: ["code", "analysis", "fast-response"],
    contextWindow: 128000,
    latency: "low",
  },
  // Balanced models
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    maxTokens: 8192,
    costPer1kTokens: 0.003,
    capabilities: ["code", "analysis", "reasoning", "complex-tasks"],
    contextWindow: 200000,
    latency: "medium",
  },
  {
    provider: "openai",
    model: "gpt-4o",
    maxTokens: 16384,
    costPer1kTokens: 0.005,
    capabilities: ["code", "analysis", "reasoning", "complex-tasks"],
    contextWindow: 128000,
    latency: "medium",
  },
  // Premium models for complex reasoning
  {
    provider: "anthropic",
    model: "claude-3-opus-20240229",
    maxTokens: 4096,
    costPer1kTokens: 0.015,
    capabilities: ["code", "analysis", "reasoning", "complex-tasks", "creative"],
    contextWindow: 200000,
    latency: "high",
  },
  {
    provider: "openai",
    model: "o1-preview",
    maxTokens: 32768,
    costPer1kTokens: 0.015,
    capabilities: ["reasoning", "complex-tasks", "math", "science"],
    contextWindow: 128000,
    latency: "high",
  },
];

// Task type to complexity mapping
const TASK_COMPLEXITY: Record<string, "low" | "medium" | "high"> = {
  // Low complexity
  "code-completion": "low",
  "variable-naming": "low",
  "simple-refactor": "low",
  "lint-fix": "low",
  "format-code": "low",
  
  // Medium complexity
  "test-generation": "medium",
  "code-review": "medium",
  "bug-detection": "medium",
  "documentation": "medium",
  "api-design": "medium",
  
  // High complexity
  "architecture-design": "high",
  "security-analysis": "high",
  "performance-optimization": "high",
  "algorithm-design": "high",
  "system-design": "high",
};

export class MultiModelRouter {
  private usageCache: Map<string, { tokens: number; cost: number }> = new Map();

  route(context: RoutingContext): RoutingResult {
    const complexity = context.complexity || TASK_COMPLEXITY[context.taskType] || "medium";
    const needsReasoning = context.requiresReasoning || complexity === "high";
    const budget = context.budget;

    // Filter models by capabilities
    let candidates = MODELS.filter(m => {
      // Must support code
      if (!m.capabilities.includes("code") && context.codeContext) {
        return false;
      }
      
      // If needs reasoning, must have reasoning capability
      if (needsReasoning && !m.capabilities.includes("reasoning")) {
        return false;
      }
      
      // Check context window
      const contextLength = (context.codeContext?.length || 0) / 4; // rough token estimate
      if (contextLength > m.contextWindow) {
        return false;
      }
      
      return true;
    });

    // Apply budget filter if specified
    if (budget !== undefined) {
      const estimatedTokens = (context.expectedOutputLength || 1000) + 
        (context.codeContext?.length || 0) / 4;
      candidates = candidates.filter(m => 
        m.costPer1kTokens * (estimatedTokens / 1000) <= budget
      );
    }

    // Sort by cost-effectiveness for complexity
    candidates.sort((a, b) => {
      if (complexity === "low") {
        // Prefer cheapest and fastest
        return (a.costPer1kTokens + (a.latency === "low" ? 0 : 0.01)) -
               (b.costPer1kTokens + (b.latency === "low" ? 0 : 0.01));
      } else if (complexity === "medium") {
        // Balance cost and capability
        const aScore = a.costPer1kTokens * (a.capabilities.includes("reasoning") ? 0.8 : 1);
        const bScore = b.costPer1kTokens * (b.capabilities.includes("reasoning") ? 0.8 : 1);
        return aScore - bScore;
      } else {
        // Prefer capability over cost
        const aScore = a.capabilities.length * -1 + a.costPer1kTokens * 0.5;
        const bScore = b.capabilities.length * -1 + b.costPer1kTokens * 0.5;
        return aScore - bScore;
      }
    });

    const selected = candidates[0] || MODELS[0];
    const estimatedTokens = (context.expectedOutputLength || 1000) + 
      (context.codeContext?.length || 0) / 4;

    return {
      provider: selected.provider,
      model: selected.model,
      reason: this.buildReason(selected, complexity, context),
      estimatedCost: selected.costPer1kTokens * (estimatedTokens / 1000),
      estimatedLatency: selected.latency,
    };
  }

  async recordUsage(
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    userId?: string,
    projectId?: number
  ): Promise<void> {
    const modelConfig = MODELS.find(m => m.provider === provider && m.model === model);
    if (!modelConfig) return;

    const totalTokens = inputTokens + outputTokens;
    const cost = modelConfig.costPer1kTokens * (totalTokens / 1000);

    try {
      await db.insert(aiProviderUsage).values({
        provider,
        model,
        inputTokens,
        outputTokens,
        totalCost: cost.toString(),
        userId,
        projectId,
      });

      // Update cache
      const key = `${provider}:${model}`;
      const current = this.usageCache.get(key) || { tokens: 0, cost: 0 };
      this.usageCache.set(key, {
        tokens: current.tokens + totalTokens,
        cost: current.cost + cost,
      });

      log(`Usage recorded: ${provider}/${model} - ${totalTokens} tokens, $${cost.toFixed(4)}`);
    } catch (err) {
      error("Failed to record usage:", err);
    }
  }

  getCostSavings(): { saved: number; percentage: number } {
    // Calculate savings compared to always using most expensive model
    const expensiveModel = MODELS.reduce((a, b) => 
      a.costPer1kTokens > b.costPer1kTokens ? a : b
    );

    let totalTokens = 0;
    let actualCost = 0;

    for (const usage of this.usageCache.values()) {
      totalTokens += usage.tokens;
      actualCost += usage.cost;
    }

    const maxCost = expensiveModel.costPer1kTokens * (totalTokens / 1000);
    const saved = maxCost - actualCost;
    const percentage = maxCost > 0 ? (saved / maxCost) * 100 : 0;

    return { saved, percentage };
  }

  getAvailableModels(): ModelConfig[] {
    return [...MODELS];
  }

  private buildReason(
    model: ModelConfig,
    complexity: string,
    context: RoutingContext
  ): string {
    const reasons: string[] = [];

    if (complexity === "low") {
      reasons.push(`Low complexity task, using cost-efficient ${model.model}`);
    } else if (complexity === "high") {
      reasons.push(`High complexity task requires advanced reasoning`);
    }

    if (model.latency === "low") {
      reasons.push("Fast response time");
    }

    if (context.requiresReasoning && model.capabilities.includes("reasoning")) {
      reasons.push("Supports complex reasoning");
    }

    return reasons.join(". ") || `Selected ${model.model} for optimal balance`;
  }
}

// Singleton instance
export const multiModelRouter = new MultiModelRouter();
