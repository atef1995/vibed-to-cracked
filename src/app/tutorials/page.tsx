"use client";

import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCategoriesWithStats,
  CategoryWithStats,
} from "@/hooks/useTutorialQueries";
import CategoryCard from "@/components/ui/CategoryCard";
import { PageLayout } from "@/components/ui/PageLayout";
import { ContentGrid } from "@/components/ui/ContentGrid";
import Pagination from "@/components/ui/Pagination";
import { useMood } from "@/components/providers/MoodProvider";
import {
  MoodImpactIndicator,
  QuickMoodSwitcher,
} from "@/components/ui/MoodImpactIndicator";
import ErrorBoundary, {
  ComponentErrorFallback,
} from "@/components/ErrorBoundary";
import {
  CategoriesGridSkeleton,
  MoodImpactSkeleton,
  StatsCardSkeleton,
} from "@/components/tutorial/TutorialSkeleton";
import CategoryLoading from "./category/loading";
import { useContentFilters } from "@/hooks/useContentFilters";
import { ContentSearchBar } from "@/components/ui/ContentSearchBar";
import {
  ContentFilterBar,
  FilterPills,
  FilterDropdown,
} from "@/components/ui/ContentFilterBar";
import { ContentEmptyState } from "@/components/ui/ContentEmptyState";
import { useMemo } from "react";

