"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import type { TutorialWithCategory } from "@/types/tutorial";

interface PrerequisiteItem {
  tutorial: TutorialWithCategory;
  tutorialCompleted: boolean;
  quizPassed: boolean;
  quizBestScore: number | null;
}

interface PrerequisiteTutorialsProps {
  exerciseSlug: string;
}

const DifficultyBadge = ({ difficulty }: { difficulty: number }) => {
  const levels = ["Beginner", "Easy", "Medium", "Advanced", "Expert"];
  const colors = [
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  ];

  const level = levels[difficulty - 1] || "Unknown";
  const colorClass = colors[difficulty - 1] || colors[2];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {level}
    </span>
  );
};

function StatusIndicator({
  tutorialCompleted,
  quizPassed,
}: {
  tutorialCompleted: boolean;
  quizPassed: boolean;
}) {
  if (quizPassed) {
    return (
      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-xs font-medium">Completed</span>
      </div>
    );
  }
  if (tutorialCompleted) {
    return (
      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-4 w-4" />
        <span className="text-xs font-medium">Quiz pending</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
      <Circle className="h-4 w-4" />
      <span className="text-xs font-medium">Not started</span>
    </div>
  );
}

export function PrerequisiteTutorials({
  exerciseSlug,
}: PrerequisiteTutorialsProps) {
  const { data: session } = useSession();
  const [prerequisites, setPrerequisites] = useState<PrerequisiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    async function fetchPrerequisites() {
      try {
        const response = await fetch(
          `/api/exercises/slug/${exerciseSlug}/prerequisites`
        );
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const data = await response.json();
        setPrerequisites(data);
      } catch {
        // Silently fail — this section is optional
      } finally {
        setLoading(false);
      }
    }

    fetchPrerequisites();
  }, [exerciseSlug]);

  if (loading) {
    return (
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (prerequisites.length === 0) return null;

  const completedCount = prerequisites.filter((p) => p.quizPassed).length;
  const allCompleted = completedCount === prerequisites.length;
  const isAuthenticated = !!session?.user;

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Recommended Preparation
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {allCompleted && isAuthenticated
                ? "You've completed all recommended tutorials"
                : "Complete these tutorials first if you're new to the topic"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                allCompleted
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {completedCount}/{prerequisites.length}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          {!isAuthenticated && (
            <p className="text-xs text-gray-500 dark:text-gray-400 pb-1">
              Sign in to track your progress on these tutorials.
            </p>
          )}

          {prerequisites.map(({ tutorial, tutorialCompleted, quizPassed }) => (
            <Link
              key={tutorial.id}
              href={`/tutorials/category/${tutorial.category.slug}/${tutorial.slug}`}
              className="group flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
            >
              <div className="grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {tutorial.title}
                  </h4>
                  <DifficultyBadge difficulty={tutorial.difficulty} />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {tutorial.estimatedTime} min
                  </span>
                  <span>{tutorial.category.title}</span>
                </div>
              </div>

              {isAuthenticated && (
                <div className="shrink-0">
                  <StatusIndicator
                    tutorialCompleted={tutorialCompleted}
                    quizPassed={quizPassed}
                  />
                </div>
              )}

              <span className="shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {quizPassed ? "Review" : "Start"}
              </span>
            </Link>
          ))}

          {allCompleted && isAuthenticated && (
            <div className="flex items-center gap-2 pt-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                You're all set — you've completed the recommended preparation
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
