"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";

interface RecommendedTutorial {
  slug: string;
  title: string;
  description: string;
  category: string;
}

/**
 * Map learning goals + experience level to a starter tutorial.
 * Falls back to JS fundamentals for beginners, or first matching goal.
 */
const GOAL_TO_TUTORIAL: Record<string, RecommendedTutorial> = {
  "web-fundamentals": {
    slug: "html-basics",
    title: "HTML Fundamentals",
    description: "Build your first web page from scratch",
    category: "html",
  },
  frontend: {
    slug: "what-is-react",
    title: "What is React?",
    description: "Understand modern frontend development",
    category: "react",
  },
  backend: {
    slug: "variables-and-data-types",
    title: "JavaScript Basics",
    description: "The foundation for Node.js and backend development",
    category: "fundamentals",
  },
  dsa: {
    slug: "arrays-and-objects",
    title: "Arrays and Objects",
    description: "Core data structures you'll use everywhere",
    category: "fundamentals",
  },
  "career-switch": {
    slug: "html-basics",
    title: "HTML Fundamentals",
    description: "The starting point for every web developer",
    category: "html",
  },
  "side-projects": {
    slug: "variables-and-data-types",
    title: "JavaScript Basics",
    description: "Get comfortable with JS before building anything",
    category: "fundamentals",
  },
};

const EXPERIENCE_OVERRIDES: Record<string, RecommendedTutorial> = {
  intermediate: {
    slug: "functions-fundamentals",
    title: "Functions Fundamentals",
    description: "Level up your JavaScript function skills",
    category: "fundamentals",
  },
  advanced: {
    slug: "javascript-modules-deep-dive",
    title: "JavaScript Modules Deep Dive",
    description: "ES modules, dynamic imports, and advanced patterns",
    category: "advanced-javascript",
  },
};

const DEFAULT_TUTORIAL: RecommendedTutorial = {
  slug: "variables-and-data-types",
  title: "Variables and Data Types",
  description: "Start with the building blocks of JavaScript",
  category: "fundamentals",
};

function getRecommendation(
  experienceLevel: string,
  learningGoals: string[]
): RecommendedTutorial {
  // Advanced or intermediate users skip the basics
  if (experienceLevel === "advanced" || experienceLevel === "intermediate") {
    return EXPERIENCE_OVERRIDES[experienceLevel] ?? DEFAULT_TUTORIAL;
  }

  // Match first learning goal
  for (const goal of learningGoals) {
    if (GOAL_TO_TUTORIAL[goal]) return GOAL_TO_TUTORIAL[goal];
  }

  return DEFAULT_TUTORIAL;
}

async function fetchSettings() {
  const res = await fetch("/api/user/settings");
  if (!res.ok) return null;
  const data = await res.json();
  return data.settings as {
    experienceLevel: string;
    learningGoals: string[];
  } | null;
}

export function RecommendedStart() {
  const { data: settings } = useQuery({
    queryKey: ["user-settings-onboarding"],
    queryFn: fetchSettings,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const recommendation = getRecommendation(
    settings?.experienceLevel ?? "beginner",
    settings?.learningGoals ?? []
  );

  return (
    <div className="mb-10">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/40">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Recommended for you
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Based on your goals
            </p>

            <Link
              href={`/tutorials/${recommendation.slug}`}
              className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="shrink-0">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {recommendation.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {recommendation.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
