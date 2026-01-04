# SpaceChildDev Architecture

## Vision
SpaceChildDev is an Agentic IDE that combines the best of VS Code's editing experience, GooseNeutron's autonomous AI agents, agentic-qe's quality engineering fleet, and SpaceChild's consciousness-driven development platform.

**URL:** dev.spacechild.love

## Core Pillars

### 1. VS Code-Inspired Editor Core
- **Monaco Editor** - Full-featured code editor with IntelliSense, syntax highlighting, multi-cursor support
- **File Explorer** - Tree-based file navigation with drag-drop, context menus
- **Integrated Terminal** - PTY-based terminal with shell integration
- **Split Panels** - Resizable panel layout (editor, sidebar, terminal, AI panel)
- **Command Palette** - Quick command access with fuzzy search
- **Extension System** - Plugin architecture for custom tools

### 2. GooseNeutron-Style Agentic Automation
- **Autonomous Task Execution** - AI agents that can build entire projects from scratch
- **Multi-LLM Support** - Configurable AI providers (Anthropic, OpenAI, Groq, etc.)
- **MCP Integration** - Model Context Protocol server support for tool use
- **Code Generation & Execution** - Write, execute, and iterate on code
- **Intelligent Debugging** - Autonomous error detection and fixing
- **Workflow Orchestration** - Complex multi-step task automation

### 3. Agentic-QE Quality Engineering Fleet
- **31 QE Agents** - 20 main agents + 11 TDD subagents
- **41 QE Skills** - Comprehensive quality engineering skill library
- **Self-Learning System** - Q-Learning with pattern bank (85%+ accuracy)
- **Multi-Framework Testing** - Jest, Mocha, Cypress, Playwright, Vitest support
- **TDD Workflow** - RED/GREEN/REFACTOR phase management
- **Flaky Test Detection** - ML-powered detection (90%+ accuracy)
- **Real-Time Visualization** - MindMap, Quality Metrics, Timeline dashboards

