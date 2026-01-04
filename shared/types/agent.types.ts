// =============================================================================
// Agent Types - Based on agentic-qe fleet architecture
// =============================================================================

export type AgentCategory = 
  | "testing"
  | "security"
  | "performance"
  | "accessibility"
  | "coverage"
  | "tdd"
  | "quality"
  | "documentation";

export type AgentStatus = 
  | "idle"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type TDDPhase = "red" | "green" | "refactor";

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  icon: string;
  systemPrompt: string;
  tools: string[];
  defaultModel: string;
  isSubagent?: boolean;
  parentAgent?: string;
}

export interface AgentTask {
  id: string;
  agentType: string;
  status: AgentStatus;
  input: AgentInput;
  output?: AgentOutput;
  progress?: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  tokensUsed?: number;
  costUsd?: number;
  modelUsed?: string;
}

export interface AgentInput {
  projectId?: number;
  files?: string[];
  targetPath?: string;
  testFramework?: string;
  coverageThreshold?: number;
  options?: Record<string, unknown>;
  prompt?: string;
}

export interface AgentOutput {
  success: boolean;
  result?: unknown;
  generatedCode?: string;
  tests?: TestResult[];
  coverage?: CoverageReport;
  recommendations?: Recommendation[];
  metrics?: Record<string, number>;
}

export interface TestResult {
  name: string;
  path: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
  assertions?: number;
}

export interface CoverageReport {
  lines: number;
  branches: number;
  functions: number;
  statements: number;
  uncoveredLines: number[];
  gaps: CoverageGap[];
}

export interface CoverageGap {
  file: string;
  startLine: number;
  endLine: number;
  type: "branch" | "statement" | "function";
  suggestion?: string;
}

export interface Recommendation {
  type: "test" | "refactor" | "security" | "performance" | "accessibility";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestedFix?: string;
}

// =============================================================================
// Main QE Agents (20)
// =============================================================================

