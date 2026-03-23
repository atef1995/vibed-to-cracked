"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Eye, FileText, Loader, Search, Lock, Crown } from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";
import { ContentGrid } from "@/components/ui/ContentGrid";
import Pagination from "@/components/ui/Pagination";
import Card from "@/components/ui/Card";
import { useMood } from "@/components/providers/MoodProvider";
import { useMoodColors } from "@/hooks/useMoodColors";
import {
  MoodImpactIndicator,
  QuickMoodSwitcher,
} from "@/components/ui/MoodImpactIndicator";
import { Plan } from "@/lib/subscriptionConstants";

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

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debouncedValue;
}

export default function CheatSheetsPage() {
  const { data: session } = useSession();
  const { currentMood } = useMood();
  const moodColors = useMoodColors();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [premiumModalId, setPremiumModalId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 350);

  const { data, isLoading, error } = useQuery<CheatSheetsResponse>({
    queryKey: [
      "cheat-sheets",
      debouncedSearch,
      selectedDifficulty,
      selectedCategory,
      currentPage,
      itemsPerPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: debouncedSearch,
        category: selectedCategory || "",
        difficulty: selectedDifficulty || "",
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/cheat-sheets?${params}`);
      if (!response.ok) throw new Error("Failed to fetch cheat sheets");
      return response.json();
    },
  });

  const cheatSheets = data?.data ?? [];
  const categories = data?.categories ?? [];
  const totalItems = data?.pagination?.total ?? 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDifficulty(null);
    setSelectedCategory(null);
    setCurrentPage(1);
  };

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
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cheat sheets..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty || ""}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value || null);
              setCurrentPage(1);
            }}
            title="Filter by difficulty level"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory || ""}
            onChange={(e) => {
              setSelectedCategory(e.target.value || null);
              setCurrentPage(1);
            }}
            title="Filter by category"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Items Per Page */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            title="Items per page"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value={3}>3 per page</option>
            <option value={6}>6 per page</option>
            <option value={9}>9 per page</option>
            <option value={12}>12 per page</option>
          </select>

          {/* Clear Filters Button */}
          {(searchTerm || selectedDifficulty || selectedCategory) && (
            <button
              onClick={clearFilters}
              className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          )}
        </div>
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
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Empty State */}
      {!isLoading && cheatSheets.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 dark:border-gray-600">
          <FileText className="mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
            No cheat sheets found
          </p>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your filters or search term
          </p>
          {(searchTerm || selectedDifficulty || selectedCategory) && (
            <button
              onClick={clearFilters}
              className="rounded-lg bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600"
            >
              Clear Filters
            </button>
          )}
        </div>
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
