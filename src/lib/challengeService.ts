import { prisma } from "./prisma";
import {
  Challenge,
  ChallengeTest,
  ChallengeMoodAdaptation,
} from "@prisma/client";
import type {
  ChallengeWithTests as FrontendChallengeWithTests,
} from "@/types/challenge";

// Prisma types for internal use
export type PrismaChallengeWithTests = Challenge & {
  tests: ChallengeTest[];
  moodAdaptations: ChallengeMoodAdaptation[];
};

// Re-export frontend types for API consumers
export type ChallengeWithTests = FrontendChallengeWithTests;

// Transformation function: Prisma to Frontend
function transformToFrontendChallenge(
  challenge: PrismaChallengeWithTests
): ChallengeWithTests {
  return {
    id: challenge.id,
    slug: challenge.slug,
    title: challenge.title,
    description: challenge.description,
    type: challenge.type,
    difficulty: challenge.difficulty,
    isPremium: challenge.isPremium,
    requiredPlan: challenge.requiredPlan,
    estimatedTime: challenge.estimatedTime,
    starter: challenge.starter,
    solution: challenge.solution,
    order: challenge.order,
    published: challenge.published,
    createdAt: challenge.createdAt,
    updatedAt: challenge.updatedAt,
    tests: challenge.tests.map((test: ChallengeTest) => ({
      id: test.id,
      input: JSON.stringify(test.input),
      expected: JSON.stringify(test.expected),
      description: test.description,
    })),
    moodAdaptations: challenge.moodAdaptations.map((adaptation) => ({
      mood: adaptation.mood,
      content: adaptation.content,
    })),
  };
}

export async function getAllChallenges(): Promise<ChallengeWithTests[]> {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        published: true,
      },
      include: {
        tests: {
          orderBy: {
            order: "asc",
          },
        },
        moodAdaptations: true,
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return challenges.map(transformToFrontendChallenge);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    throw new Error("Failed to fetch challenges");
  }
}

export async function getChallengeById(
  id: string
): Promise<ChallengeWithTests | null> {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: {
        id,
        published: true,
      },
      include: {
        tests: {
          orderBy: {
            order: "asc",
          },
        },
        moodAdaptations: true,
      },
    });

    return challenge ? transformToFrontendChallenge(challenge) : null;
  } catch (error) {
    console.error("Error fetching challenge by ID:", error);
    return null;
  }
}

export async function getChallengeBySlug(
  slug: string
): Promise<ChallengeWithTests | null> {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: {
        slug,
        published: true,
      },
      include: {
        tests: {
          orderBy: {
            order: "asc",
          },
        },
        moodAdaptations: true,
      },
    });

    return challenge ? transformToFrontendChallenge(challenge) : null;
  } catch (error) {
    console.error("Error fetching challenge by slug:", error);
    return null;
  }
}

export async function getFilteredChallenges(filters: {
  type?: string;
  difficulty?: string;
}): Promise<ChallengeWithTests[]> {
  try {
    const where: {
      published: boolean;
      type?: string;
      difficulty?: string;
    } = {
      published: true,
    };

    if (filters.type && filters.type !== "all") {
      where.type = filters.type.toUpperCase();
    }

    if (filters.difficulty && filters.difficulty !== "all") {
      where.difficulty = filters.difficulty.toUpperCase();
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        tests: {
          orderBy: {
            order: "asc",
          },
        },
        moodAdaptations: true,
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return challenges.map(transformToFrontendChallenge);
  } catch (error) {
    console.error("Error fetching filtered challenges:", error);
    throw new Error("Failed to fetch filtered challenges");
  }
}

export async function getChallengeTypes(): Promise<string[]> {
  try {
    const types = await prisma.challenge.findMany({
      where: {
        published: true,
      },
      select: { type: true },
      distinct: ["type"],
    });

    return types.map((t) => t.type);
  } catch (error) {
    console.error("Error fetching challenge types:", error);
    throw new Error("Failed to fetch challenge types");
  }
}

export async function getChallengeDifficulties(): Promise<string[]> {
  try {
    const difficulties = await prisma.challenge.findMany({
      where: {
        published: true,
      },
      select: { difficulty: true },
      distinct: ["difficulty"],
    });

    return difficulties.map((d) => d.difficulty);
  } catch (error) {
    console.error("Error fetching challenge difficulties:", error);
    throw new Error("Failed to fetch challenge difficulties");
  }
}

// Function to record a challenge attempt
export async function recordChallengeAttempt(
  userId: string,
  challengeId: string,
  code: string,
  passed: boolean,
  mood: "CHILL" | "RUSH" | "GRIND",
  timeSpent?: number
) {
  try {
    return await prisma.challengeAttempt.create({
      data: {
        userId,
        challengeId,
        code,
        passed,
        mood,
        timeSpent,
      },
    });
  } catch (error) {
    console.error("Error recording challenge attempt:", error);
    throw error;
  }
}

// Function to get user's challenge attempts
export async function getUserChallengeAttempts(userId: string) {
  try {
    return await prisma.challengeAttempt.findMany({
      where: { userId },
      include: {
        challenge: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching user challenge attempts:", error);
    return [];
  }
}
