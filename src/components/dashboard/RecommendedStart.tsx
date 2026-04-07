"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";

const GOAL_TO_SLUG: Record<string, string> = {
  "web-fundamentals": "html-basics",
  frontend: "what-is-react",
  backend: "variables-and-data-types",
  dsa: "arrays-and-objects",
  "career-switch": "html-basics",
  "side-projects": "variables-and-data-types",
};

const EXPERIENCE_TO_SLUG: Record<string, string> = {
  intermediate: "functions-fundamentals",
  advanced: "javascript-modules-deep-dive",
};

const DEFAULT_SLUG = "variables-and-data-types";

function pickSlug(experienceLevel: string, learningGoals: string[]): string {
  if (EXPERIENCE_TO_SLUG[experienceLevel]) {
    return EXPERIENCE_TO_SLUG[experienceLevel];
  }
  for (const goal of learningGoals) {
    if (GOAL_TO_SLUG[goal]) return GOAL_TO_SLUG[goal];
  }
  return DEFAULT_SLUG;
}

async function fetchRecommendation() {
  const settingsRes = await fetch("/api/user/settings");
  if (!settingsRes.ok) return null;
  const { settings } = await settingsRes.json();

  const slug = pickSlug(
    settings?.experienceLevel ?? "beginner",
    settings?.learningGoals ?? []
  );

  const tutorialRes = await fetch(`/api/tutorials?slug=${encodeURIComponent(slug)}`);
  if (!tutorialRes.ok) return null;
  const { data: tutorial } = await tutorialRes.json();
  if (!tutorial) return null;

  return {
    title: tutorial.title as string,
    description: tutorial.description as string,
    href: `/tutorials/category/${tutorial.category?.slug ?? "fundamentals"}/${tutorial.slug}`,
  };
}

export function RecommendedStart() {
  const { data: recommendation } = useQuery({
    queryKey: ["recommended-tutorial"],
    queryFn: fetchRecommendation,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (!recommendation) return null;

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
              href={recommendation.href}
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
