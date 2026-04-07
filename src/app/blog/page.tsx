"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/ui/PageLayout";
import { ContentGrid } from "@/components/ui/ContentGrid";
import Pagination from "@/components/ui/Pagination";
import { ContentSearchBar } from "@/components/ui/ContentSearchBar";
import {
  ContentFilterBar,
  FilterPills,
} from "@/components/ui/ContentFilterBar";
import { ContentEmptyState } from "@/components/ui/ContentEmptyState";
import { Calendar, Clock, User, Tag } from "lucide-react";
import { useContentFilters } from "@/hooks/useContentFilters";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  readingTime: number;
  publishedAt: string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  category: {
    id: string;
    slug: string;
    name: string;
  } | null;
}

interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  _count: {
    posts: number;
  };
}

export default function BlogPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);

  const {
    search,
    setSearch,
    debouncedSearch,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    page,
    setPage,
    pageSize,
    queryParams,
  } = useContentFilters({
    defaultPageSize: 9,
    filterKeys: ["category"],
  });

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/blog/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch featured posts
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await fetch("/api/blog?featured=true&limit=3");
        const data = await response.json();
        if (data.success) {
          setFeaturedPosts(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch featured posts:", error);
      }
    }
    fetchFeatured();
  }, []);

  // Fetch posts with filters via TanStack Query
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["blog-posts", queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/blog?${queryParams}`);
      const data = await response.json();
      if (!data.success) throw new Error("Failed to fetch posts");
      return data;
    },
  });

  const posts: BlogPost[] = postsData?.data ?? [];
  const totalPages = postsData?.pagination?.totalPages ?? 1;
  const totalItems = postsData?.pagination?.totalCount ?? 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.slug,
    label: `${cat.name} (${cat._count.posts})`,
  }));

  return (
    <PageLayout
      title="Blog"
      subtitle="Insights, tutorials, and updates from the team"
      className="flex flex-col space-y-5"
    >
      {/* Featured Posts */}
      {featuredPosts.length > 0 &&
        !debouncedSearch &&
        !filters.category &&
        page === 1 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-400 dark:text-gray-100 mb-6">
              Featured Posts
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Main featured post */}
              {featuredPosts[0] && (
                <Link
                  href={`/blog/${featuredPosts[0].slug}`}
                  className="group relative block rounded-2xl overflow-hidden bg-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow lg:row-span-2 lg:p-32"
                >
                  {featuredPosts[0].coverImage && (
                    <div className="h-64 lg:h-full">
                      <Image
                        src={featuredPosts[0].coverImage}
                        alt={featuredPosts[0].title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    {featuredPosts[0].category && (
                      <span className="inline-block px-3 py-1 bg-blue-600 rounded-full text-sm mb-3">
                        {featuredPosts[0].category.name}
                      </span>
                    )}
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-300 transition-colors">
                      {featuredPosts[0].title}
                    </h3>
                    <p className="text-gray-200 line-clamp-2 mb-4">
                      {featuredPosts[0].excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(featuredPosts[0].publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredPosts[0].readingTime} min read
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Secondary featured posts */}
              <div className="space-y-6">
                {featuredPosts.slice(1).map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-4 bg-gray-700 dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {post.coverImage && (
                      <div className="relative w-32 h-24 shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {post.category && (
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {post.category.name}
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-400 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatDate(post.publishedAt)}</span>
                        <span>{post.readingTime} min</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <ContentSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search articles..."
          className="max-w-md"
        />
        {categories.length > 0 && (
          <ContentFilterBar
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          >
            <FilterPills
              options={categoryOptions}
              value={filters.category || ""}
              onChange={(val) => setFilter("category", val)}
              allLabel="All Posts"
            />
          </ContentFilterBar>
        )}
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <ContentGrid columns="3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-700 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg animate-pulse"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </ContentGrid>
      ) : posts.length === 0 ? (
        <ContentEmptyState
          title={hasActiveFilters ? "No posts found" : "No blog posts yet"}
          subtitle={
            hasActiveFilters
              ? "Try adjusting your filters or search term"
              : "Check back soon!"
          }
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      ) : (
        <>
          <ContentGrid columns="3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-gray-700 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {post.coverImage ? (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-linear-to-br from-blue-500 to-red-600 flex items-center justify-center">
                    <span className="text-6xl text-white/30 font-bold">
                      {post.title.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  {post.category && (
                    <span className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                      {post.category.name}
                    </span>
                  )}
                  <h3 className="font-bold text-xl text-gray-400 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-300 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-300 dark:text-gray-400"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      {post.author.image ? (
                        <Image
                          src={post.author.image}
                          alt={post.author.name || "Author"}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <span className="text-sm text-gray-300 dark:text-gray-400">
                        {post.author.name || "Anonymous"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readingTime}m
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </ContentGrid>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={pageSize}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
