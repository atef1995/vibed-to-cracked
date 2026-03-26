"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjectQueries";
import { useCategories } from "@/hooks/useTutorialQueries";
import ProjectCard from "@/components/ui/ProjectCard";
import { PageLayout } from "@/components/ui/PageLayout";
import { ContentGrid } from "@/components/ui/ContentGrid";
import { useMood } from "@/components/providers/MoodProvider";
import { Code, BookOpen, Trophy, Users, Sparkles } from "lucide-react";
import { useContentFilters } from "@/hooks/useContentFilters";
import { ContentSearchBar } from "@/components/ui/ContentSearchBar";
import {
  ContentFilterBar,
  FilterDropdown,
} from "@/components/ui/ContentFilterBar";
import { ContentEmptyState } from "@/components/ui/ContentEmptyState";
import { useMemo } from "react";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const { currentMood } = useMood();

  const {
    search,
    setSearch,
    debouncedSearch,
    filters,
    setFilter,
    hasActiveFilters,
    clearFilters,
  } = useContentFilters({ filterKeys: ["category"] });

  const projectsQuery = useProjects(filters.category || undefined);
  const categoriesQuery = useCategories(1, 100);

  const allProjects = projectsQuery.data || [];
  const categoriesData = categoriesQuery.data?.data || [];

  // Client-side search filtering
  const projects = useMemo(() => {
    if (!debouncedSearch) return allProjects;
    const q = debouncedSearch.toLowerCase();
    return allProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [allProjects, debouncedSearch]);

  const categoryOptions = categoriesData.map((cat) => ({
    value: cat.slug,
    label: cat.title,
  }));

  // Group projects by category for stats
  const projectsByCategory = projects.reduce(
    (acc, project) => {
      if (!acc[project.category]) {
        acc[project.category] = [];
      }
      acc[project.category].push(project);
      return acc;
    },
    {} as Record<string, typeof projects>
  );

  if (projectsQuery.isLoading || categoriesQuery.isLoading) {
    return (
      <PageLayout
        title="Projects"
        subtitle="Build real applications and get peer feedback"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading projects...
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (projectsQuery.error) {
    return (
      <PageLayout
        title="Projects"
        subtitle="Build real applications and get peer feedback"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              Error loading projects. Please try again.
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
      title="Build & Share Projects"
      subtitle={`Apply your skills in real-world projects • ${currentMood.name} mode`}
    >
      {/* Hero Section */}
      <div className="mb-12 bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Code className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            From Learning to Building
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Complete hands-on projects after finishing each learning module. Get
            constructive feedback from your peers and showcase your work.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Real-world applications
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Peer code reviews
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Public showcase
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <ContentSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
          className="max-w-md"
        />
        <ContentFilterBar
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        >
          <FilterDropdown
            options={categoryOptions}
            value={filters.category || ""}
            onChange={(val) => setFilter("category", val)}
            allLabel="All Categories"
            title="Category"
          />
        </ContentFilterBar>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <ContentEmptyState
          icon={Code}
          title={
            hasActiveFilters ? "No projects found" : "No Projects Available"
          }
          subtitle={
            hasActiveFilters
              ? "Try adjusting your search or category filter"
              : "Projects are coming soon! Complete tutorials to unlock project assignments."
          }
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      ) : (
        <ContentGrid>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              showCategory={!filters.category}
            />
          ))}
        </ContentGrid>
      )}

      {/* Quick Stats */}
      {projects.length > 0 && (
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Project Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {projects.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Projects
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {projects.filter((p) => !p.isPremium).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Free Projects
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Object.keys(projectsByCategory).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Categories
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {projects.reduce(
                  (sum, p) => sum + (p._count?.submissions || 0),
                  0
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Submissions
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
