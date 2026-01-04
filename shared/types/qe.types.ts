// =============================================================================
// Quality Engineering Types
// =============================================================================

export type TestFramework =
  | "jest"
  | "mocha"
  | "cypress"
  | "playwright"
  | "vitest"
  | "jasmine"
  | "ava";

export type SkillCategory =
  | "core"
  | "methodology"
  | "technique"
  | "specialized"
  | "strategic"
  | "infrastructure";

export interface QESkill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  phase: 1 | 2 | 3;
  documentation?: string;
}

// =============================================================================
// QE Skills Library (41 Skills)
// =============================================================================

export const QE_SKILLS: QESkill[] = [
  // Phase 1: Core Quality Engineering (18 skills)
  {
    id: "agentic-quality-engineering",
    name: "Agentic Quality Engineering",
    description: "AI-powered autonomous quality engineering practices",
    category: "core",
    phase: 1,
  },
  {
    id: "holistic-testing-pact",
    name: "Holistic Testing Pact",
    description: "Comprehensive testing philosophy and practices",
    category: "core",
    phase: 1,
  },
  {
    id: "context-driven-testing",
    name: "Context-Driven Testing",
    description: "Testing adapted to project context and needs",
    category: "methodology",
    phase: 1,
  },
  {
    id: "exploratory-testing-advanced",
    name: "Exploratory Testing (Advanced)",
    description: "Advanced exploratory testing techniques",
    category: "technique",
    phase: 1,
  },
  {
    id: "tdd-london-chicago",
    name: "TDD London/Chicago",
    description: "Test-Driven Development schools and practices",
    category: "methodology",
    phase: 1,
  },
  {
    id: "xp-practices",
    name: "XP Practices",
    description: "Extreme Programming quality practices",
    category: "methodology",
    phase: 1,
  },
  {
    id: "risk-based-testing",
    name: "Risk-Based Testing",
    description: "Risk-driven test prioritization",
    category: "methodology",
    phase: 1,
  },
  {
    id: "test-automation-strategy",
    name: "Test Automation Strategy",
    description: "Strategic test automation planning",
    category: "core",
    phase: 1,
  },
  {
    id: "api-testing-patterns",
    name: "API Testing Patterns",
    description: "Best practices for API testing",
    category: "technique",
    phase: 1,
  },
  {
    id: "performance-testing",
    name: "Performance Testing",
    description: "Load, stress, and performance testing",
    category: "technique",
    phase: 1,
  },
  {
    id: "security-testing",
    name: "Security Testing",
    description: "Security vulnerability testing",
    category: "technique",
    phase: 1,
  },
  {
    id: "code-review-quality",
    name: "Code Review Quality",
    description: "Quality-focused code review practices",
    category: "core",
    phase: 1,
  },
  {
    id: "refactoring-patterns",
    name: "Refactoring Patterns",
    description: "Safe refactoring with test support",
    category: "technique",
    phase: 1,
  },
  {
    id: "quality-metrics",
    name: "Quality Metrics",
    description: "Measuring and tracking quality",
    category: "core",
    phase: 1,
  },
  {
    id: "bug-reporting-excellence",
    name: "Bug Reporting Excellence",
    description: "Effective bug reporting practices",
    category: "core",
    phase: 1,
  },
  {
    id: "technical-writing",
    name: "Technical Writing",
    description: "Documentation and communication",
    category: "core",
    phase: 1,
  },
  {
    id: "consultancy-practices",
    name: "Consultancy Practices",
    description: "QE consulting and advisory skills",
    category: "core",
    phase: 1,
  },
  {
    id: "cicd-pipeline-qe-orchestrator",
    name: "CI/CD Pipeline QE Orchestrator",
    description: "Quality gates in CI/CD pipelines",
    category: "infrastructure",
    phase: 1,
  },

  // Phase 2: Expanded Skills (19 skills)
  {
    id: "regression-testing",
    name: "Regression Testing",
    description: "Systematic regression testing approaches",
    category: "technique",
    phase: 2,
  },
  {
    id: "shift-left-testing",
    name: "Shift-Left Testing",
    description: "Early testing in development lifecycle",
    category: "methodology",
    phase: 2,
  },
  {
    id: "shift-right-testing",
    name: "Shift-Right Testing",
    description: "Production testing and monitoring",
    category: "methodology",
    phase: 2,
  },
  {
    id: "test-design-techniques",
    name: "Test Design Techniques",
    description: "Equivalence partitioning, boundary analysis, etc.",
    category: "technique",
    phase: 2,
  },
  {
    id: "mutation-testing",
    name: "Mutation Testing",
    description: "Test quality assessment via mutations",
    category: "technique",
    phase: 2,
  },
  {
    id: "test-data-management",
    name: "Test Data Management",
    description: "Managing test data effectively",
    category: "infrastructure",
    phase: 2,
  },
  {
    id: "verification-quality",
    name: "Verification & Quality",
    description: "Verification and validation practices",
    category: "core",
    phase: 2,
  },
  {
    id: "accessibility-testing",
    name: "Accessibility Testing",
    description: "WCAG compliance and a11y testing",
    category: "specialized",
    phase: 2,
  },
  {
    id: "mobile-testing",
    name: "Mobile Testing",
    description: "Mobile-specific testing practices",
    category: "specialized",
    phase: 2,
  },
  {
    id: "database-testing",
    name: "Database Testing",
    description: "Database and data layer testing",
    category: "specialized",
    phase: 2,
  },
  {
    id: "contract-testing",
    name: "Contract Testing",
    description: "Consumer-driven contract testing",
    category: "technique",
    phase: 2,
  },
  {
    id: "chaos-engineering-resilience",
    name: "Chaos Engineering & Resilience",
    description: "Chaos testing for system resilience",
    category: "specialized",
    phase: 2,
  },
  {
    id: "compatibility-testing",
    name: "Compatibility Testing",
    description: "Cross-browser and cross-platform testing",
    category: "specialized",
    phase: 2,
  },
  {
    id: "localization-testing",
    name: "Localization Testing",
    description: "i18n and l10n testing",
    category: "specialized",
    phase: 2,
  },
  {
    id: "compliance-testing",
    name: "Compliance Testing",
    description: "Regulatory and standard compliance",
    category: "specialized",
    phase: 2,
  },
  {
    id: "visual-testing-advanced",
    name: "Visual Testing (Advanced)",
    description: "Visual regression and comparison testing",
    category: "technique",
    phase: 2,
  },
  {
    id: "test-environment-management",
    name: "Test Environment Management",
    description: "Managing test environments",
    category: "infrastructure",
    phase: 2,
  },
  {
    id: "test-reporting-analytics",
    name: "Test Reporting & Analytics",
    description: "Test result analysis and reporting",
    category: "infrastructure",
    phase: 2,
  },
  {
    id: "testability-scoring",
    name: "Testability Scoring",
    description: "Assessing code testability",
    category: "core",
    phase: 2,
  },

  // Phase 3: Advanced Strategic (4 skills)
  {
    id: "six-thinking-hats",
    name: "Six Thinking Hats",
    description: "De Bono's thinking method for QE",
    category: "strategic",
    phase: 3,
  },
  {
    id: "brutal-honesty-review",
    name: "Brutal Honesty Review",
    description: "No-holds-barred quality assessment",
    category: "strategic",
    phase: 3,
  },
  {
    id: "sherlock-review",
    name: "Sherlock Review",
    description: "Deductive reasoning for bug hunting",
    category: "strategic",
    phase: 3,
  },
  {
    id: "n8n-workflow-testing",
    name: "n8n Workflow Testing",
    description: "Testing n8n automation workflows",
    category: "specialized",
    phase: 3,
  },
];

