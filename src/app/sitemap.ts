import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const BASE_URL = process.env.NEXTAUTH_URL || "https://vibed-to-cracked.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    tutorials,
    categories,
    quizzes,
    challenges,
    exercises,
    projects,
    blogPosts,
  ] = await Promise.all([
    prisma.tutorial.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
    }),
    prisma.category.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.quiz.findMany({
      select: { slug: true, updatedAt: true },
    }),
    prisma.challenge.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.exercise.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.project.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/tutorials`, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE_URL}/blog`, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE_URL}/quizzes`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE_URL}/practice`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE_URL}/exercises`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE_URL}/projects`, priority: 0.7, changeFrequency: "weekly" },
    {
      url: `${BASE_URL}/cheat-sheets`,
      priority: 0.8,
      changeFrequency: "weekly",
    },
    { url: `${BASE_URL}/pricing`, priority: 0.8, changeFrequency: "monthly" },
  ];

  return [
    ...staticPages,
    ...categories.map((c) => ({
      url: `${BASE_URL}/tutorials/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...tutorials.map((t) => ({
      url: `${BASE_URL}/tutorials/category/${t.category.slug}/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...quizzes.map((q) => ({
      url: `${BASE_URL}/quiz/${q.slug}`,
      lastModified: q.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...challenges.map((c) => ({
      url: `${BASE_URL}/practice/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...exercises.map((e) => ({
      url: `${BASE_URL}/exercises/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...projects.map((p) => ({
      url: `${BASE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...blogPosts.map((b) => ({
      url: `${BASE_URL}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
