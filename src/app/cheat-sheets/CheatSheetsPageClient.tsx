"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Eye, FileText, Loader, Lock, Crown } from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";
import { ContentGrid } from "@/components/ui/ContentGrid";
import Pagination from "@/components/ui/Pagination";
import Card from "@/components/ui/Card";
import { ContentSearchBar } from "@/components/ui/ContentSearchBar";
import {
  ContentFilterBar,
  FilterDropdown,
} from "@/components/ui/ContentFilterBar";
import { ContentEmptyState } from "@/components/ui/ContentEmptyState";
import { useMood } from "@/components/providers/MoodProvider";
import { useMoodColors } from "@/hooks/useMoodColors";
import {
  MoodImpactIndicator,
  QuickMoodSwitcher,
} from "@/components/ui/MoodImpactIndicator";
import { Plan } from "@/lib/subscriptionConstants";
import { useContentFilters } from "@/hooks/useContentFilters";

interface CheatSheet {
  id: string;
  slug: string;
  title: string;
  topic: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  fileSize: string;
  fileFormat: "PDF" | "PNG" | "SVG";
  downloadUrl: string;
  previewUrl?: string;
  tags: string[];
  requiredPlan?: "VIBED" | "CRACKED";
  isPremium?: boolean;
}

interface CheatSheetsResponse {
  data: CheatSheet[];
  categories: string[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function CheatSheetsPageClient() {
  const { data: session } = useSession();
  const { currentMood } = useMood();
  const moodColors = useMoodColors();
  const router = useRouter();

  const {
    search,
    setSearch,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    queryParams,
  } = useContentFilters({
    defaultPageSize: 6,
    filterKeys: ["difficulty", "category"],
  });

  const [premiumModalId, setPremiumModalId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<CheatSheetsResponse>({
    queryKey: ["cheat-sheets", queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/cheat-sheets?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch cheat sheets");
      return response.json();
    },
  });

  const cheatSheets = data?.data ?? [];
  const categories = data?.categories ?? [];
  const totalItems = data?.pagination?.total ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const premiumSheet = premiumModalId
    ? cheatSheets.find((s) => s.id === premiumModalId)
    : null;

  return (
    <PageLayout title="Cheat Sheets" subtitle="Quick reference guides">
      {/* Header with Mood Section */}
      <div
        className={`mb-8 rounded-lg border p-6 transition-colors duration-300 ${moodColors.border} ${moodColors.gradient}`}
      >
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <MoodImpactIndicator />
          <QuickMoodSwitcher />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <ContentSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search cheat sheets..."
        />
        <ContentFilterBar
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        >
          <FilterDropdown
            value={filters.difficulty || ""}
            onChange={(val) => setFilter("difficulty", val)}
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]}
            allLabel="All Difficulties"
            title="Filter by difficulty level"
          />
          <FilterDropdown
            value={filters.category || ""}
            onChange={(val) => setFilter("category", val)}
            options={categories.map((cat) => ({ value: cat, label: cat }))}
            allLabel="All Categories"
            title="Filter by category"
          />
        </ContentFilterBar>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          Failed to load cheat sheets. Please try again later.
        </div>
      )}

      {/* Cheat Sheets Grid */}
      {!isLoading && cheatSheets.length > 0 && (
        <>
          <ContentGrid columns="3">
            {cheatSheets.map((sheet) => (
              <Card
                description={sheet.description}
                key={sheet.id}
                isPremium={sheet.isPremium}
                requiredPlan={sheet.requiredPlan}
                onPremiumClick={() => {
                  if (
                    sheet.isPremium &&
                    session?.user?.subscription === Plan.FREE
                  ) {
                    setPremiumModalId(sheet.id);
                  }
                }}
                actions={
                  <div className="flex gap-2">
                    <Link
                      href={`/cheat-sheets/${sheet.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gray-100 py-2 font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Link>
                    {sheet.isPremium &&
                    (!session || session?.user?.subscription === Plan.FREE) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPremiumModalId(sheet.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-yellow-400 to-orange-500 py-2 font-medium text-white hover:from-yellow-500 hover:to-orange-600"
                      >
                        <Crown className="h-4 w-4" />
                        Unlock
                      </button>
                    ) : (
                      <Link
                        href={`/cheat-sheets/${sheet.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 font-medium text-white hover:bg-blue-600"
                      >
                        <FileText className="h-4 w-4" />
                        View
                      </Link>
                    )}
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Difficulty Badge */}
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-block rounded px-3 py-1 text-xs font-semibold text-white ${
                        sheet.difficulty === "beginner"
                          ? "bg-green-500"
                          : sheet.difficulty === "intermediate"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    >
                      {sheet.difficulty.charAt(0).toUpperCase() +
                        sheet.difficulty.slice(1)}
                    </span>
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>

                  {/* Title & Topic */}
                  <div>
                    <h3 className="mb-1 font-bold text-gray-900 dark:text-white">
                      {sheet.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {sheet.topic}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sheet.description}
                  </p>

                  {/* Tags */}
                  {sheet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {sheet.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {sheet.fileFormat} - {sheet.fileSize}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </ContentGrid>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={setPage}
            showSizeSelector={true}
            sizeOptions={[3, 6, 9, 12]}
            onSizeChange={setPageSize}
          />
        </>
      )}

      {/* Empty State */}
      {!isLoading && cheatSheets.length === 0 && !error && (
        <ContentEmptyState
          icon={FileText}
          title="No cheat sheets found"
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      )}

      {/* Premium Lock Modal */}
      {premiumSheet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setPremiumModalId(null)}
        >
          <div
            className={`w-full max-w-md rounded-lg bg-white p-8 dark:bg-gray-800 shadow-2xl border-2 ${moodColors.border}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lock Icon */}
            <div className="flex justify-center mb-6">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-r ${moodColors.gradient} text-white shadow-lg`}
              >
                <Lock className="w-10 h-10" />
              </div>
            </div>

            {/* Cheat Sheet Title */}
            <h3 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {premiumSheet.title}
            </h3>

            {/* Premium Required Text */}
            <p className="text-center text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {premiumSheet.requiredPlan} Content
            </p>

            {/* Description */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
              {premiumSheet.description}
            </p>

            {/* Mood-based message */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
              {currentMood.id === "rush" &&
                "Unlock all premium resources and accelerate your learning."}
              {currentMood.id === "grind" &&
                "Level up with premium content and keep the momentum going."}
              {currentMood.id === "chill" &&
                "Explore premium content at your own pace."}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setPremiumModalId(null)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setPremiumModalId(null);
                  router.push("/pricing");
                }}
                className={`flex-1 rounded-lg bg-linear-to-r ${moodColors.gradient} px-4 py-3 font-medium text-white hover:shadow-lg transition-all`}
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
