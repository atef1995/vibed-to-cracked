"use client";

import { FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ContentEmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function ContentEmptyState({
  icon: Icon = FileText,
  title = "No results found",
  subtitle = "Try adjusting your filters or search term",
  hasFilters,
  onClearFilters,
}: ContentEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 dark:border-gray-600">
      <Icon className="mb-4 h-12 w-12 text-gray-400" />
      <p className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-300">
        {title}
      </p>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="rounded-lg bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
