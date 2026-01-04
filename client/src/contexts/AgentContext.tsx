import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { AgentTask, AgentStatus, AgentEvent } from "@shared/types/agent.types";

interface AgentContextData {
  activeTasks: AgentTask[];
  taskHistory: AgentTask[];
  events: AgentEvent[];
  isConnected: boolean;
  
  executeAgent: (agentType: string, input: unknown, projectId?: number) => Promise<string>;
  executeFleet: (agents: Array<{ agentType: string; input?: unknown }>, projectId?: number) => Promise<string>;
  cancelTask: (taskId: string) => Promise<void>;
  getTaskStatus: (taskId: string) => AgentTask | undefined;
  clearHistory: () => void;
}

const AgentContext = createContext<AgentContextData | null>(null);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [activeTasks, setActiveTasks] = useState<AgentTask[]>([]);
  const [taskHistory, setTaskHistory] = useState<AgentTask[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // WebSocket connection for real-time events
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      setIsConnected(true);
      socket.send(JSON.stringify({ type: "subscribe", channels: ["agents"] }));
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error("WebSocket message parse error:", error);
      }
    };
    
    socket.onclose = () => {
      setIsConnected(false);
    };
    
    setWs(socket);
    
    return () => {
      socket.close();
    };
  }, []);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case "task_started":
        setActiveTasks((prev) => [
          ...prev,
          {
            id: data.taskId,
            agentType: data.agentType,
            status: "running" as AgentStatus,
            input: {},
            startedAt: new Date(data.timestamp),
          },
        ]);
        break;
        
      case "task_progress":
        setActiveTasks((prev) =>
          prev.map((t) =>
            t.id === data.taskId ? { ...t, progress: data.progress } : t
          )
        );
        break;
        
      case "task_completed":
        setActiveTasks((prev) => prev.filter((t) => t.id !== data.taskId));
        setTaskHistory((prev) => [
          {
            id: data.taskId,
            agentType: data.agentType,
            status: "completed" as AgentStatus,
            input: {},
            output: data.output,
            completedAt: new Date(data.timestamp),
          },
          ...prev,
        ]);
        break;
        
      case "task_failed":
        setActiveTasks((prev) => prev.filter((t) => t.id !== data.taskId));
        setTaskHistory((prev) => [
          {
            id: data.taskId,
            agentType: data.agentType || "unknown",
            status: "failed" as AgentStatus,
            input: {},
            error: data.error,
            completedAt: new Date(data.timestamp),
          },
          ...prev,
        ]);
        break;
    }
    
    // Store all events
    setEvents((prev) => [
      { ...data, id: Date.now().toString(), timestamp: new Date() },
      ...prev.slice(0, 99),
    ]);
  }, []);

  const executeAgent = useCallback(async (agentType: string, input: unknown, projectId?: number) => {
    const response = await fetch("/api/agents/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentType, input, projectId }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to execute agent");
    }
    
    const result = await response.json();
    return result.taskId;
  }, []);

  const executeFleet = useCallback(async (
    agents: Array<{ agentType: string; input?: unknown }>,
    projectId?: number
  ) => {
    const response = await fetch("/api/agents/fleet/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agents, projectId }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to execute fleet");
    }
    
    const result = await response.json();
    return result.fleetId;
  }, []);

  const cancelTask = useCallback(async (taskId: string) => {
    await fetch(`/api/agents/cancel/${taskId}`, { method: "POST" });
    setActiveTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const getTaskStatus = useCallback((taskId: string) => {
    return activeTasks.find((t) => t.id === taskId) || 
           taskHistory.find((t) => t.id === taskId);
  }, [activeTasks, taskHistory]);

  const clearHistory = useCallback(() => {
    setTaskHistory([]);
    setEvents([]);
  }, []);

  return (
    <AgentContext.Provider
      value={{
        activeTasks,
        taskHistory,
        events,
        isConnected,
        executeAgent,
        executeFleet,
        cancelTask,
        getTaskStatus,
        clearHistory,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgentContext must be used within AgentProvider");
  }
  return context;
}
