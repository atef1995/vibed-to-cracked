"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, BookOpen, Brain, Map, X } from "lucide-react";
import { useMood } from "@/components/providers/MoodProvider";
import { MoodId } from "@/types/mood";

const DISMISSED_KEY = "dashboard-onboarding-dismissed";
const STUDY_PLAN_VISITED_KEY = "onboarding-study-plan-visited";
const QUIZ_ATTEMPTED_KEY = "onboarding-quiz-attempted";

interface Step {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: typeof BookOpen;
  color: string;
}

const steps: Step[] = [
  {
    id: "tutorial",
    title: "Complete your first tutorial",
    description: "Start with JavaScript fundamentals and learn the basics",
    href: "/tutorials",
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "quiz",
    title: "Try a quiz",
    description: "Test what you've learned with mood-adapted questions",
    href: "/quizzes",
    icon: Brain,
    color: "text-green-600 dark:text-green-400",
  },
  {
    id: "study-plan",
    title: "Check out your study plan",
    description: "See the full roadmap and track your learning path",
    href: "/study-plan",
    icon: Map,
    color: "text-indigo-600 dark:text-indigo-400",
  },
];

interface OnboardingChecklistProps {
  hasMoodSet: boolean;
  tutorialsCompleted: number;
  challengesCompleted: number;
}

export function OnboardingChecklist({
  hasMoodSet,
  tutorialsCompleted,
  challengesCompleted,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(true);
  const [studyPlanVisited, setStudyPlanVisited] = useState(false);
  const [quizAttempted, setQuizAttempted] = useState(false);
  const { currentMood } = useMood();

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
    setStudyPlanVisited(
      localStorage.getItem(STUDY_PLAN_VISITED_KEY) === "true"
    );
    setQuizAttempted(localStorage.getItem(QUIZ_ATTEMPTED_KEY) === "true");
  }, []);

  if (dismissed) return null;

  const completedSteps: Record<string, boolean> = {
    mood: hasMoodSet || currentMood.id !== MoodId.CHILL,
    tutorial: tutorialsCompleted > 0,
    quiz: quizAttempted || challengesCompleted > 0,
    "study-plan": studyPlanVisited,
  };

  const totalSteps = steps.length + 1; // +1 for mood
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const allDone = completedCount >= totalSteps;

  if (allDone) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Get started
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {completedCount} of {totalSteps} steps done
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Dismiss onboarding"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mb-5">
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / totalSteps) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {/* Mood step (inline, not a link) */}
        <div
          className={`flex items-center gap-3 p-3 rounded-lg ${completedSteps.mood ? "bg-gray-50 dark:bg-gray-750" : "bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/40"}`}
        >
          <div
            className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              completedSteps.mood
                ? "bg-green-100 dark:bg-green-900/40"
                : "bg-blue-100 dark:bg-blue-800/40"
            }`}
          >
            {completedSteps.mood ? (
              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                1
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                completedSteps.mood
                  ? "text-gray-400 dark:text-gray-500 line-through"
                  : "text-blue-700 dark:text-blue-400"
              }`}
            >
              Pick your learning mood
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose between Chill, Rush, or Grind to personalize your
              experience
            </p>
          </div>
          {completedSteps.mood && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              Done
            </span>
          )}
        </div>

        {/* Dynamic steps */}
        {steps.map((step, index) => {
          const done = completedSteps[step.id];
          const Icon = step.icon;
          return (
            <Link
              key={step.id}
              href={step.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                done
                  ? "bg-gray-50 dark:bg-gray-750"
                  : "bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/40 hover:bg-blue-100/60 dark:hover:bg-blue-900/20"
              }`}
            >
              <div
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  done
                    ? "bg-green-100 dark:bg-green-900/40"
                    : "bg-blue-100 dark:bg-blue-800/40"
                }`}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                ) : (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {index + 2}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    done
                      ? "text-gray-400 dark:text-gray-500 line-through"
                      : "text-blue-700 dark:text-blue-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
              {done ? (
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Done
                </span>
              ) : (
                <Icon className={`h-4 w-4 shrink-0 ${step.color}`} />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
