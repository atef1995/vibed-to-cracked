"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

interface LocalStepProgress {
  passed: boolean;
  userCode: string | null;
  completedAt: string | null;
}

type ProgressMap = Record<string, LocalStepProgress>;

const STORAGE_PREFIX = "vtc-step-progress:";

function getStorageKey(tutorialSlug: string) {
  return `${STORAGE_PREFIX}${tutorialSlug}`;
}

function readLocal(tutorialSlug: string): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getStorageKey(tutorialSlug));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocal(tutorialSlug: string, map: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(tutorialSlug), JSON.stringify(map));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

export function useStepProgress(
  tutorialSlug: string,
  steps: { slug: string; order: number }[]
) {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user?.id;

  // Local state mirrors localStorage for anonymous users
  const [localProgress, setLocalProgress] = useState<ProgressMap>({});

  useEffect(() => {
    if (!isAuthenticated) {
      setLocalProgress(readLocal(tutorialSlug));
    }
  }, [tutorialSlug, isAuthenticated]);

  const isStepComplete = useCallback(
    (stepSlug: string) => {
      if (isAuthenticated) {
        // For authenticated users, progress comes from the API via useStep/useStepList
        // This hook only manages localStorage for anonymous
        return false;
      }
      return localProgress[stepSlug]?.passed === true;
    },
    [isAuthenticated, localProgress]
  );

  const canAccessStep = useCallback(
    (stepSlug: string) => {
      if (isAuthenticated) return true; // Server handles locking for auth users

      const step = steps.find((s) => s.slug === stepSlug);
      if (!step || step.order <= 1) return true;

      // Check all prior steps are complete
      const priorSteps = steps.filter((s) => s.order < step.order);
      return priorSteps.every((s) => localProgress[s.slug]?.passed === true);
    },
    [isAuthenticated, steps, localProgress]
  );

  const completeStepLocally = useCallback(
    (stepSlug: string, userCode: string) => {
      if (isAuthenticated) return; // Auth users save via API

      const updated = {
        ...localProgress,
        [stepSlug]: {
          passed: true,
          userCode,
          completedAt: new Date().toISOString(),
        },
      };
      setLocalProgress(updated);
      writeLocal(tutorialSlug, updated);
    },
    [isAuthenticated, localProgress, tutorialSlug]
  );

  const getLastCode = useCallback(
    (stepSlug: string) => {
      if (isAuthenticated) return null;
      return localProgress[stepSlug]?.userCode ?? null;
    },
    [isAuthenticated, localProgress]
  );

  return {
    isStepComplete,
    canAccessStep,
    completeStepLocally,
    getLastCode,
    isAuthenticated,
  };
}