### 4. SpaceChild Consciousness Integration
- **Space Child Auth** - Unified authentication across apps
- **Trifecta Integration** - ninja-craft-hub and angel-informant connectivity
- **Project Memory** - Persistent learning across sessions
- **Collaboration** - Real-time multi-user editing
- **PWA Support** - Offline-capable progressive web app

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SpaceChildDev                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Frontend (React + Vite)                           │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │   Monaco     │  │    File      │  │   Terminal   │  │    AI       │  │   │
│  │  │   Editor     │  │   Explorer   │  │   (xterm.js) │  │   Panel     │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │                     QE Visualization Dashboard                    │   │   │
│  │  │  ┌───────────┐  ┌───────────────┐  ┌───────────────────────────┐ │   │   │
│  │  │  │  MindMap  │  │ Quality Radar │  │   Agent Timeline          │ │   │   │
│  │  │  │  (Cyto)   │  │  (Recharts)   │  │   (react-window)          │ │   │   │
│  │  │  └───────────┘  └───────────────┘  └───────────────────────────┘ │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      │ WebSocket / REST                         │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Backend (Express + Node.js)                       │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    Agentic Orchestration Layer                      │ │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │ │   │
│  │  │  │  Agent Fleet │  │   Task       │  │      MCP Server          │  │ │   │
│  │  │  │  Manager     │  │   Queue      │  │      Integration         │  │ │   │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    Quality Engineering Engine                       │ │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │ │   │
│  │  │  │  QE Agents   │  │  Pattern     │  │    Learning System       │  │ │   │
│  │  │  │  (31 total)  │  │  Bank        │  │    (Q-Learning/RL)       │  │ │   │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │ │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │ │   │
│  │  │  │  TDD Engine  │  │  Flaky Test  │  │    Coverage Analyzer     │  │ │   │
│  │  │  │  (11 subs)   │  │  Detector    │  │    (O(log n))            │  │ │   │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    AI Provider Layer                                │ │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │ │   │
│  │  │  │ Anthropic│  │  OpenAI  │  │   Groq   │  │  Multi-Model      │   │ │   │
│  │  │  │  Claude  │  │  GPT-4   │  │  Llama   │  │  Router (70-81%)  │   │ │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘   │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     Data Layer (PostgreSQL + SQLite)                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │   Projects   │  │   Agents     │  │   Patterns   │  │  Sessions   │  │   │
│  │  │   & Files    │  │   & Tasks    │  │   & Learning │  │  & Auth     │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
SpaceChildDev/
├── client/                          # React Frontend
│   ├── public/
│   │   ├── sw.js                    # Service Worker (PWA)
│   │   ├── manifest.json
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/              # Monaco Editor components
│   │   │   │   ├── MonacoEditor.tsx
│   │   │   │   ├── EditorTabs.tsx
│   │   │   │   └── MiniMap.tsx
│   │   │   ├── FileExplorer/        # File tree components
│   │   │   │   ├── FileTree.tsx
│   │   │   │   └── FileContextMenu.tsx
│   │   │   ├── Terminal/            # Integrated terminal
│   │   │   │   ├── Terminal.tsx
│   │   │   │   └── TerminalTabs.tsx
│   │   │   ├── AI/                  # AI interaction panel
│   │   │   │   ├── AIPanel.tsx
│   │   │   │   ├── AgentChat.tsx
│   │   │   │   └── AgentSelector.tsx
│   │   │   ├── QE/                  # Quality Engineering visualization
│   │   │   │   ├── QEDashboard.tsx
│   │   │   │   ├── MindMap.tsx
│   │   │   │   ├── QualityRadar.tsx
│   │   │   │   ├── AgentTimeline.tsx
│   │   │   │   └── CoveragePanel.tsx
│   │   │   ├── TDD/                 # TDD workflow UI
│   │   │   │   ├── TDDPanel.tsx
│   │   │   │   ├── RedPhase.tsx
│   │   │   │   ├── GreenPhase.tsx
│   │   │   │   └── RefactorPhase.tsx
│   │   │   ├── Layout/              # Main layout components
│   │   │   │   ├── IDELayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── StatusBar.tsx
│   │   │   │   └── CommandPalette.tsx
│   │   │   ├── Common/              # Shared components
│   │   │   └── pwa/                 # PWA components
│   │   ├── contexts/
│   │   │   ├── EditorContext.tsx
│   │   │   ├── AgentContext.tsx
│   │   │   ├── QEContext.tsx
│   │   │   └── ProjectContext.tsx
│   │   ├── hooks/
│   │   │   ├── useMonaco.ts
│   │   │   ├── useAgent.ts
│   │   │   ├── useQEAgents.ts
│   │   │   ├── useTDD.ts
│   │   │   ├── usePatternBank.ts
│   │   │   └── useLearning.ts
│   │   ├── services/
│   │   │   ├── agentService.ts
│   │   │   ├── qeService.ts
│   │   │   ├── fileService.ts
│   │   │   └── mcpService.ts
│   │   ├── lib/
│   │   │   ├── space-child-auth.ts
│   │   │   └── space-child-pwa.ts
│   │   └── types/
│   │       ├── agent.types.ts
│   │       ├── qe.types.ts
│   │       └── editor.types.ts
│   └── index.html
├── server/
│   ├── index.ts                     # Express server entry
│   ├── routes.ts                    # API routes
│   ├── routes/
│   │   ├── agents.ts                # Agent management routes
│   │   ├── qe.ts                    # Quality engineering routes
│   │   ├── tdd.ts                   # TDD workflow routes
│   │   ├── learning.ts              # Learning system routes
│   │   ├── mcp.ts                   # MCP server routes
│   │   ├── files.ts                 # File operations routes
│   │   └── trifecta.ts              # Trifecta integration
│   ├── services/
│   │   ├── agents/                  # Agent implementations
│   │   │   ├── AgentFleetManager.ts
│   │   │   ├── TaskQueue.ts
│   │   │   ├── MCPIntegration.ts
│   │   │   └── agents/              # Individual agent definitions
│   │   │       ├── TestGenerator.ts
│   │   │       ├── CoverageAnalyzer.ts
│   │   │       ├── SecurityScanner.ts
│   │   │       ├── PerformanceTester.ts
│   │   │       ├── CodeComplexity.ts
│   │   │       └── ... (31 agents)
│   │   ├── qe/                      # Quality Engineering
│   │   │   ├── QEEngine.ts
│   │   │   ├── PatternBank.ts
│   │   │   ├── FlakyDetector.ts
│   │   │   ├── CoverageAnalyzer.ts
│   │   │   └── skills/              # 41 QE skills
│   │   │       ├── tdd-london-chicago.ts
│   │   │       ├── accessibility-testing.ts
│   │   │       └── ... (41 skills)
│   │   ├── tdd/                     # TDD Engine
│   │   │   ├── TDDEngine.ts
│   │   │   ├── RedPhaseAgent.ts
│   │   │   ├── GreenPhaseAgent.ts
│   │   │   └── RefactorPhaseAgent.ts
│   │   ├── learning/                # Self-Learning System
│   │   │   ├── LearningSystem.ts
│   │   │   ├── QLearning.ts
│   │   │   ├── SARSA.ts
│   │   │   └── ActorCritic.ts
│   │   ├── ai/                      # AI Providers
│   │   │   ├── MultiModelRouter.ts
│   │   │   ├── AnthropicProvider.ts
│   │   │   ├── OpenAIProvider.ts
│   │   │   └── GroqProvider.ts
│   │   └── visualization/           # Real-time visualization
│   │       ├── EventStore.ts
│   │       ├── WebSocketServer.ts
│   │       └── MetricsAggregator.ts
│   └── db.ts                        # Database connection
├── shared/
│   ├── schema.ts                    # Drizzle ORM schema
│   ├── types/
│   │   ├── agent.types.ts
│   │   ├── qe.types.ts
│   │   └── learning.types.ts
│   └── constants/
│       ├── agents.ts                # Agent definitions
│       └── skills.ts                # Skill definitions
├── .claude/                         # Agent & skill definitions (agentic-qe style)
│   ├── agents/
│   │   ├── qe-test-generator.md
│   │   ├── qe-coverage-analyzer.md
│   │   └── subagents/
│   │       ├── tdd-red-phase.md
│   │       ├── tdd-green-phase.md
│   │       └── tdd-refactor-phase.md
│   ├── skills/
│   │   ├── tdd-london-chicago.md
│   │   └── accessibility-testing.md
│   └── commands/
│       ├── test.md
│       ├── coverage.md
│       └── tdd.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
└── tailwind.config.ts
```

## Key Features

### Agent Fleet (31 Agents)

#### Main QE Agents (20)
1. **qe-test-generator** - Generates comprehensive test suites
2. **qe-coverage-analyzer** - Analyzes and reports code coverage
3. **qe-security-scanner** - Security vulnerability detection
4. **qe-performance-tester** - Performance and load testing
5. **qe-code-complexity** - Code complexity analysis
6. **qe-accessibility** - Accessibility testing (WCAG)
7. **qe-api-tester** - API testing and contract validation
8. **qe-mutation-tester** - Mutation testing for test quality
9. **qe-regression-hunter** - Regression detection
10. **qe-flaky-detector** - Flaky test identification (ML)
11. **qe-visual-tester** - Visual regression testing
12. **qe-contract-tester** - Contract testing (Pact)
13. **qe-chaos-engineer** - Chaos engineering tests
14. **qe-database-tester** - Database testing
15. **qe-localization** - i18n/l10n testing
16. **qe-compliance** - Compliance and audit testing
17. **qe-code-intelligence** - 80% token reduction via smart context
18. **qe-quality-gate** - Quality gate enforcement
19. **qe-testability-scorer** - Code testability scoring
20. **qe-documentation** - Test documentation generator

#### TDD Subagents (11)
1. **tdd-red-phase** - Write failing tests first
2. **tdd-green-phase** - Minimal code to pass
3. **tdd-refactor-phase** - Clean up and optimize
4. **tdd-assertion-builder** - Generate meaningful assertions
5. **tdd-mock-generator** - Create mocks and stubs
6. **tdd-fixture-builder** - Test data fixtures
7. **tdd-integration** - Integration test orchestration
8. **tdd-e2e** - End-to-end test coordination
9. **tdd-unit** - Unit test specialist
10. **tdd-validator** - Verify TDD compliance
11. **tdd-cycle-manager** - Manage RED/GREEN/REFACTOR cycle

### QE Skills Library (41 Skills)
Organized in phases for progressive mastery:

**Phase 1: Core Quality Engineering (18)**
- agentic-quality-engineering
- holistic-testing-pact
- context-driven-testing
- exploratory-testing-advanced
- tdd-london-chicago
- xp-practices
- risk-based-testing
- test-automation-strategy
- api-testing-patterns
- performance-testing
- security-testing
- code-review-quality
- refactoring-patterns
- quality-metrics
- bug-reporting-excellence
- technical-writing
- consultancy-practices
- cicd-pipeline-qe-orchestrator

**Phase 2: Expanded Skills (19)**
- regression-testing
- shift-left-testing
- shift-right-testing
- test-design-techniques
- mutation-testing
- test-data-management
- verification-quality
- accessibility-testing
- mobile-testing
- database-testing
- contract-testing
- chaos-engineering-resilience
- compatibility-testing
- localization-testing
- compliance-testing
- visual-testing-advanced
- test-environment-management
- test-reporting-analytics
- testability-scoring

**Phase 3: Advanced Strategic (4)**
- six-thinking-hats
- brutal-honesty-review
- sherlock-review
- n8n-workflow-testing

### Self-Learning System

**Reinforcement Learning Algorithms:**
- **Q-Learning** - Default, learns optimal action-value functions
- **SARSA** - On-policy learning for safer exploration
- **Actor-Critic (A2C)** - Combines value and policy learning
- **PPO** - Advanced policy optimization

**Pattern Bank:**
- 85%+ pattern matching accuracy
- Cross-framework pattern reuse (Jest, Mocha, Cypress, etc.)
- Project-specific pattern learning
- 10,000+ experience replay buffer

### Multi-Model Router
**Cost Optimization (70-81% savings):**
- Automatic complexity analysis
- Optimal model selection per task
- Real-time cost tracking
- Budget alerts and forecasting

**Supported Models:**
- Anthropic Claude (Haiku, Sonnet)
- OpenAI GPT-4o, GPT-4o-mini
- Groq Llama models
- Custom model integration

## API Endpoints

### Agent Management
- `POST /api/agents/execute` - Execute single agent
- `POST /api/agents/fleet/execute` - Execute agent fleet
- `GET /api/agents/status/:taskId` - Get task status
- `GET /api/agents/types` - List available agents
- `POST /api/agents/cancel/:taskId` - Cancel running task

### Quality Engineering
- `POST /api/qe/analyze` - Run quality analysis
- `POST /api/qe/generate-tests` - Generate tests
- `GET /api/qe/coverage/:projectId` - Get coverage report
- `POST /api/qe/quality-gate` - Run quality gate
- `GET /api/qe/metrics/:projectId` - Get quality metrics

### TDD Workflow
- `POST /api/tdd/start` - Start TDD cycle
- `POST /api/tdd/red` - Execute RED phase
- `POST /api/tdd/green` - Execute GREEN phase
- `POST /api/tdd/refactor` - Execute REFACTOR phase
- `GET /api/tdd/status/:sessionId` - Get TDD session status

### Learning System
- `GET /api/learning/status/:agentId` - Learning status
- `GET /api/learning/patterns/:framework` - List patterns
- `GET /api/learning/metrics/:algorithm` - Algorithm metrics
- `POST /api/learning/algorithm` - Set algorithm

### Real-Time (WebSocket)
- `ws://*/events` - Agent activity stream
- `ws://*/metrics` - Quality metrics stream
- `ws://*/terminal` - Terminal I/O

