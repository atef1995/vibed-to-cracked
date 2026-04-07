"use client";

import { useEffect, useRef } from "react";
import { useJoyride } from "react-joyride";
import type { Step, TooltipRenderProps, EventData } from "react-joyride";
import { ArrowRight, X } from "lucide-react";

function CustomTooltip({
  continuous,
  index,
  step,
  size,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-5 max-w-sm"
    >
      <button
        {...closeProps}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pr-6">
        {step.content}
      </p>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {index + 1} of {size}
        </span>

        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Back
            </button>
          )}
          {continuous && (
            <button
              {...primaryProps}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors"
            >
              {isLastStep ? "Done" : "Next"}
              {!isLastStep && <ArrowRight className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface TourProviderProps {
  steps: Step[];
  run: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

export function TourProvider({
  steps,
  run,
  onComplete,
  onSkip,
}: TourProviderProps) {
  const onCompleteRef = useRef(onComplete);
  const onSkipRef = useRef(onSkip);
  onCompleteRef.current = onComplete;
  onSkipRef.current = onSkip;

  const { Tour, on } = useJoyride({
    steps,
    run,
    continuous: true,
    tooltipComponent: CustomTooltip,
    options: {
      buttons: ["back", "close", "primary", "skip"],
    },
  });

  useEffect(() => {
    const unsub = on("tour:end", (data: EventData) => {
      if (data.status === "skipped") {
        (onSkipRef.current ?? onCompleteRef.current)();
      } else {
        onCompleteRef.current();
      }
    });

    return unsub;
  }, [on]);

  return Tour;
}
