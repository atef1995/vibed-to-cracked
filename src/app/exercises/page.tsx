"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, Loader } from "lucide-react";
import Card, { CardAction } from "@/components/ui/Card";
import { PageLayout } from "@/components/ui/PageLayout";
import { ContentGrid } from "@/components/ui/ContentGrid";
import { ContentSearchBar } from "@/components/ui/ContentSearchBar";
import {
  ContentFilterBar,
  FilterPills,
  FilterDropdown,
} from "@/components/ui/ContentFilterBar";
import { ContentEmptyState } from "@/components/ui/ContentEmptyState";
import Pagination from "@/components/ui/Pagination";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";
import { useContentFilters } from "@/hooks/useContentFilters";

interface Exercise {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  estimatedTime: number;
  topics: string[];
  prerequisiteTutorialCount?: number;
  prerequisitesCompleted?: number | null;
}

interface ExercisesResponse {
  data: Exercise[];
  categories: string[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function ExercisesPage() {
  const { data: session } = useSession();

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
    defaultPageSize: 9,
    filterKeys: ["difficulty", "category"],
  });

  const { data, isLoading, error } = useQuery<ExercisesResponse>({
    queryKey: ["exercises", queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/exercises?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch exercises");
      return response.json();
    },
  });

  const exercises = data?.data ?? [];
  const categories = data?.categories ?? [];
  const totalItems = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.pages ?? 1;

  return (
    <PageLayout
      title="Interactive Coding Exercises"
      subtitle="Master coding through hands-on practice. Solve real-world problems
            and build your portfolio."
      className="flex flex-col items-center"
    >
      <div className="max-w-7xl">
        {/* Guest Banner */}
        {!session?.user && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              You&apos;re browsing exercises as a guest. Sign up to save your
              progress and track your learning!
            </p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <ContentSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search exercises..."
          />
          <ContentFilterBar
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          >
            <FilterPills
              options={DIFFICULTY_OPTIONS}
              value={filters.difficulty || ""}
              onChange={(val) => setFilter("difficulty", val)}
              allLabel="All Levels"
            />
            {categories.length > 0 && (
              <FilterDropdown
                value={filters.category || ""}
                onChange={(val) => setFilter("category", val)}
                options={categories.map((c) => ({ value: c, label: c }))}
                allLabel="All Categories"
                title="Filter by category"
              />
            )}
          </ContentFilterBar>
        </div>

        {/* Loading State */}
        {isLoading && (
          <ContentGrid columns="3">
            {[0, 1, 2, 3, 4].map((el) => (
              <CardSkeleton key={el} />
            ))}
          </ContentGrid>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            Failed to load exercises. Please try again later.
          </div>
        )}

        {/* Exercises Grid */}
        {!isLoading && exercises.length > 0 && (
          <>
            <ContentGrid columns="3">
              {exercises.map((exercise) => (
                <Link key={exercise.slug} href={`/exercises/${exercise.slug}`}>
                  <Card
                    onClick={() => {}}
                    key={exercise.slug}
                    title={exercise.title}
                    description={exercise.description}
                    footer={
                      exercise.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {exercise.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {topic}
                            </span>
                          ))}
                          {exercise.topics.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                              +{exercise.topics.length - 3}
                            </span>
                          )}
                        </div>
                      )
                    }
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {exercise.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          DIFFICULTY_COLORS[exercise.difficulty]
                        }`}
                      >
                        {exercise.difficulty.charAt(0).toUpperCase() +
                          exercise.difficulty.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-5">
                      <CardAction.Info>{exercise.description}</CardAction.Info>
                      <CardAction.TimeInfo
                        time={exercise.estimatedTime}
                      ></CardAction.TimeInfo>
                      {exercise.prerequisiteTutorialCount != null &&
                        exercise.prerequisiteTutorialCount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs">
                            {exercise.prerequisitesCompleted != null &&
                            exercise.prerequisitesCompleted >=
                              exercise.prerequisiteTutorialCount ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  Ready
                                </span>
                              </>
                            ) : (
                              <>
                                <BookOpen className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                <span className="text-gray-500 dark:text-gray-400">
                                  {exercise.prerequisiteTutorialCount} tutorial
                                  {exercise.prerequisiteTutorialCount > 1
                                    ? "s"
                                    : ""}{" "}
                                  recommended
                                </span>
                              </>
                            )}
                          </div>
                        )}
                    </div>
                  </Card>
                </Link>
              ))}
            </ContentGrid>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={pageSize}
                  onPageChange={setPage}
                  showInfo={true}
                  showSizeSelector={true}
                  sizeOptions={[6, 9, 12]}
                  onSizeChange={setPageSize}
                />
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && exercises.length === 0 && !error && (
          <ContentEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        )}
      </div>
    </PageLayout>
  );
}
