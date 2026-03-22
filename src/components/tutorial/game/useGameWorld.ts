"use client";

import { useState, useCallback, useEffect } from "react";
import type { Stage, StageStatus } from "./types";

export function useGameWorld(tutorialId: string, stages: Stage[]) {
  const storageKey = `game_progress_${tutorialId}`;

  const [cleared, setCleared] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(storageKey);
      return new Set(JSON.parse(saved ?? "[]"));
    } catch {
      return new Set();
    }
  });

  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [justClearedId, setJustClearedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...cleared]));
    } catch {}
  }, [cleared, storageKey]);

  const getStatus = useCallback(
    (stageId: string): StageStatus => {
      if (cleared.has(stageId)) return "cleared";
      const idx = stages.findIndex((s) => s.id === stageId);
      if (idx === 0) return "available";
      const prev = stages[idx - 1];
      return prev && cleared.has(prev.id) ? "available" : "locked";
    },
    [cleared, stages]
  );

  const openStage = useCallback(
    (stageId: string) => {
      if (getStatus(stageId) === "locked") return;
      setActiveStageId(stageId);
    },
    [getStatus]
  );

  const closeStage = useCallback(() => setActiveStageId(null), []);

  const clearStage = useCallback((stageId: string) => {
    setCleared((prev) => new Set([...prev, stageId]));
    setJustClearedId(stageId);
    setActiveStageId(null);
    setTimeout(() => setJustClearedId(null), 1500);
  }, []);

  const activeStage = stages.find((s) => s.id === activeStageId) ?? null;
  const allCleared = stages.every((s) => cleared.has(s.id));
  const clearedCount = stages.filter((s) => cleared.has(s.id)).length;

  return {
    cleared,
    activeStage,
    justClearedId,
    allCleared,
    clearedCount,
    getStatus,
    openStage,
    closeStage,
    clearStage,
  };
}
