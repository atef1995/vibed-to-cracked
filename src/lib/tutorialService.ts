import { prisma } from "@/lib/prisma";
import { Category, Prisma } from "../generated/client";
import type { TutorialWithAll } from "@/types/tutorial";

// Legacy interface for backward compatibility only
export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

/**
 * Service for handling tutorial operations using pure Prisma types
 */
export class TutorialService {
  /**
   * Get all published tutorials with their categories and quizzes
   */
  static async getAllTutorials(
    limit?: number,
    offset?: number
  ): Promise<TutorialWithAll[]> {
    try {
      const tutorials = await prisma.tutorial.findMany({
        where: {
          published: true,
        },
        include: {
          quizzes: true,
          category: true,
        },
        orderBy: {
          order: "asc",
        },
        take: limit,
        skip: offset,
      });

      return tutorials.filter((t) => t.category !== null) as TutorialWithAll[];
    } catch (error) {
      console.error("Error in getAllTutorials:", error);
      throw new Error("Failed to fetch tutorials from database");
    }
  }

  /**
   * Get a specific tutorial by ID with its quiz and category
   */
  static async getTutorialById(id: string): Promise<TutorialWithAll | null> {
    try {
      const tutorial = await prisma.tutorial.findUnique({
        where: {
          id,
          published: true,
        },
        include: {
          quizzes: true,
          category: true,
        },
      });

      if (!tutorial || !tutorial.category) return null;
      return tutorial as TutorialWithAll;
    } catch (error) {
      console.error("Error in getTutorialById:", error);
      return null;
    }
  }