## Database Schema Extensions

```sql
-- Agent tasks and execution
CREATE TABLE agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER REFERENCES projects(id),
  agent_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  input JSONB NOT NULL,
  output JSONB,
  cost_usd DECIMAL(10,4),
  tokens_used INTEGER,
  model_used VARCHAR(100),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pattern bank for learning
CREATE TABLE pattern_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework VARCHAR(50) NOT NULL,
  pattern_type VARCHAR(100) NOT NULL,
  pattern_content JSONB NOT NULL,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  confidence REAL DEFAULT 0.5,
  q_value REAL DEFAULT 0.0,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning episodes
CREATE TABLE learning_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(100) NOT NULL,
  state JSONB NOT NULL,
  action JSONB NOT NULL,
  reward REAL NOT NULL,
  next_state JSONB,
  algorithm VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TDD sessions
CREATE TABLE tdd_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER REFERENCES projects(id),
  current_phase VARCHAR(20) DEFAULT 'red',
  cycle_count INTEGER DEFAULT 0,
  test_file_path VARCHAR(500),
  impl_file_path VARCHAR(500),
  assertions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quality metrics history
CREATE TABLE quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER REFERENCES projects(id),
  coverage REAL,
  security_score REAL,
  performance_score REAL,
  accessibility_score REAL,
  maintainability_score REAL,
  test_quality_score REAL,
  overall_score REAL,
  dimensions JSONB,
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

## Integration Points

### Trifecta System
- **ninja-craft-hub** - Project creation, funding requests
- **angel-informant** - Discovery, investment tracking
- Projects created in ninja-craft-hub auto-appear in SpaceChildDev

### Space Child Auth
- SSO authentication via Space-Child-Dream
- Direct auth modal support
- Token refresh handling

### PWA
- Offline-capable editing
- Background sync for agent tasks
- Push notifications for task completion

## Performance Targets
- **Agent execution**: <5s for simple tasks
- **Pattern matching**: 85%+ accuracy
- **Flaky detection**: 90%+ accuracy
- **Event streaming**: 185 events/sec write throughput
- **Query latency**: <1ms
- **Render time**: <100ms for 100 nodes, <500ms for 1000 nodes

## Getting Started

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
SPACE_CHILD_AUTH_URL=https://dream.spacechild.love
SESSION_SECRET=...
```