export const QE_AGENTS: AgentDefinition[] = [
  {
    id: "qe-test-generator",
    name: "Test Generator",
    description: "Generates comprehensive test suites with high coverage",
    category: "testing",
    icon: "TestTube",
    systemPrompt: "You are an expert test engineer...",
    tools: ["file_read", "file_write", "test_run"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-coverage-analyzer",
    name: "Coverage Analyzer",
    description: "Analyzes code coverage and identifies gaps",
    category: "coverage",
    icon: "PieChart",
    systemPrompt: "You are a coverage analysis expert...",
    tools: ["file_read", "coverage_run", "report_generate"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-security-scanner",
    name: "Security Scanner",
    description: "Detects security vulnerabilities and suggests fixes",
    category: "security",
    icon: "Shield",
    systemPrompt: "You are a security expert...",
    tools: ["file_read", "security_scan", "cve_lookup"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-performance-tester",
    name: "Performance Tester",
    description: "Runs performance tests and benchmarks",
    category: "performance",
    icon: "Zap",
    systemPrompt: "You are a performance testing expert...",
    tools: ["file_read", "perf_run", "benchmark"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-accessibility",
    name: "Accessibility Tester",
    description: "Tests for WCAG compliance and accessibility",
    category: "accessibility",
    icon: "Accessibility",
    systemPrompt: "You are an accessibility expert...",
    tools: ["file_read", "a11y_scan", "wcag_check"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-api-tester",
    name: "API Tester",
    description: "Tests API endpoints and validates contracts",
    category: "testing",
    icon: "Globe",
    systemPrompt: "You are an API testing expert...",
    tools: ["http_request", "schema_validate", "contract_test"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-mutation-tester",
    name: "Mutation Tester",
    description: "Runs mutation testing to assess test quality",
    category: "quality",
    icon: "Dna",
    systemPrompt: "You are a mutation testing expert...",
    tools: ["file_read", "mutation_run", "report_generate"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-flaky-detector",
    name: "Flaky Test Detector",
    description: "Identifies flaky tests with ML-powered analysis",
    category: "quality",
    icon: "AlertTriangle",
    systemPrompt: "You are an expert at detecting flaky tests...",
    tools: ["test_history_read", "pattern_analyze", "report_generate"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-visual-tester",
    name: "Visual Regression Tester",
    description: "Detects visual regressions in UI",
    category: "testing",
    icon: "Eye",
    systemPrompt: "You are a visual testing expert...",
    tools: ["screenshot_capture", "image_compare", "report_generate"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-contract-tester",
    name: "Contract Tester",
    description: "Tests consumer-provider contracts (Pact)",
    category: "testing",
    icon: "FileCheck",
    systemPrompt: "You are a contract testing expert...",
    tools: ["pact_generate", "pact_verify", "contract_publish"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-code-complexity",
    name: "Code Complexity Analyzer",
    description: "Analyzes code complexity and maintainability",
    category: "quality",
    icon: "GitBranch",
    systemPrompt: "You are a code quality expert...",
    tools: ["file_read", "complexity_analyze", "report_generate"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-regression-hunter",
    name: "Regression Hunter",
    description: "Detects potential regressions from code changes",
    category: "testing",
    icon: "Bug",
    systemPrompt: "You are a regression detection expert...",
    tools: ["git_diff", "impact_analyze", "test_suggest"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-chaos-engineer",
    name: "Chaos Engineer",
    description: "Runs chaos engineering experiments",
    category: "testing",
    icon: "Flame",
    systemPrompt: "You are a chaos engineering expert...",
    tools: ["chaos_inject", "resilience_test", "report_generate"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-database-tester",
    name: "Database Tester",
    description: "Tests database operations and migrations",
    category: "testing",
    icon: "Database",
    systemPrompt: "You are a database testing expert...",
    tools: ["db_query", "migration_test", "data_validate"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-localization",
    name: "Localization Tester",
    description: "Tests i18n and l10n implementations",
    category: "testing",
    icon: "Languages",
    systemPrompt: "You are a localization testing expert...",
    tools: ["i18n_scan", "locale_test", "report_generate"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-compliance",
    name: "Compliance Tester",
    description: "Tests for regulatory compliance",
    category: "quality",
    icon: "ClipboardCheck",
    systemPrompt: "You are a compliance testing expert...",
    tools: ["compliance_scan", "audit_check", "report_generate"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-code-intelligence",
    name: "Code Intelligence",
    description: "Smart context analysis with 80% token reduction",
    category: "quality",
    icon: "Brain",
    systemPrompt: "You are a code intelligence expert...",
    tools: ["ast_analyze", "dependency_graph", "context_extract"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-quality-gate",
    name: "Quality Gate",
    description: "Enforces quality gates before deployment",
    category: "quality",
    icon: "ShieldCheck",
    systemPrompt: "You are a quality gate enforcer...",
    tools: ["metrics_check", "threshold_validate", "gate_decide"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-testability-scorer",
    name: "Testability Scorer",
    description: "Scores code testability and suggests improvements",
    category: "quality",
    icon: "Star",
    systemPrompt: "You are a testability expert...",
    tools: ["file_read", "testability_analyze", "report_generate"],
    defaultModel: "claude-3-5-sonnet",
  },
  {
    id: "qe-documentation",
    name: "Test Documentation",
    description: "Generates test documentation and reports",
    category: "documentation",
    icon: "FileText",
    systemPrompt: "You are a technical documentation expert...",
    tools: ["test_read", "doc_generate", "report_publish"],
    defaultModel: "claude-3-5-sonnet",
  },
];

// =============================================================================
// TDD Subagents (11)
// =============================================================================

export const TDD_SUBAGENTS: AgentDefinition[] = [
  {
    id: "tdd-red-phase",
    name: "RED Phase",
    description: "Writes failing tests first",
    category: "tdd",
    icon: "XCircle",
    systemPrompt: "You are the RED phase agent in TDD...",
    tools: ["file_write", "test_run"],
    defaultModel: "claude-3-5-sonnet",
    isSubagent: true,
  },
  {
    id: "tdd-green-phase",
    name: "GREEN Phase",
    description: "Writes minimal code to pass tests",
    category: "tdd",
    icon: "CheckCircle",
    systemPrompt: "You are the GREEN phase agent in TDD...",
    tools: ["file_read", "file_write", "test_run"],
    defaultModel: "claude-3-5-sonnet",
    isSubagent: true,
  },
  {
    id: "tdd-refactor-phase",
    name: "REFACTOR Phase",
    description: "Cleans up and optimizes code",
    category: "tdd",
    icon: "RefreshCw",
    systemPrompt: "You are the REFACTOR phase agent in TDD...",
    tools: ["file_read", "file_write", "test_run"],
    defaultModel: "claude-3-5-sonnet",
    isSubagent: true,
  },
  {
    id: "tdd-assertion-builder",
    name: "Assertion Builder",
    description: "Generates meaningful test assertions",
    category: "tdd",
    icon: "CheckSquare",
    systemPrompt: "You are an assertion building expert...",
    tools: ["ast_analyze", "assertion_generate"],
    defaultModel: "claude-3-5-sonnet",
    isSubagent: true,
  },
  {
    id: "tdd-mock-generator",
    name: "Mock Generator",
    description: "Creates mocks and stubs",
    category: "tdd",
    icon: "Copy",
    systemPrompt: "You are a mocking expert...",
    tools: ["file_read", "mock_generate", "spy_generate"],
    defaultModel: "claude-3-5-sonnet",
    isSubagent: true,
  },
  {
    id: "tdd-fixture-builder",
    name: "Fixture Builder",
    description: "Creates test data fixtures",
    category: "tdd",
    icon: "Package",
    systemPrompt: "You are a test fixture expert...",
    tools: ["schema_analyze", "fixture_generate"],
    defaultModel: "claude-3-5-sonnet",
    isSubagent: true,
  },
  {
    id: "tdd-integration",
    name: "Integration Test Orchestrator",
    description: "Orchestrates integration tests",
    category: "tdd",
    icon: "Link",
    systemPrompt: "You are an integration testing expert...",
    tools: ["test_orchestrate", "service_mock", "test_run"],
    defaultModel: "claude-3-5-sonnet",
    isSubagent: true,
  },
  {
    id: "tdd-e2e",
    name: "E2E Test Coordinator",
    description: "Coordinates end-to-end tests",
    category: "tdd",
    icon: "Route",
    systemPrompt: "You are an E2E testing expert...",
    tools: ["browser_control", "scenario_generate", "test_run"],
    defaultModel: "claude-3-5-sonnet",
    isSubagent: true,
  },
  {
    id: "tdd-unit",
    name: "Unit Test Specialist",
    description: "Specializes in unit tests",
    category: "tdd",
    icon: "Box",
    systemPrompt: "You are a unit testing expert...",
    tools: ["file_read", "unit_test_generate", "test_run"],
    defaultModel: "claude-3-5-sonnet",
    isSubagent: true,
  },
  {
    id: "tdd-validator",
    name: "TDD Validator",
    description: "Verifies TDD compliance",
    category: "tdd",
    icon: "BadgeCheck",
    systemPrompt: "You are a TDD compliance validator...",
    tools: ["git_history_read", "tdd_validate", "report_generate"],
    defaultModel: "claude-3-5-sonnet",
    isSubagent: true,
  },
  {
    id: "tdd-cycle-manager",
    name: "TDD Cycle Manager",
    description: "Manages RED/GREEN/REFACTOR cycle",
    category: "tdd",
    icon: "RotateCw",
    systemPrompt: "You are the TDD cycle orchestrator...",
    tools: ["phase_coordinate", "test_run", "status_track"],
    defaultModel: "claude-3-5-sonnet",
    isSubagent: true,
  },
];

export const ALL_AGENTS = [...QE_AGENTS, ...TDD_SUBAGENTS];

// =============================================================================
// Agent Events (for real-time visualization)
// =============================================================================

export interface AgentEvent {
  id: string;
  taskId: string;
  agentType: string;
  eventType: AgentEventType;
  payload: unknown;
  timestamp: Date;
}

export type AgentEventType =
  | "task_started"
  | "task_progress"
  | "task_completed"
  | "task_failed"
  | "test_started"
  | "test_passed"
  | "test_failed"
  | "coverage_updated"
  | "file_generated"
  | "recommendation_added"
  | "phase_changed";

// =============================================================================
// Multi-Model Router Types
// =============================================================================

export interface ModelConfig {
  id: string;
  name: string;
  provider: "anthropic" | "openai" | "groq";
  costPer1kTokens: number;
  maxTokens: number;
  capabilities: string[];
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    costPer1kTokens: 0.003,
    maxTokens: 200000,
    capabilities: ["code", "reasoning", "analysis"],
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    costPer1kTokens: 0.00025,
    maxTokens: 200000,
    capabilities: ["code", "fast"],
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    costPer1kTokens: 0.005,
    maxTokens: 128000,
    capabilities: ["code", "reasoning", "vision"],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    costPer1kTokens: 0.00015,
    maxTokens: 128000,
    capabilities: ["code", "fast"],
  },
  {
    id: "llama-3.1-70b",
    name: "Llama 3.1 70B",
    provider: "groq",
    costPer1kTokens: 0.00059,
    maxTokens: 131072,
    capabilities: ["code", "fast"],
  },
];
