import React, { createContext, useContext, useState, useCallback } from "react";
import type { QualityDimensions, TDDSession, QESkill } from "@shared/types/qe.types";
import { QE_SKILLS } from "@shared/types/qe.types";

interface QEContextData {
  // Quality metrics
  qualityMetrics: QualityDimensions | null;
  qualityHistory: Array<{ date: Date; dimensions: QualityDimensions }>;
  
  // TDD
  tddSession: TDDSession | null;
  currentPhase: "red" | "green" | "refactor" | null;
  
  // Skills
  skills: QESkill[];
  activeSkills: string[];
  
  // Coverage
  coverage: number;
  coverageGaps: Array<{ file: string; startLine: number; endLine: number }>;
  
  // Actions
  runQualityAnalysis: (projectId: number) => Promise<void>;
  startTDDSession: (projectId: number, testFilePath: string, implFilePath: string) => Promise<void>;
  advanceTDDPhase: (sessionId: string, data?: unknown) => Promise<void>;
  endTDDSession: (sessionId: string) => Promise<void>;
  runQualityGate: (projectId: number) => Promise<{ status: string; conditions: unknown[] }>;
  activateSkill: (skillId: string) => void;
  deactivateSkill: (skillId: string) => void;
}

const QEContext = createContext<QEContextData | null>(null);

export function QEProvider({ children }: { children: React.ReactNode }) {
  const [qualityMetrics, setQualityMetrics] = useState<QualityDimensions | null>(null);
  const [qualityHistory, setQualityHistory] = useState<Array<{ date: Date; dimensions: QualityDimensions }>>([]);
  const [tddSession, setTddSession] = useState<TDDSession | null>(null);
  const [currentPhase, setCurrentPhase] = useState<"red" | "green" | "refactor" | null>(null);
  const [activeSkills, setActiveSkills] = useState<string[]>([]);
  const [coverage, setCoverage] = useState(0);
  const [coverageGaps, setCoverageGaps] = useState<Array<{ file: string; startLine: number; endLine: number }>>([]);

  const runQualityAnalysis = useCallback(async (projectId: number) => {
    const response = await fetch("/api/qe/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    
    if (!response.ok) throw new Error("Failed to run quality analysis");
    
    const result = await response.json();
    const dimensions = result.metrics.dimensions as QualityDimensions;
    
    setQualityMetrics(dimensions);
    setCoverage(dimensions.coverage);
    setQualityHistory((prev) => [
      ...prev,
      { date: new Date(), dimensions },
    ]);
  }, []);

  const startTDDSession = useCallback(async (
    projectId: number,
    testFilePath: string,
    implFilePath: string
  ) => {
    const response = await fetch("/api/tdd/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, testFilePath, implFilePath }),
    });
    
    if (!response.ok) throw new Error("Failed to start TDD session");
    
    const result = await response.json();
    setTddSession({
      id: result.sessionId,
      projectId,
      currentPhase: "red",
      cycleCount: 0,
      testFilePath,
      implFilePath,
      assertions: [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setCurrentPhase("red");
  }, []);

  const advanceTDDPhase = useCallback(async (sessionId: string, data?: unknown) => {
    if (!currentPhase) return;
    
    const endpoint = `/api/tdd/${currentPhase}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, ...data }),
    });
    
    if (!response.ok) throw new Error(`Failed to execute ${currentPhase} phase`);
    
    const result = await response.json();
    
    setCurrentPhase(result.nextPhase);
    if (tddSession) {
      setTddSession({
        ...tddSession,
        currentPhase: result.nextPhase,
        cycleCount: result.cycleCount || tddSession.cycleCount,
        updatedAt: new Date(),
      });
    }
  }, [currentPhase, tddSession]);

  const endTDDSession = useCallback(async (sessionId: string) => {
    await fetch(`/api/tdd/end/${sessionId}`, { method: "POST" });
    setTddSession(null);
    setCurrentPhase(null);
  }, []);

  const runQualityGate = useCallback(async (projectId: number) => {
    const response = await fetch("/api/qe/quality-gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    
    if (!response.ok) throw new Error("Failed to run quality gate");
    
    return response.json();
  }, []);

  const activateSkill = useCallback((skillId: string) => {
    setActiveSkills((prev) => {
      if (prev.includes(skillId)) return prev;
      return [...prev, skillId];
    });
  }, []);

  const deactivateSkill = useCallback((skillId: string) => {
    setActiveSkills((prev) => prev.filter((s) => s !== skillId));
  }, []);

  return (
    <QEContext.Provider
      value={{
        qualityMetrics,
        qualityHistory,
        tddSession,
        currentPhase,
        skills: QE_SKILLS,
        activeSkills,
        coverage,
        coverageGaps,
        runQualityAnalysis,
        startTDDSession,
        advanceTDDPhase,
        endTDDSession,
        runQualityGate,
        activateSkill,
        deactivateSkill,
      }}
    >
      {children}
    </QEContext.Provider>
  );
}

export function useQEContext() {
  const context = useContext(QEContext);
  if (!context) {
    throw new Error("useQEContext must be used within QEProvider");
  }
  return context;
}