// =============================================================================
// Learning System Types
// =============================================================================

export type LearningAlgorithm = "q-learning" | "sarsa" | "actor-critic" | "ppo";

export interface LearningState {
  agentId: string;
  currentState: number[];
  qTable: Map<string, number>;
  episodeCount: number;
  totalReward: number;
  algorithm: LearningAlgorithm;
}

export interface Pattern {
  id: string;
  framework: TestFramework;
  patternType: string;
  content: unknown;
  confidence: number;
  qValue: number;
  usageCount: number;
}

export interface LearningMetrics {
  agentId: string;
  algorithm: LearningAlgorithm;
  episodeCount: number;
  averageReward: number;
  convergenceScore: number;
  patternsLearned: number;
  successRate: number;
}

// =============================================================================
// Quality Metrics Types
// =============================================================================

export interface QualityDimensions {
  coverage: number;
  security: number;
  performance: number;
  accessibility: number;
  maintainability: number;
  testQuality: number;
  reliability: number;
}

export interface QualityTrend {
  date: Date;
  dimensions: QualityDimensions;
  overallScore: number;
}

export interface QualityGate {
  id: string;
  name: string;
  conditions: QualityCondition[];
  status: "passed" | "failed" | "warning";
}

export interface QualityCondition {
  metric: keyof QualityDimensions;
  operator: ">" | ">=" | "<" | "<=" | "==";
  threshold: number;
  actual: number;
  passed: boolean;
}

// =============================================================================
// TDD Session Types
// =============================================================================

export interface TDDSession {
  id: string;
  projectId: number;
  currentPhase: "red" | "green" | "refactor";
  cycleCount: number;
  testFilePath?: string;
  implFilePath?: string;
  assertions: TDDAssertion[];
  status: "active" | "completed" | "paused";
  createdAt: Date;
  updatedAt: Date;
}

export interface TDDAssertion {
  id: string;
  description: string;
  testCode: string;
  status: "pending" | "failing" | "passing";
  implCode?: string;
}

export interface TDDCycle {
  cycleNumber: number;
  redPhase: TDDPhaseResult;
  greenPhase: TDDPhaseResult;
  refactorPhase: TDDPhaseResult;
  duration: number;
}

export interface TDDPhaseResult {
  phase: "red" | "green" | "refactor";
  status: "completed" | "skipped" | "failed";
  testsAdded?: number;
  testsModified?: number;
  linesChanged?: number;
  duration: number;
}

// =============================================================================
// Visualization Types
// =============================================================================

export interface MindMapNode {
  id: string;
  label: string;
  type: "agent" | "task" | "test" | "file" | "metric";
  status?: "idle" | "running" | "completed" | "failed";
  data?: unknown;
}

export interface MindMapEdge {
  source: string;
  target: string;
  label?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: string;
  agentId?: string;
  taskId?: string;
  message: string;
  data?: unknown;
}

export interface RadarChartData {
  dimension: string;
  value: number;
  fullMark: number;
}
