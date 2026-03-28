"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  Circle,
  Lock,
  Play,
  ArrowRight,
  BookOpen,
  Code2,
  HelpCircle,
} from "lucide-react";
import { type TutorialData } from "@/hooks/useTutorial";
import { useStepList } from "@/hooks/useStep";
import getMoodColors from "@/lib/getMoodColors";
import { useMood } from "@/components/providers/MoodProvider";

interface TutorialOverviewProps {
  tutorial: TutorialData;
  category: string;
}

export default function TutorialOverview({
  tutorial,
  category,
}: TutorialOverviewProps) {
  const { currentMood } = useMood();
  const moodColors = getMoodColors(currentMood.id);
  const { data: session } = useSession();

  // Fetch steps with progress from the API (gives us per-step passed/attempts info)
  const { data: stepListData, isLoading: stepsLoading } = useStepList(
    tutorial.slug
  );

  const steps = stepListData?.steps || [];
  const completedCount = steps.filter((s) => s.passed).length;
  const totalSteps = steps.length;
  const allStepsComplete = totalSteps > 0 && completedCount === totalSteps;

  // Find the first incomplete step to suggest "Continue"
  const nextStep = steps.find((s) => !s.passed);
  const hasStarted = completedCount > 0;

  const basePath = `/tutorials/category/${category}/${tutorial.slug}`;

  return (
    <div className="space-y-6">
      {/* Progress summary card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Progress
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {completedCount} of {totalSteps} steps completed
            </p>
          </div>

          {/* CTA button */}
          {nextStep ? (
            <Link
              href={`${basePath}/step/${nextStep.slug}`}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all hover:shadow-lg ${moodColors.button}`}
            >
              {hasStarted ? (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Start Tutorial
                  <Play className="w-4 h-4" />
                </>
              )}
            </Link>
          ) : allStepsComplete ? (
            tutorial.exerciseSlug ? (
              <Link
                href={`/exercises/${tutorial.exerciseSlug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
              >
                Go to Exercise
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : tutorial.quiz ? (
              <Link
                href={`/quiz/${tutorial.quiz.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
              >
                Take the Quiz
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : null
          ) : null}
        </div>

        {/* Progress bar */}
        {totalSteps > 0 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                allStepsComplete ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{
                width: `${(completedCount / totalSteps) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Step list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg dark:shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          Steps
        </h2>

        {stepsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step, i) => {
              const isComplete = step.passed;
              const isCurrent = nextStep?.slug === step.slug;
              const isLocked =
                !isComplete && i > 0 && !steps[i - 1]?.passed && !isCurrent;

              return (
                <StepRow
                  key={step.id}
                  step={step}
                  index={i}
                  isComplete={isComplete}
                  isCurrent={isCurrent}
                  isLocked={isLocked}
                  basePath={basePath}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Exercise & Quiz summary */}
      {(tutorial.exerciseSlug || tutorial.quiz) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg dark:shadow-xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            After the steps
          </h2>
          <div className="space-y-3">
            {tutorial.exerciseSlug && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                <Code2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Capstone Exercise
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Apply everything you learned in a hands-on challenge
                  </p>
                </div>
                {allStepsComplete ? (
                  <Link
                    href={`/exercises/${tutorial.exerciseSlug}`}
                    className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Start
                  </Link>
                ) : (
                  <Lock className="w-4 h-4 text-gray-400 dark:text-gray-600 shrink-0" />
                )}
              </div>
            )}
            {tutorial.quiz && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                <HelpCircle className="w-5 h-5 text-purple-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Quiz
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Test your understanding —{" "}
                    {tutorial.quiz.questions?.length || 0} questions
                  </p>
                </div>
                <Lock className="w-4 h-4 text-gray-400 dark:text-gray-600 shrink-0" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepRow({
  step,
  index,
  isComplete,
  isCurrent,
  isLocked,
  basePath,
}: {
  step: {
    slug: string;
    order: number;
    title: string;
    description: string | null;
    attempts: number;
  };
  index: number;
  isComplete: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  basePath: string;
}) {
  const icon = isComplete ? (
    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
  ) : isCurrent ? (
    <Circle className="w-6 h-6 text-blue-500 fill-blue-500 shrink-0" />
  ) : isLocked ? (
    <Lock className="w-6 h-6 text-gray-400 dark:text-gray-600 shrink-0" />
  ) : (
    <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600 shrink-0" />
  );

  const wrapper = (children: React.ReactNode) => {
    if (isLocked) {
      return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 opacity-60 cursor-not-allowed">
          {children}
        </div>
      );
    }

    return (
      <Link
        href={`${basePath}/step/${step.slug}`}
        className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
          isCurrent
            ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800"
            : "bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/60"
        }`}
      >
        {children}
      </Link>
    );
  };

  return wrapper(
    <>
      {icon}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            isLocked
              ? "text-gray-400 dark:text-gray-600"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {step.order}. {step.title}
        </p>
        {step.description && (
          <p
            className={`text-xs mt-0.5 truncate ${
              isLocked
                ? "text-gray-400 dark:text-gray-600"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {step.description}
          </p>
        )}
      </div>
      {isCurrent && (
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 shrink-0">
          Current
        </span>
      )}
      {isComplete && step.attempts > 1 && (
        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
          {step.attempts} tries
        </span>
      )}
    </>
  );
}
