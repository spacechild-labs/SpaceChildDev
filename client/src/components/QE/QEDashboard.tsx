import { useState } from "react";
import { 
  PieChart, 
  Shield, 
  Zap, 
  Accessibility, 
  GitBranch,
  Play,
  RotateCw,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity
} from "lucide-react";
import { useQEContext } from "@/contexts/QEContext";
import { useProjectContext } from "@/contexts/ProjectContext";
import { cn } from "@/lib/utils";

type Tab = "metrics" | "tdd" | "skills";

export function QEDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("metrics");

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b">
        {[
          { id: "metrics" as const, label: "Quality Metrics" },
          { id: "tdd" as const, label: "TDD Workflow" },
          { id: "skills" as const, label: "Skills" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "metrics" && <MetricsPanel />}
        {activeTab === "tdd" && <TDDPanel />}
        {activeTab === "skills" && <SkillsPanel />}
      </div>
    </div>
  );
}

function MetricsPanel() {
  const { qualityMetrics, runQualityAnalysis, coverage } = useQEContext();
  const { currentProject } = useProjectContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!currentProject) return;
    setIsLoading(true);
    try {
      await runQualityAnalysis(currentProject.id);
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = [
    { label: "Coverage", value: qualityMetrics?.coverage || 0, icon: PieChart, color: "text-emerald-500" },
    { label: "Security", value: qualityMetrics?.security || 0, icon: Shield, color: "text-rose-500" },
    { label: "Performance", value: qualityMetrics?.performance || 0, icon: Zap, color: "text-violet-500" },
    { label: "Accessibility", value: qualityMetrics?.accessibility || 0, icon: Accessibility, color: "text-cyan-500" },
    { label: "Maintainability", value: qualityMetrics?.maintainability || 0, icon: GitBranch, color: "text-yellow-500" },
    { label: "Test Quality", value: qualityMetrics?.testQuality || 0, icon: Activity, color: "text-blue-500" },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Quality Overview</h3>
        <button
          onClick={handleAnalyze}
          disabled={!currentProject || isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Analyze
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={cn("w-4 h-4", metric.color)} />
              <span className="text-sm text-muted-foreground">{metric.label}</span>
            </div>
            <div className="text-2xl font-bold">{metric.value.toFixed(1)}%</div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full", metric.color.replace("text-", "bg-"))}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {!currentProject && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Open a project to run quality analysis
        </p>
      )}
    </div>
  );
}

function TDDPanel() {
  const { tddSession, currentPhase, startTDDSession, advanceTDDPhase, endTDDSession } = useQEContext();
  const { currentProject } = useProjectContext();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = async () => {
    if (!currentProject) return;
    setIsStarting(true);
    try {
      await startTDDSession(currentProject.id, "test.spec.ts", "implementation.ts");
    } finally {
      setIsStarting(false);
    }
  };

  const phases = [
    { id: "red", label: "RED", description: "Write failing test", icon: XCircle, color: "text-red-500 bg-red-500/10" },
    { id: "green", label: "GREEN", description: "Make test pass", icon: CheckCircle, color: "text-green-500 bg-green-500/10" },
    { id: "refactor", label: "REFACTOR", description: "Clean up code", icon: RefreshCw, color: "text-blue-500 bg-blue-500/10" },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">TDD Workflow</h3>
        {!tddSession ? (
          <button
            onClick={handleStartSession}
            disabled={!currentProject || isStarting}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50"
          >
            {isStarting ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Start TDD Session
          </button>
        ) : (
          <button
            onClick={() => endTDDSession(tddSession.id)}
            className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded text-sm"
          >
            End Session
          </button>
        )}
      </div>

      {/* TDD Phase Indicator */}
      <div className="flex gap-2">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className={cn(
              "flex-1 p-3 rounded-lg border-2 transition-all",
              currentPhase === phase.id 
                ? `${phase.color} border-current` 
                : "bg-muted/30 border-transparent"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <phase.icon className={cn("w-4 h-4", currentPhase === phase.id && phase.color.split(" ")[0])} />
              <span className="font-semibold text-sm">{phase.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{phase.description}</p>
          </div>
        ))}
      </div>

      {/* Session Info */}
      {tddSession && (
        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium mb-2">Current Session</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Cycle: {tddSession.cycleCount}</div>
              <div>Phase: {currentPhase?.toUpperCase()}</div>
              <div>Status: {tddSession.status}</div>
            </div>
          </div>

          <button
            onClick={() => advanceTDDPhase(tddSession.id)}
            className="w-full py-2 bg-primary text-primary-foreground rounded text-sm font-medium"
          >
            Complete {currentPhase?.toUpperCase()} Phase
          </button>
        </div>
      )}

      {!currentProject && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Open a project to start TDD workflow
        </p>
      )}
    </div>
  );
}

function SkillsPanel() {
  const { skills, activeSkills, activateSkill, deactivateSkill } = useQEContext();

  const skillsByPhase = {
    1: skills.filter(s => s.phase === 1),
    2: skills.filter(s => s.phase === 2),
    3: skills.filter(s => s.phase === 3),
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">QE Skills Library</h3>
        <span className="text-xs text-muted-foreground">
          {activeSkills.length} / {skills.length} active
        </span>
      </div>

      {[1, 2, 3].map((phase) => (
        <div key={phase}>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Phase {phase} ({skillsByPhase[phase as 1 | 2 | 3].length} skills)
          </h4>
          <div className="space-y-1">
            {skillsByPhase[phase as 1 | 2 | 3].slice(0, 5).map((skill) => {
              const isActive = activeSkills.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  onClick={() => isActive ? deactivateSkill(skill.id) : activateSkill(skill.id)}
                  className={cn(
                    "w-full p-2 rounded text-left text-sm transition-colors",
                    isActive ? "bg-primary/20 text-primary" : "bg-muted/30 hover:bg-muted"
                  )}
                >
                  <div className="font-medium">{skill.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {skill.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
