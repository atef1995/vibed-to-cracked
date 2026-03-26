"use client";

import Link from "next/link";
import { BookOpen, Code, Zap, Building } from "lucide-react";
import { useContinueLearning, ContinueItem } from "@/hooks/useProgress";

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const typeConfig: Record<
  ContinueItem["type"],
  { icon: typeof BookOpen; color: string; label: string }
> = {
  tutorial: {
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400",
    label: "Tutorial",
  },
  challenge: {
    icon: Code,
    color: "text-purple-600 dark:text-purple-400",
    label: "Challenge",
  },
  exercise: {
    icon: Zap,
    color: "text-indigo-600 dark:text-indigo-400",
    label: "Exercise",
  },
  project: {
    icon: Building,
    color: "text-orange-600 dark:text-orange-400",
    label: "Project",
  },
};

function ContinueCard({ item }: { item: ContinueItem }) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <Link
      href={item.href}
      className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 group"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="shrink-0">
          <Icon className={`h-6 w-6 ${config.color}`} />
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {config.label}
        </span>
      </div>

      <div className="flex-grow">
        <p className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {item.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-1">
          {item.categoryTitle && `In ${item.categoryTitle}`}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {timeAgo(item.updatedAt)}
        </span>
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Resume &rarr;
        </span>
      </div>
    </Link>
  );
}

export function ContinueLearning({ userId }: { userId?: string }) {
  const { data: items, isLoading } = useContinueLearning(userId);

  if (isLoading) {
    return (
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Continue where you left off
        </h2>
        <div className="grid gap-6 auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-h-[160px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Recent Activity
        </h2>
        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/30 text-center shadow-sm">
          <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
          <h3 className="text-gray-900 dark:text-gray-100 font-medium mb-1">
            No recent activity
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            You haven't started any tutorials or exercises yet. Pick a topic
            below to jump in!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Continue where you left off
      </h2>
      <div className="grid gap-6 auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ContinueCard key={`${item.type}-${item.slug}`} item={item} />
        ))}
      </div>
    </div>
  );
}
