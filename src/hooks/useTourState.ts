import { useCallback, useState } from "react";

const TOUR_STORAGE_PREFIX = "tour-";

function getStorageKey(tourId: string) {
  return `${TOUR_STORAGE_PREFIX}${tourId}-completed`;
}

export function useTourState(tourId: string) {
  const [isRunning, setIsRunning] = useState(false);

  const isTourCompleted = (() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(getStorageKey(tourId)) === "true";
  })();

  const completeTour = useCallback(() => {
    localStorage.setItem(getStorageKey(tourId), "true");
    setIsRunning(false);
  }, [tourId]);

  const startTour = useCallback(() => {
    if (!isTourCompleted) {
      setIsRunning(true);
    }
  }, [isTourCompleted]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(getStorageKey(tourId));
    setIsRunning(true);
  }, [tourId]);

  return {
    isRunning,
    setIsRunning,
    isTourCompleted,
    startTour,
    completeTour,
    resetTour,
  };
}
