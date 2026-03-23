"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "exercise-header",
    title: "Welcome to your first exercise",
    content:
      "This is where you practice what you've learned. Each exercise gives you a coding challenge to solve on your own.",
    position: "bottom",
  },
  {
    target: "exercise-instructions",
    title: "Read the instructions",
    content:
      "Start here. This tells you exactly what to build. Read it carefully before writing any code.",
    position: "bottom",
  },
  {
    target: "exercise-tabs",
    title: "Switch between editors",
    content:
      "Use these tabs to switch between HTML, CSS, and JavaScript. Each tab has its own editor where you write that part of your code.",
    position: "bottom",
  },
  {
    target: "exercise-editor",
    title: "Write your code here",
    content:
      "This is your code editor. Type your solution directly here. It works just like a real code editor with syntax highlighting.",
    position: "top",
  },
  {
    target: "exercise-preview-tab",
    title: "Preview your work",
    content:
      "Click this tab to see a live preview of your code rendered in the browser. Switch back and forth as you work.",
    position: "bottom",
  },
  {
    target: "exercise-check-btn",
    title: "Check your solution",
    content:
      "When you think you're done, click this button. It runs automated tests against your code and shows you what passed and what didn't.",
    position: "top",
  },
  {
    target: "exercise-hints",
    title: "Get a hint if you're stuck",
    content:
      "No shame in needing help. Click here to reveal hints that nudge you in the right direction without giving the answer away.",
    position: "top",
  },
  {
    target: "exercise-solution-btn",
    title: "View the full solution",
    content:
      "As a last resort, you can reveal the solution. Fair warning: using it means the exercise won't count towards your achievements.",
    position: "top",
  },
];

const STORAGE_KEY = "exercise-tour-completed";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getElementRect(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top + window.scrollY,
    left: r.left + window.scrollX,
    width: r.width,
    height: r.height,
  };
}

