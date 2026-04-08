"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

interface Tutorial {
  slug: string;
  title: string;
  description: string;
  difficulty: number;
  estimatedTime: number;
  category: {
    slug: string;
    title: string;
  };
}

const difficultyLabels: Record<number, string> = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
};

const difficultyColors: Record<number, string> = {
  1: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  2: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  3: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

async function fetchBeginnerTutorials(): Promise<Tutorial[]> {
  const res = await fetch("/api/tutorials?limit=6");
  if (!res.ok) return [];
  const json = await res.json();
  const tutorials = json.data ?? [];
  return tutorials.filter((t: Tutorial) => t.difficulty <= 2).slice(0, 3);
}

export function RecommendedTutorials() {
  const { data: tutorials, isLoading } = useQuery({
    queryKey: ["anonymous-recommended-tutorials"],
    queryFn: fetchBeginnerTutorials,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Jump right in
        </h2>
        <div className="grid md:grid-cols-3 gap-5 auto-rows-fr">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 animate-pulse"
            >
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/50 rounded mb-1" />
              <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-700/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tutorials || tutorials.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        Jump right in
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        No account needed — start learning now
      </p>
      <div className="grid md:grid-cols-3 gap-5 auto-rows-fr">
        {tutorials.map((tutorial) => (
          <Link
            key={tutorial.slug}
            href={`/tutorials/category/${tutorial.category.slug}/${tutorial.slug}`}
            className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  difficultyColors[tutorial.difficulty] ?? difficultyColors[1]
                }`}
              >
                {difficultyLabels[tutorial.difficulty] ?? "Beginner"}
              </span>
              {tutorial.estimatedTime > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {tutorial.estimatedTime}m
                </span>
              )}
            </div>

            <div className="grow">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tutorial.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {tutorial.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400">
                {tutorial.category.title}
              </span>
              <span className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium">
                Start
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
