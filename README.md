# SpaceChildDev

An Agentic IDE with Robust Quality Engineering - the fusion of VS Code, GooseNeutron, agentic-qe, and SpaceChild.

## Features

### 31 QE Agents
- **20 Main Agents**: Test generation, coverage analysis, security scanning, performance testing, accessibility auditing, and more
- **11 TDD Subagents**: Specialized agents for RED, GREEN, REFACTOR phases

### 41 QE Skills
Full spectrum of quality engineering practices:
- Test-Driven Development (TDD)
- Behavior-Driven Development (BDD)
- Mutation Testing
- Chaos Engineering
- Contract Testing
- Visual Regression Testing
- And 35+ more specialized skills

### Self-Learning System
- **Reinforcement Learning**: Q-Learning, SARSA, A2C, PPO algorithms
- **Pattern Bank**: Learned strategies and test patterns
- **Continuous Improvement**: Gets better with every task

### Multi-Model Router
- 70-81% cost savings through intelligent model selection
- Automatic complexity assessment
- Token-aware routing

### Real-Time Visualization
- Mind Map view of codebase
- Quality metrics dashboard
- Timeline of agent activities
- TDD phase indicators

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- AI API keys (OpenAI, Anthropic, or compatible)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/SpaceChildDev.git
cd SpaceChildDev

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SPACE_CHILD_AUTH_URL=https://dream.spacechild.love
SPACE_CHILD_AUTH_CLIENT_ID=your-client-id
SESSION_SECRET=your-session-secret
```

## Architecture

```
SpaceChildDev/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── AI/       # AI assistant panel
│   │   │   ├── Editor/   # Monaco editor
│   │   │   ├── Layout/   # Sidebar, StatusBar, etc.
│   │   │   ├── QE/       # Quality engineering dashboard
│   │   │   └── Terminal/ # Integrated terminal
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   └── pages/        # Route pages
├── server/                # Express backend
│   ├── routes/           # API endpoints
│   └── utils/            # Server utilities
└── shared/               # Shared code
    ├── schema.ts         # Database schema
    └── types/            # TypeScript types
```

## API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents/execute` - Execute single agent
- `POST /api/agents/fleet/execute` - Execute fleet of agents
- `GET /api/agents/task/:taskId` - Get task status

### Quality Engineering
- `GET /api/qe/skills` - List QE skills
- `POST /api/qe/analyze` - Run quality analysis
- `POST /api/qe/generate-tests` - Generate tests
- `POST /api/qe/quality-gate` - Run quality gate

### TDD Workflow
- `POST /api/tdd/start` - Start TDD session
- `POST /api/tdd/red` - Execute RED phase
- `POST /api/tdd/green` - Execute GREEN phase
- `POST /api/tdd/refactor` - Execute REFACTOR phase

### Learning System
- `GET /api/learning/status` - Learning system status
- `GET /api/learning/patterns` - List learned patterns
- `POST /api/learning/episodes` - Record learning episode

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Monaco Editor
- **Backend**: Express, Node.js, WebSocket
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Multi-model support (OpenAI, Anthropic, etc.)
- **Auth**: Space Child Auth SSO

## Part of the Space Child Ecosystem

SpaceChildDev integrates with:
- **Space-Child-Dream**: Authentication & user management
- **SpaceChild**: Main IDE platform
- **SpaceChildWaitlist**: Waitlist & monetization
- **SpaceChildCollective**: Agent collaboration

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines first.