function scrollToTarget(target: string) {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const inView = rect.top >= 80 && rect.bottom <= window.innerHeight - 80;
  if (!inView) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

interface ExerciseTourProps {
  onStartRef?: (startFn: () => void) => void;
}

export function ExerciseTour({ onStartRef }: ExerciseTourProps) {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<Rect | null>(null);
  const [availableSteps, setAvailableSteps] = useState<TourStep[]>([]);
  const rafRef = useRef<number>(0);

  // Filter steps to only those whose target elements exist in the DOM
  const resolveAvailableSteps = useCallback(() => {
    const steps = TOUR_STEPS.filter((step) =>
      document.querySelector(`[data-tour="${step.target}"]`)
    );
    setAvailableSteps(steps);
    return steps;
  }, []);

  const startTour = useCallback(() => {
    const steps = resolveAvailableSteps();
    if (steps.length === 0) return;
    setCurrentStep(0);
    setActive(true);
    // Slight delay so the DOM is settled before measuring
    setTimeout(() => {
      scrollToTarget(steps[0].target);
    }, 100);
  }, [resolveAvailableSteps]);

  // Expose start function to parent
  useEffect(() => {
    onStartRef?.(startTour);
  }, [onStartRef, startTour]);

  // Auto-start on first visit
  useEffect(() => {
    const alreadySeen = localStorage.getItem(STORAGE_KEY);
    if (alreadySeen) return;

    // Wait for the exercise component to render
    const timer = setTimeout(() => {
      startTour();
    }, 800);
    return () => clearTimeout(timer);
  }, [startTour]);

  // Update spotlight rect when step changes or on scroll/resize
  const updateRect = useCallback(() => {
    if (!active || availableSteps.length === 0) return;
    const step = availableSteps[currentStep];
    if (!step) return;
    const rect = getElementRect(step.target);
    setSpotlightRect(rect);
  }, [active, currentStep, availableSteps]);

  useEffect(() => {
    updateRect();

    const handleUpdate = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRect);
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTour();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, currentStep, availableSteps]);

  const closeTour = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const goNext = useCallback(() => {
    if (currentStep < availableSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      scrollToTarget(availableSteps[next].target);
    } else {
      closeTour();
    }
  }, [currentStep, availableSteps, closeTour]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      scrollToTarget(availableSteps[prev].target);
    }
  }, [currentStep, availableSteps]);

  if (!active || availableSteps.length === 0 || !spotlightRect) return null;

  const step = availableSteps[currentStep];
  const isLast = currentStep === availableSteps.length - 1;
  const isFirst = currentStep === 0;
  const padding = 8;

  // Calculate tooltip position
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const tooltipMaxWidth = isMobile ? window.innerWidth - 32 : 380;

  let tooltipTop: number;
  let tooltipLeft: number;

  if (step.position === "bottom") {
    tooltipTop = spotlightRect.top + spotlightRect.height + padding + 12;
    tooltipLeft = isMobile
      ? 16
      : Math.max(
          16,
          Math.min(
            spotlightRect.left,
            window.innerWidth + window.scrollX - tooltipMaxWidth - 16
          )
        );
  } else {
    tooltipTop = spotlightRect.top - padding - 12;
    tooltipLeft = isMobile
      ? 16
      : Math.max(
          16,
          Math.min(
            spotlightRect.left,
            window.innerWidth + window.scrollX - tooltipMaxWidth - 16
          )
        );
  }

  // Spotlight cutout values
  const cutTop = spotlightRect.top - padding;
  const cutLeft = spotlightRect.left - padding;
  const cutWidth = spotlightRect.width + padding * 2;
  const cutHeight = spotlightRect.height + padding * 2;

  return (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: "none" }}>
      {/* Backdrop with spotlight cutout using box-shadow */}
      <div
        className="absolute rounded-lg"
        style={{
          pointerEvents: "auto",
          top: cutTop - window.scrollY,
          left: cutLeft - window.scrollX,
          width: cutWidth,
          height: cutHeight,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
          borderRadius: 8,
          transition: "all 0.3s ease",
        }}
        onClick={closeTour}
        aria-hidden="true"
      />

      {/* Spotlight border highlight */}
      <div
        className="absolute rounded-lg border-2 border-blue-400"
        style={{
          pointerEvents: "none",
          top: cutTop - window.scrollY,
          left: cutLeft - window.scrollX,
          width: cutWidth,
          height: cutHeight,
          transition: "all 0.3s ease",
        }}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: step.position === "bottom" ? -8 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: step.position === "bottom" ? -8 : 8 }}
          transition={{ duration: 0.2 }}
          className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600"
          style={{
            pointerEvents: "auto",
            top:
              step.position === "bottom"
                ? cutTop + cutHeight + 12 - window.scrollY
                : cutTop - 12 - window.scrollY,
            left: tooltipLeft - window.scrollX,
            maxWidth: tooltipMaxWidth,
            width: isMobile ? "calc(100vw - 32px)" : tooltipMaxWidth,
            transform:
              step.position === "top" ? "translateY(-100%)" : undefined,
          }}
        >
          {/* Arrow */}
          <div
            className={`absolute w-3 h-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rotate-45 ${
              step.position === "bottom"
                ? "-top-1.5 border-l border-t"
                : "-bottom-1.5 border-r border-b"
            }`}
            style={{
              left: Math.min(
                Math.max(
                  24,
                  spotlightRect.left +
                    spotlightRect.width / 2 -
                    (tooltipLeft - window.scrollX)
                ),
                (isMobile ? window.innerWidth - 32 : tooltipMaxWidth) - 24
              ),
            }}
          />

          <div className="p-4">
            {/* Step counter + close */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                {currentStep + 1} of {availableSteps.length}
              </span>
              <button
                onClick={closeTour}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 rounded cursor-pointer"
                aria-label="Close tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {step.title}
            </h4>

            {/* Content */}
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {step.content}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div>
                {!isFirst && (
                  <button
                    onClick={goPrev}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {!isLast && (
                  <button
                    onClick={closeTour}
                    className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    Skip tour
                  </button>
                )}
                <button
                  onClick={goNext}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  {isLast ? "Got it!" : "Next"}
                  {!isLast && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {availableSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === currentStep
                      ? "bg-blue-600"
                      : i < currentStep
                        ? "bg-blue-300 dark:bg-blue-700"
                        : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