export default function TutorialsPage() {
  const { data: session } = useSession();
  const { currentMood } = useMood();
  const router = useRouter();
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  const {
    search,
    setSearch,
    debouncedSearch,
    filters,
    setFilter,
    hasActiveFilters,
    clearFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useContentFilters({
    defaultPageSize: 6,
    filterKeys: ["difficulty", "status", "topic"],
  });

  // Detect anonymous user state
  const isAnonymous = !session;

  // Fetch optimized categories with stats (includes tutorial counts and user progress)
  const { data, error, isLoading } = useCategoriesWithStats(page, pageSize);

  // Get categories data from paginated response
  const allCategories = data?.data || [];
  const categoryPagination = data?.pagination;
  const overallStats = data?.overallStats;

  // Collect unique topics from all categories for the dropdown
  const topicOptions = useMemo(() => {
    const topicSet = new Set<string>();
    for (const cat of allCategories) {
      if (cat.topics) {
        for (const t of cat.topics) topicSet.add(t);
      }
    }
    return Array.from(topicSet)
      .sort()
      .map((t) => ({ value: t, label: t }));
  }, [allCategories]);

  // Client-side filtering: search + difficulty + status + topic
  const categories = useMemo(() => {
    let result = allCategories;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (cat) =>
          cat.title.toLowerCase().includes(q) ||
          cat.description?.toLowerCase().includes(q) ||
          cat.slug.toLowerCase().includes(q)
      );
    }

    if (filters.difficulty) {
      result = result.filter((cat) => cat.difficulty === filters.difficulty);
    }

    if (filters.status && session) {
      result = result.filter((cat) => {
        const completed = cat.tutorialStats?.completed ?? 0;
        const total = cat.tutorialStats?.total ?? 0;
        if (filters.status === "completed")
          return completed > 0 && completed >= total;
        if (filters.status === "in-progress")
          return completed > 0 && completed < total;
        if (filters.status === "not-started") return completed === 0;
        return true;
      });
    }

    if (filters.topic) {
      result = result.filter((cat) => cat.topics?.includes(filters.topic));
    }

    return result;
  }, [allCategories, debouncedSearch, filters, session]);

  // When filters are active, pagination reflects the filtered list
  const isFiltered = hasActiveFilters;
  const totalItems = isFiltered
    ? categories.length
    : categoryPagination?.totalCount || 0;
  const totalPages = isFiltered
    ? Math.max(1, Math.ceil(categories.length / pageSize))
    : categoryPagination?.totalPages || 1;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const categoriesSection = document.getElementById("categories-section");
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    setLoadingCategory(categorySlug);
    router.push(`/tutorials/category/${categorySlug}`);
  };

  // Clear loading state after a timeout to prevent stuck loading states
  useEffect(() => {
    if (loadingCategory) {
      const timeout = setTimeout(() => {
        setLoadingCategory(null);
      }, 5000); // Clear after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [loadingCategory]);

  // Optimized category stats - now comes from the server
  const getCategoryStats = (category: CategoryWithStats) => {
    return {
      total: category.tutorialStats?.total || 0,
      completed: category.tutorialStats?.completed || 0,
    };
  };

  if (isLoading) {
    return <CategoryLoading />;
  }

  if (error) {
    return (
      <PageLayout
        title="JavaScript Tutorials"
        subtitle="Interactive lessons tailored to your learning style"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              Error loading tutorials. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Tutorials"
      subtitle={`Interactive lessons tailored to your ${currentMood.name.toLowerCase()} learning style`}
    >
      {/* Mood Impact */}
      <div className="mb-8">
        <ErrorBoundary fallback={ComponentErrorFallback}>
          <Suspense fallback={<MoodImpactSkeleton />}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <MoodImpactIndicator context="tutorial" />
                </div>
                <div className="ml-6">
                  <QuickMoodSwitcher />
                </div>
              </div>
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Anonymous user nudge */}
      {isAnonymous && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          Want to save your progress?{" "}
          <a
            href="/auth/signin"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Create a free account
          </a>
        </p>
      )}

      {/* Categories Grid */}
      <div className="mb-8" id="categories-section">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Choose a Learning Path
          </h2>
          <ContentSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search categories..."
            className="max-w-xs"
          />
        </div>
        <ContentFilterBar
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
          className="mb-6"
        >
          <FilterPills
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]}
            value={filters.difficulty || ""}
            onChange={(val) => setFilter("difficulty", val)}
            allLabel="All Levels"
          />
          {session && (
            <FilterDropdown
              options={[
                { value: "completed", label: "Completed" },
                { value: "in-progress", label: "In Progress" },
                { value: "not-started", label: "Not Started" },
              ]}
              value={filters.status || ""}
              onChange={(val) => setFilter("status", val)}
              allLabel="Any Status"
              title="Filter by status"
            />
          )}
          {topicOptions.length > 0 && (
            <FilterDropdown
              options={topicOptions}
              value={filters.topic || ""}
              onChange={(val) => setFilter("topic", val)}
              allLabel="All Topics"
              title="Filter by topic"
            />
          )}
        </ContentFilterBar>
        <ErrorBoundary fallback={ComponentErrorFallback}>
          <Suspense fallback={<CategoriesGridSkeleton />}>
            {categories.length === 0 ? (
              <ContentEmptyState
                title={
                  hasActiveFilters
                    ? "No categories found"
                    : "No categories available"
                }
                subtitle={
                  hasActiveFilters
                    ? "Try a different search term"
                    : "Check back soon!"
                }
                hasFilters={hasActiveFilters}
                onClearFilters={clearFilters}
              />
            ) : (
              <ContentGrid>
                {categories.map((category) => {
                  const stats = getCategoryStats(category);

                  return (
                    <CategoryCard
                      key={category.id}
                      category={category.slug}
                      title={category.title}
                      tutorialCount={stats.total}
                      completedCount={stats.completed}
                      totalDuration={category.duration}
                      difficulty={
                        category.difficulty as
                          | "beginner"
                          | "intermediate"
                          | "advanced"
                      }
                      description={category.description}
                      topics={category.topics}
                      onClick={() => handleCategoryClick(category.slug)}
                      isLoading={loadingCategory === category.slug}
                    />
                  );
                })}
              </ContentGrid>
            )}
          </Suspense>
        </ErrorBoundary>

        {/* Categories Pagination */}
        {totalPages > 1 && (
          <ErrorBoundary fallback={ComponentErrorFallback}>
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={pageSize}
                onPageChange={handlePageChange}
                showInfo={true}
                showSizeSelector={true}
                sizeOptions={[3, 6, 9, 12]}
                onSizeChange={setPageSize}
                className="justify-center"
                compact={false}
              />
            </div>
          </ErrorBoundary>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mb-8">
        <ErrorBoundary fallback={ComponentErrorFallback}>
          <Suspense fallback={<StatsCardSkeleton />}>
            {isAnonymous ? (
              // Anonymous user - subtle nudge
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Track Your Learning Progress
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <a
                    href="/auth/signin"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Sign up free
                  </a>{" "}
                  to save progress and earn achievements
                </p>
              </div>
            ) : (
              // Authenticated user - show actual stats
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Your Learning Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {overallStats?.totalTutorials || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Tutorials
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {overallStats?.completedTutorials || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Completed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {overallStats && overallStats.totalTutorials > 0
                        ? Math.round(
                            (overallStats.completedTutorials /
                              overallStats.totalTutorials) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Completion
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Coming Soon */}
      <div className="text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            More Content Coming Soon!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We&apos;re constantly adding new tutorials and categories. Have a
            topic you&apos;d like to see covered?
          </p>
          <button className="bg-purple-600 dark:bg-purple-700 text-white py-2 px-6 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors">
            Suggest a Tutorial
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
