import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  TestTube, 
  Brain, 
  Zap, 
  Shield, 
  GitBranch,
  ChevronRight,
  Play
} from "lucide-react";

export default function Landing() {
  const { initiateSSO, isLoading } = useAuth();

  const features = [
    {
      icon: Bot,
      title: "31 QE Agents",
      description: "20 main agents + 11 TDD subagents for comprehensive quality engineering",
    },
    {
      icon: TestTube,
      title: "41 QE Skills",
      description: "Full spectrum of quality engineering practices from TDD to chaos engineering",
    },
    {
      icon: Brain,
      title: "Self-Learning System",
      description: "Q-Learning, SARSA, and PPO algorithms that improve with every task",
    },
    {
      icon: Zap,
      title: "Multi-Model Router",
      description: "70-81% cost savings through intelligent model selection",
    },
    {
      icon: Shield,
      title: "Quality Gates",
      description: "Automated quality enforcement before deployment",
    },
    {
      icon: GitBranch,
      title: "TDD Workflow",
      description: "RED → GREEN → REFACTOR cycle with AI assistance",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-8">
              <Bot className="w-4 h-4" />
              <span>Agentic IDE with Robust Quality Engineering</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              SpaceChildDev
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The fusion of VS Code's editing power, autonomous AI agents, and comprehensive 
              quality engineering. Build, test, and deploy with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={initiateSSO}
                disabled={isLoading}
                className="text-lg px-8"
              >
                Get Started
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Quality Engineering at Scale
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            SpaceChildDev combines the best practices from agentic-qe, GooseNeutron, 
            VS Code, and Space Child into one powerful IDE.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">31</div>
              <div className="text-muted-foreground">QE Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">41</div>
              <div className="text-muted-foreground">QE Skills</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">90%+</div>
              <div className="text-muted-foreground">Flaky Detection</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">70-81%</div>
              <div className="text-muted-foreground">Cost Savings</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Development?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join the Space Child ecosystem and experience the future of agentic development.
          </p>
          <Button size="lg" onClick={initiateSSO} disabled={isLoading}>
            Start Building Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-muted-foreground">
              © 2025 SpaceChildDev • Part of the Space Child Ecosystem
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground">Privacy</a>
              <a href="/terms" className="hover:text-foreground">Terms</a>
              <a href="https://docs.spacechild.love" className="hover:text-foreground">Docs</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