  /**
   * Get a tutorial by slug with its quiz and category
   */
  static async getTutorialBySlug(
    slug: string
  ): Promise<TutorialWithAll | null> {
    try {
      const tutorial = await prisma.tutorial.findUnique({
        where: {
          slug,
          published: true,
        },
        include: {
          quizzes: true,
          category: true,
          steps: {
            select: {
              id: true,
              slug: true,
              order: true,
              title: true,
              description: true,
              validationType: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!tutorial || !tutorial.category) return null;
      return tutorial as TutorialWithAll;
    } catch (error) {
      console.error("Error in getTutorialBySlug:", error);
      return null;
    }
  }

  /**
   * Get a tutorial by its MDX file path (used for security checks and content retrieval)
   */
  static async getTutorialByMdxFile(mdxFile: string): Promise<{
    isPremium: boolean;
    requiredPlan: string | null;
    content: string | null;
  } | null> {
    try {
      const tutorial = await prisma.tutorial.findFirst({
        where: {
          mdxFile: mdxFile,
        },
        select: {
          isPremium: true,
          requiredPlan: true,
          content: true,
        },
      });

      return tutorial;
    } catch (error) {
      console.error("Error in getTutorialByMdxFile:", error);
      return null;
    }
  }

  /**
   * Get tutorials with user progress
   */
  static async getTutorialsWithProgress(userId: string) {
    const tutorials = await this.getAllTutorials();

    const progressData = await prisma.tutorialProgress.findMany({
      where: {
        userId,
        tutorialId: {
          in: tutorials.map((t) => t.id),
        },
      },
    });

    const progressMap = new Map(progressData.map((p) => [p.tutorialId, p]));

    return tutorials.map((tutorial) => ({
      ...tutorial,
      progress: progressMap.get(tutorial.id) || null,
    }));
  }

  /**
   * Get tutorials by category
   */
  static async getTutorialsByCategory(
    categorySlug: string,
    limit?: number,
    offset?: number
  ): Promise<TutorialWithAll[]> {
    try {
      const tutorials = await prisma.tutorial.findMany({
        where: {
          published: true,
          category: {
            slug: categorySlug,
          },
        },
        include: {
          quizzes: true,
          category: true,
        },
        orderBy: {
          order: "asc",
        },
        take: limit,
        skip: offset,
      });

      return tutorials.filter((t) => t.category !== null) as TutorialWithAll[];
    } catch (error) {
      console.error("Error in getTutorialsByCategory:", error);
      throw new Error("Failed to fetch tutorials by category");
    }
  }

  /**
   * Get all available tutorial categories (duration is stored in DB)
   */
  static async getCategories(): Promise<Category[]> {
    try {
      return await prisma.category.findMany({
        where: {
          published: true,
        },
        orderBy: {
          order: "asc",
        },
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  /**
   * Get categories with tutorial counts and user progress stats
   */
  static async getCategoriesWithStats(userId?: string): Promise<
    (Category & {
      _count: { tutorials: number };
      tutorialStats?: { total: number; completed: number };
    })[]
  > {
    try {
      // Get categories with tutorial counts
      const categoriesWithCounts = await prisma.category.findMany({
        where: {
          published: true,
        },
        include: {
          _count: {
            select: {
              tutorials: {
                where: {
                  published: true,
                },
              },
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      });

      // If no user provided, just return categories with tutorial counts
      if (!userId) {
        return categoriesWithCounts.map((category) => ({
          ...category,
          tutorialStats: {
            total: category._count.tutorials,
            completed: 0,
          },
        }));
      }

      // Get user's completed tutorials grouped by category
      const userProgressByCategoryRaw = await prisma.tutorialProgress.groupBy({
        by: ["tutorialId"],
        where: {
          userId,
          status: "COMPLETED",
          quizPassed: true,
        },
        _count: {
          tutorialId: true,
        },
      });

      // Get tutorial category mappings for completed tutorials
      const completedTutorialIds = userProgressByCategoryRaw.map(
        (p) => p.tutorialId
      );
      const tutorialCategoryMappings = await prisma.tutorial.findMany({
        where: {
          id: {
            in: completedTutorialIds,
          },
        },
        select: {
          id: true,
          categoryId: true,
        },
      });

      // Group completed tutorials by category
      const completedByCategory = tutorialCategoryMappings.reduce(
        (acc, tutorial) => {
          if (!acc[tutorial.categoryId]) {
            acc[tutorial.categoryId] = 0;
          }
          acc[tutorial.categoryId]++;
          return acc;
        },
        {} as Record<string, number>
      );

      // Combine with category data
      return categoriesWithCounts.map((category) => ({
        ...category,
        tutorialStats: {
          total: category._count.tutorials,
          completed: completedByCategory[category.id] || 0,
        },
      }));
    } catch (error) {
      console.error("Error in getCategoriesWithStats:", error);
      throw new Error("Failed to fetch categories with stats");
    }
  }

  /**
   * Get a specific category by slug (duration is stored in DB)
   */
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      return await prisma.category.findUnique({
        where: {
          slug,
          published: true,
        },
      });
    } catch (error) {
      console.error("Error fetching category by slug:", error);
      return null;
    }
  }

  /**
   * Get tutorials grouped by category
   */
  static async getTutorialsGroupedByCategory(): Promise<
    Record<string, TutorialWithAll[]>
  > {
    const tutorials = await this.getAllTutorials();

    return tutorials.reduce(
      (groups, tutorial) => {
        const categorySlug = tutorial.category.slug;
        if (!groups[categorySlug]) {
          groups[categorySlug] = [];
        }
        groups[categorySlug].push(tutorial);
        return groups;
      },
      {} as Record<string, TutorialWithAll[]>
    );
  }

  /**
   * Search tutorials by title or description
   */
  static async searchTutorials(
    query: string,
    limit?: number,
    offset?: number
  ): Promise<TutorialWithAll[]> {
    try {
      const tutorials = await prisma.tutorial.findMany({
        where: {
          published: true,
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          quizzes: true,
          category: true,
        },
        orderBy: {
          order: "asc",
        },
        take: limit,
        skip: offset,
      });

      return tutorials.filter((t) => t.category !== null) as TutorialWithAll[];
    } catch (error) {
      console.error("Error in searchTutorials:", error);
      throw new Error("Failed to search tutorials");
    }
  }

  /**
   * Get total count of tutorials based on filters
   */
  static async getTutorialsCount(filters?: {
    category?: string;
    search?: string;
  }): Promise<number> {
    try {
      const where: Prisma.TutorialWhereInput = {
        published: true,
      };

      if (filters?.category) {
        where.category = {
          slug: filters.category,
        };
      }

      if (filters?.search) {
        where.OR = [
          {
            title: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        ];
      }

      return await prisma.tutorial.count({ where });
    } catch (error) {
      console.error("Error in getTutorialsCount:", error);
      throw new Error("Failed to count tutorials");
    }
  }

  private static readonly GOAL_TO_CATEGORY: Record<string, string[]> = {
    "web-fundamentals": ["html", "fundamentals"],
    frontend: ["react", "css"],
    backend: ["nodejs"],
    dsa: ["data-structures-algorithms"],
    "career-switch": ["html", "fundamentals"],
    "side-projects": ["dom", "react"],
  };

  private static readonly EXPERIENCE_MAX_DIFFICULTY: Record<string, number> = {
    "complete-beginner": 1,
    "some-basics": 2,
    intermediate: 3,
    advanced: 4,
  };

  /**
   * Get a recommended tutorial for a user based on their experience level and learning goals.
   * Queries the DB directly — no hardcoded slugs.
   */
  static async getRecommendedForUser(
    experienceLevel: string,
    learningGoals: string[]
  ): Promise<TutorialWithAll | null> {
    try {
      const maxDifficulty =
        this.EXPERIENCE_MAX_DIFFICULTY[experienceLevel] ?? 2;

      // Collect category slugs from goals in priority order
      const categorySlugs: string[] = [];
      for (const goal of learningGoals) {
        const slugs = this.GOAL_TO_CATEGORY[goal];
        if (slugs) {
          for (const s of slugs) {
            if (!categorySlugs.includes(s)) categorySlugs.push(s);
          }
        }
      }

      // Try each preferred category — return the easiest FREE tutorial that fits
      for (const catSlug of categorySlugs) {
        const tutorial = await prisma.tutorial.findFirst({
          where: {
            published: true,
            requiredPlan: "FREE",
            difficulty: { lte: maxDifficulty },
            category: { slug: catSlug },
          },
          include: { category: true, quizzes: true },
          orderBy: [{ difficulty: "asc" }, { order: "asc" }],
        });
        if (tutorial?.category) return tutorial as TutorialWithAll;
      }

      // Fallback: easiest FREE tutorial across the whole platform
      const fallback = await prisma.tutorial.findFirst({
        where: {
          published: true,
          requiredPlan: "FREE",
          difficulty: { lte: maxDifficulty },
        },
        include: { category: true, quizzes: true },
        orderBy: [{ difficulty: "asc" }, { order: "asc" }],
      });
      if (fallback?.category) return fallback as TutorialWithAll;

      return null;
    } catch (error) {
      console.error("Error in getRecommendedForUser:", error);
      return null;
    }
  }

  /**
   * Get recommended tutorials based on current tutorial
   * Uses topics, category, prerequisites, and difficulty for smart matching
   */
  static async getRecommendedTutorials(
    currentTutorialSlug: string,
    limit: number = 3
  ): Promise<TutorialWithAll[]> {
    try {
      const currentTutorial = await this.getTutorialBySlug(currentTutorialSlug);
      if (!currentTutorial) return [];

      const allTutorials = await this.getAllTutorials();

      const scoredTutorials = allTutorials
        .filter((tutorial) => tutorial.slug !== currentTutorialSlug)
        .map((tutorial) => {
          let score = 0;

          const currentTopics =
            (currentTutorial.category.topics as string[]) || [];
          const tutorialTopics = (tutorial.category.topics as string[]) || [];

          const sharedTopics = currentTopics.filter((topic) =>
            tutorialTopics.includes(topic)
          );

          if (sharedTopics.length >= 2) score += 3;
          else if (sharedTopics.length === 1) score += 2;

          if (tutorial.categoryId === currentTutorial.categoryId) score += 1;

          const diffDifference = Math.abs(
            tutorial.difficulty - currentTutorial.difficulty
          );
          if (diffDifference === 1) score += 1;
          else if (diffDifference === 0) score += 0.5;

          return { tutorial, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.tutorial);

      return scoredTutorials;
    } catch (error) {
      console.error("Error in getRecommendedTutorials:", error);
      return [];
    }
  }

  /**
   * Get recommended tutorials for a challenge based on its linked category
   * Simple and efficient - just fetches tutorials from the challenge's category
   */
  static async getRecommendedTutorialsFromChallenge(
    categoryId: string | null,
    limit: number = 3
  ): Promise<TutorialWithAll[]> {
    try {
      if (!categoryId) return [];

      const tutorials = await prisma.tutorial.findMany({
        where: {
          categoryId,
          published: true,
        },
        include: {
          quizzes: true,
          category: true,
        },
        orderBy: { difficulty: "asc" },
        take: limit,
      });

      return tutorials.filter((t) => t.category !== null) as TutorialWithAll[];
    } catch (error) {
      console.error("Error in getRecommendedTutorialsFromChallenge:", error);
      return [];
    }
  }

  /**
   * Get prerequisite tutorials for an exercise with user progress status.
   * Falls back to category-based recommendations when no explicit prerequisites are set.
   */
  static async getPrerequisiteTutorialsWithProgress(
    exerciseSlug: string,
    userId?: string
  ) {
    try {
      const exercise = await prisma.exercise.findUnique({
        where: { slug: exerciseSlug },
        select: {
          prerequisiteTutorialIds: true,
          tutorialCategoryId: true,
        },
      });

      if (!exercise) return [];

      let tutorials: TutorialWithAll[];

      if (
        exercise.prerequisiteTutorialIds &&
        exercise.prerequisiteTutorialIds.length > 0
      ) {
        // Explicit prerequisites
        const found = await prisma.tutorial.findMany({
          where: {
            id: { in: exercise.prerequisiteTutorialIds },
            published: true,
          },
          include: {
            quizzes: true,
            category: true,
          },
          orderBy: { difficulty: "asc" },
        });
        tutorials = found.filter(
          (t) => t.category !== null
        ) as TutorialWithAll[];
      } else if (exercise.tutorialCategoryId) {
        // Fallback to category-based
        tutorials = await this.getRecommendedTutorialsFromChallenge(
          exercise.tutorialCategoryId,
          3
        );
      } else {
        return [];
      }

      if (!userId || tutorials.length === 0) {
        return tutorials.map((tutorial) => ({
          tutorial,
          tutorialCompleted: false,
          quizPassed: false,
          quizBestScore: null as number | null,
        }));
      }

      // Fetch progress for all prerequisite tutorials in one query
      const tutorialIds = tutorials.map((t) => t.id);

      const progressRecords = await prisma.tutorialProgress.findMany({
        where: {
          userId,
          tutorialId: { in: tutorialIds },
        },
        select: {
          tutorialId: true,
          status: true,
          quizPassed: true,
          bestScore: true,
        },
      });

      const progressMap = new Map(
        progressRecords.map((p) => [p.tutorialId, p])
      );

      return tutorials.map((tutorial) => {
        const progress = progressMap.get(tutorial.id);
        return {
          tutorial,
          tutorialCompleted: progress?.status === "COMPLETED",
          quizPassed: progress?.quizPassed ?? false,
          quizBestScore: progress?.bestScore ?? null,
        };
      });
    } catch (error) {
      console.error("Error in getPrerequisiteTutorialsWithProgress:", error);
      return [];
    }
  }
}
