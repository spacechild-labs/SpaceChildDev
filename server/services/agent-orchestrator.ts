import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";
import type { 
  AgentTask, 
  AgentStatus, 
  AgentDefinition,
  QE_AGENTS,
  TDD_SUBAGENTS 
} from "@shared/types/agent.types";
import { db } from "../db";
import { agentTasks, agentEvents, agentDefinitions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { log, error } from "../utils/logger";

interface TaskResult {
  success: boolean;
  output?: unknown;
  error?: string;
  duration: number;
}

interface AgentConfig {
  maxConcurrentTasks: number;
  defaultTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: AgentConfig = {
  maxConcurrentTasks: 5,
  defaultTimeout: 300000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000,
};

export class AgentOrchestrator extends EventEmitter {
  private activeTasks: Map<string, AgentTask> = new Map();
  private taskQueue: AgentTask[] = [];
  private config: AgentConfig;
  private isProcessing = false;

  constructor(config: Partial<AgentConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async executeAgent(
    agentType: string,
    input: unknown,
    projectId?: number,
    userId?: string
  ): Promise<string> {
    const taskId = uuidv4();
    
    const task: AgentTask = {
      id: taskId,
      agentType,
      status: "pending",
      input,
      projectId,
      createdAt: new Date(),
    };

    // Store in database
    await db.insert(agentTasks).values({
      id: taskId,
      agentType,
      status: "pending",
      input: JSON.stringify(input),
      projectId,
      userId,
    });

    // Emit event
    this.emit("task_created", { taskId, agentType, projectId });

    // Add to queue
    this.taskQueue.push(task);
    this.processQueue();

    return taskId;
  }

  async executeFleet(
    agents: Array<{ agentType: string; input?: unknown }>,
    projectId?: number,
    userId?: string
  ): Promise<string> {
    const fleetId = uuidv4();
    const taskIds: string[] = [];

    for (const agent of agents) {
      const taskId = await this.executeAgent(
        agent.agentType,
        agent.input || {},
        projectId,
        userId
      );
      taskIds.push(taskId);
    }

    this.emit("fleet_started", { fleetId, taskIds, projectId });

    return fleetId;
  }

  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.activeTasks.get(taskId);
    
    if (task) {
      task.status = "cancelled";
      this.activeTasks.delete(taskId);
      
      await db.update(agentTasks)
        .set({ status: "cancelled", completedAt: new Date() })
        .where(eq(agentTasks.id, taskId));
      
      this.emit("task_cancelled", { taskId });
      return true;
    }

    // Check queue
    const queueIndex = this.taskQueue.findIndex(t => t.id === taskId);
    if (queueIndex >= 0) {
      this.taskQueue.splice(queueIndex, 1);
      
      await db.update(agentTasks)
        .set({ status: "cancelled" })
        .where(eq(agentTasks.id, taskId));
      
      return true;
    }

    return false;
  }

  getTaskStatus(taskId: string): AgentTask | undefined {
    return this.activeTasks.get(taskId);
  }

  getActiveTasks(): AgentTask[] {
    return Array.from(this.activeTasks.values());
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (
      this.taskQueue.length > 0 &&
      this.activeTasks.size < this.config.maxConcurrentTasks
    ) {
      const task = this.taskQueue.shift();
      if (!task) continue;

      this.activeTasks.set(task.id, task);
      this.runTask(task).catch(err => {
        error(`Task ${task.id} failed:`, err);
      });
    }

    this.isProcessing = false;
  }

  private async runTask(task: AgentTask): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Update status to running
      task.status = "running";
      task.startedAt = new Date();
      
      await db.update(agentTasks)
        .set({ status: "running", startedAt: task.startedAt })
        .where(eq(agentTasks.id, task.id));

      this.emit("task_started", { 
        taskId: task.id, 
        agentType: task.agentType,
        timestamp: task.startedAt 
      });

      // Execute the agent
      const result = await this.executeAgentLogic(task);
      
      if (result.success) {
        task.status = "completed";
        task.output = result.output;
        task.completedAt = new Date();

        await db.update(agentTasks)
          .set({ 
            status: "completed", 
            output: JSON.stringify(result.output),
            completedAt: task.completedAt 
          })
          .where(eq(agentTasks.id, task.id));

        this.emit("task_completed", {
          taskId: task.id,
          agentType: task.agentType,
          output: result.output,
          duration: result.duration,
          timestamp: task.completedAt,
        });
      } else {
        throw new Error(result.error || "Agent execution failed");
      }
    } catch (err) {
      task.status = "failed";
      task.error = err instanceof Error ? err.message : "Unknown error";
      task.completedAt = new Date();

      await db.update(agentTasks)
        .set({ 
          status: "failed", 
          error: task.error,
          completedAt: task.completedAt 
        })
        .where(eq(agentTasks.id, task.id));

      this.emit("task_failed", {
        taskId: task.id,
        agentType: task.agentType,
        error: task.error,
        timestamp: task.completedAt,
      });
    } finally {
      this.activeTasks.delete(task.id);
      this.processQueue();
    }
  }

  private async executeAgentLogic(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();

    // Route to appropriate agent handler based on type
    switch (task.agentType) {
      // QE Main Agents
      case "qe-test-generator":
        return this.runTestGenerator(task);
      case "qe-coverage-analyzer":
        return this.runCoverageAnalyzer(task);
      case "qe-security-scanner":
        return this.runSecurityScanner(task);
      case "qe-performance-profiler":
        return this.runPerformanceProfiler(task);
      case "qe-accessibility-auditor":
        return this.runAccessibilityAuditor(task);
      case "qe-code-reviewer":
        return this.runCodeReviewer(task);
      case "qe-mutation-tester":
        return this.runMutationTester(task);
      case "qe-flaky-detector":
        return this.runFlakyDetector(task);
      case "qe-api-tester":
        return this.runAPITester(task);
      case "qe-integration-tester":
        return this.runIntegrationTester(task);
      
      // TDD Subagents
      case "tdd-red-phase":
        return this.runTDDRedPhase(task);
      case "tdd-green-phase":
        return this.runTDDGreenPhase(task);
      case "tdd-refactor-phase":
        return this.runTDDRefactorPhase(task);
      
      // Default handler
      default:
        return this.runGenericAgent(task);
    }
  }

  // Agent implementations (stubs for now - will integrate with AI providers)
  private async runTestGenerator(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    
    // Simulate test generation
    await this.simulateProgress(task.id, 5000);

    return {
      success: true,
      output: {
        testsGenerated: 5,
        files: ["test1.spec.ts", "test2.spec.ts"],
        coverage: { estimated: 75 },
      },
      duration: Date.now() - startTime,
    };
  }

  private async runCoverageAnalyzer(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 3000);

    return {
      success: true,
      output: {
        coverage: {
          lines: 78.5,
          branches: 65.2,
          functions: 82.1,
          statements: 79.3,
        },
        gaps: [
          { file: "src/utils.ts", lines: [45, 46, 47] },
        ],
      },
      duration: Date.now() - startTime,
    };
  }

  private async runSecurityScanner(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 4000);

    return {
      success: true,
      output: {
        vulnerabilities: [],
        score: 95,
        recommendations: ["Enable CORS restrictions", "Add rate limiting"],
      },
      duration: Date.now() - startTime,
    };
  }

  private async runPerformanceProfiler(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 6000);

    return {
      success: true,
      output: {
        metrics: {
          avgResponseTime: 145,
          p95ResponseTime: 320,
          throughput: 1500,
        },
        hotspots: [],
      },
      duration: Date.now() - startTime,
    };
  }

  private async runAccessibilityAuditor(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 3500);

    return {
      success: true,
      output: {
        score: 88,
        issues: [],
        wcagLevel: "AA",
      },
      duration: Date.now() - startTime,
    };
  }

  private async runCodeReviewer(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 4500);

    return {
      success: true,
      output: {
        quality: 85,
        suggestions: [],
        maintainability: "good",
      },
      duration: Date.now() - startTime,
    };
  }

  private async runMutationTester(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 8000);

    return {
      success: true,
      output: {
        mutationScore: 72,
        survivingMutants: 14,
        killedMutants: 36,
      },
      duration: Date.now() - startTime,
    };
  }

  private async runFlakyDetector(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 5000);

    return {
      success: true,
      output: {
        flakyTests: [],
        confidence: 0.92,
      },
      duration: Date.now() - startTime,
    };
  }

  private async runAPITester(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 4000);

    return {
      success: true,
      output: {
        endpoints: 12,
        passed: 12,
        failed: 0,
      },
      duration: Date.now() - startTime,
    };
  }

  private async runIntegrationTester(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 7000);

    return {
      success: true,
      output: {
        scenarios: 8,
        passed: 8,
        failed: 0,
      },
      duration: Date.now() - startTime,
    };
  }

  private async runTDDRedPhase(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 3000);

    return {
      success: true,
      output: {
        phase: "red",
        testFile: task.input,
        assertions: ["should handle empty input", "should validate format"],
        status: "failing",
      },
      duration: Date.now() - startTime,
    };
  }

  private async runTDDGreenPhase(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 4000);

    return {
      success: true,
      output: {
        phase: "green",
        implementation: "// Minimal implementation",
        testsPassing: true,
      },
      duration: Date.now() - startTime,
    };
  }

  private async runTDDRefactorPhase(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 3500);

    return {
      success: true,
      output: {
        phase: "refactor",
        improvements: ["Extracted helper function", "Improved naming"],
        testsPassing: true,
      },
      duration: Date.now() - startTime,
    };
  }

  private async runGenericAgent(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    await this.simulateProgress(task.id, 2000);

    return {
      success: true,
      output: { message: `Agent ${task.agentType} completed` },
      duration: Date.now() - startTime,
    };
  }

  private async simulateProgress(taskId: string, duration: number): Promise<void> {
    const steps = 10;
    const stepDuration = duration / steps;

    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      this.emit("task_progress", {
        taskId,
        progress: i * 10,
        timestamp: new Date(),
      });
    }
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator();
