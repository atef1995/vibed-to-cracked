"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Lock, Circle } from "lucide-react";
import type { StepListItem } from "@/hooks/useStep";

interface StepStepperProps {
  steps: StepListItem[];
  currentStepSlug: string;
  category: string;
  tutorialSlug: string;
}

export default function StepStepper({
  steps,
  currentStepSlug,
  category,
  tutorialSlug,
}: StepStepperProps) {
  const currentIndex = steps.findIndex((s) => s.slug === currentStepSlug);
  const completedCount = steps.filter((s) => s.passed).length;
  const totalCount = steps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allComplete = completedCount === totalCount;

  return (
    <>
      {/* Desktop — vertical sidebar */}
      <nav
        className="hidden lg:block w-64 shrink-0"
        aria-label="Tutorial steps"
      >
        <div className="sticky top-24 space-y-1">
          <div className="px-2 mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span className="font-semibold uppercase tracking-wider">Steps</span>
              <span>{completedCount}/{totalCount}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${allComplete ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          {steps.map((step, i) => {
            const isCurrent = step.slug === currentStepSlug;
            const isComplete = step.passed;
            const isLocked =
              !isComplete && i > 0 && !steps[i - 1]?.passed && !isCurrent;

            return (
              <StepItem
                key={step.id}
                step={step}
                index={i}
                isCurrent={isCurrent}
                isComplete={isComplete}
                isLocked={isLocked}
                category={category}
                tutorialSlug={tutorialSlug}
                isLast={i === steps.length - 1}
              />
            );
          })}
        </div>
      </nav>

      {/* Mobile — horizontal scrolling bar */}
      <nav
        className="lg:hidden -mx-4 px-4 mb-6"
        aria-label="Tutorial steps"
      >
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="font-medium">{completedCount}/{totalCount} steps</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${allComplete ? "bg-emerald-500" : "bg-blue-500"}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {steps.map((step, i) => {
            const isCurrent = step.slug === currentStepSlug;
            const isComplete = step.passed;
            const isLocked =
              !isComplete && i > 0 && !steps[i - 1]?.passed && !isCurrent;

            const baseClasses =
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors";

            if (isCurrent) {
              return (
                <span
                  key={step.id}
                  className={`${baseClasses} bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400/50`}
                >
                  <Circle className="w-3 h-3 fill-current" />
                  {step.order}. {step.title}
                </span>
              );
            }

            if (isComplete) {
              return (
                <Link
                  key={step.id}
                  href={`/tutorials/category/${category}/${tutorialSlug}/step/${step.slug}`}
                  className={`${baseClasses} bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {step.order}
                </Link>
              );
            }

            if (isLocked) {
              return (
                <span
                  key={step.id}
                  className={`${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed`}
                >
                  <Lock className="w-3 h-3" />
                  {step.order}
                </span>
              );
            }

            // Unlocked but not started
            return (
              <Link
                key={step.id}
                href={`/tutorials/category/${category}/${tutorialSlug}/step/${step.slug}`}
                className={`${baseClasses} bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <Circle className="w-3 h-3" />
                {step.order}
              </Link>
            );
          })}
        </div>
        </div>
      </nav>
    </>
  );
}

function StepItem({
  step,
  index,
  isCurrent,
  isComplete,
  isLocked,
  category,
  tutorialSlug,
  isLast,
}: {
  step: StepListItem;
  index: number;
  isCurrent: boolean;
  isComplete: boolean;
  isLocked: boolean;
  category: string;
  tutorialSlug: string;
  isLast: boolean;
}) {
  const href = `/tutorials/category/${category}/${tutorialSlug}/step/${step.slug}`;

  const icon = isComplete ? (
    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
  ) : isCurrent ? (
    <Circle className="w-5 h-5 text-blue-500 fill-blue-500 shrink-0" />
  ) : isLocked ? (
    <Lock className="w-5 h-5 text-gray-400 dark:text-gray-600 shrink-0" />
  ) : (
    <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600 shrink-0" />
  );

  const content = (
    <div className="flex items-start gap-3 relative">
      {/* Connector line */}
      {!isLast && (
        <div
          className={`absolute left-2 top-5 -z-10 w-0.5 h-full opacity-85 ${
            isComplete
              ? "bg-emerald-300 dark:bg-emerald-700"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
      )}
      {icon}
      <div className="min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isCurrent
              ? "text-blue-700 dark:text-blue-300"
              : isComplete
                ? "text-gray-700 dark:text-gray-300"
                : isLocked
                  ? "text-gray-400 dark:text-gray-600"
                  : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {step.order}. {step.title}
        </p>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div className="px-2 py-2 cursor-not-allowed opacity-60">{content}</div>
    );
  }

  if (isCurrent) {
    return (
      <div className="px-2 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="block px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      {content}
    </Link>
  );
}
