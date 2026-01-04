import { Wifi, WifiOff, Bot, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  isConnected: boolean;
  activeTasks: number;
  tddPhase: "red" | "green" | "refactor" | null;
}

export function StatusBar({ isConnected, activeTasks, tddPhase }: StatusBarProps) {
  return (
    <div className="h-6 bg-muted/50 border-t flex items-center justify-between px-4 text-xs">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-1">
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-muted-foreground">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-500" />
              <span className="text-muted-foreground">Disconnected</span>
            </>
          )}
        </div>

        {/* Active Agents */}
        {activeTasks > 0 && (
          <div className="flex items-center gap-1">
            <Bot className="w-3 h-3 text-primary animate-pulse" />
            <span>{activeTasks} agent{activeTasks > 1 ? "s" : ""} running</span>
          </div>
        )}

        {/* TDD Phase */}
        {tddPhase && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded",
            tddPhase === "red" && "bg-red-500/20 text-red-500",
            tddPhase === "green" && "bg-green-500/20 text-green-500",
            tddPhase === "refactor" && "bg-blue-500/20 text-blue-500"
          )}>
            <Activity className="w-3 h-3" />
            <span>TDD: {tddPhase.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 text-muted-foreground">
        <span>TypeScript</span>
        <span>UTF-8</span>
        <span>SpaceChildDev v1.0.0</span>
      </div>
    </div>
  );
}
