import { useState } from "react";
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from "react-resizable-panels";
import { Sidebar } from "@/components/Layout/Sidebar";
import { EditorTabs } from "@/components/Editor/EditorTabs";
import { MonacoEditor } from "@/components/Editor/MonacoEditor";
import { Terminal } from "@/components/Terminal/Terminal";
import { AIPanel } from "@/components/AI/AIPanel";
import { QEDashboard } from "@/components/QE/QEDashboard";
import { StatusBar } from "@/components/Layout/StatusBar";
import { CommandPalette } from "@/components/Layout/CommandPalette";
import { useProjectContext } from "@/contexts/ProjectContext";
import { useAgentContext } from "@/contexts/AgentContext";
import { useQEContext } from "@/contexts/QEContext";

type RightPanelTab = "ai" | "qe";

export default function IDE() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>("ai");
  const { currentFile } = useProjectContext();
  const { activeTasks, isConnected } = useAgentContext();
  const { tddSession, currentPhase } = useQEContext();

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "p") {
      e.preventDefault();
      setShowCommandPalette(true);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "`") {
      e.preventDefault();
      setShowTerminal(!showTerminal);
    }
  };

  return (
    <div 
      className="h-screen flex flex-col bg-background text-foreground"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Sidebar */}
          <Panel defaultSize={15} minSize={10} maxSize={25}>
            <Sidebar />
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

          {/* Editor Area */}
          <Panel defaultSize={55} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Editor */}
              <Panel defaultSize={showTerminal ? 70 : 100} minSize={30}>
                <div className="h-full flex flex-col">
                  <EditorTabs />
                  <div className="flex-1">
                    {currentFile ? (
                      <MonacoEditor />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <p className="text-lg mb-2">No file open</p>
                          <p className="text-sm">
                            Select a file from the explorer or press{" "}
                            <kbd className="px-2 py-1 rounded bg-muted text-xs">
                              Ctrl+P
                            </kbd>
                            {" "}to search
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Panel>

              {/* Terminal */}
              {showTerminal && (
                <>
                  <PanelResizeHandle className="h-1 bg-border hover:bg-primary/50 transition-colors" />
                  <Panel defaultSize={30} minSize={10}>
                    <Terminal />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

          {/* Right Panel - AI & QE */}
          <Panel defaultSize={30} minSize={20} maxSize={50}>
            <div className="h-full flex flex-col">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => setRightPanelTab("ai")}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    rightPanelTab === "ai"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  AI Assistant
                  {activeTasks.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                      {activeTasks.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setRightPanelTab("qe")}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    rightPanelTab === "qe"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Quality Engineering
                  {tddSession && currentPhase && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      currentPhase === "red" ? "bg-red-500/20 text-red-500" :
                      currentPhase === "green" ? "bg-green-500/20 text-green-500" :
                      "bg-blue-500/20 text-blue-500"
                    }`}>
                      {currentPhase.toUpperCase()}
                    </span>
                  )}
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {rightPanelTab === "ai" ? <AIPanel /> : <QEDashboard />}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar 
        isConnected={isConnected}
        activeTasks={activeTasks.length}
        tddPhase={currentPhase}
      />
    </div>
  );
}
