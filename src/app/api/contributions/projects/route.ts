/**
 * API Route: GET /api/contributions/projects
 *
 * List all available contribution projects with optional filtering
 *
 * Query parameters:
 * - category: Filter by category (frontend, backend, fullstack)
 * - difficulty: Filter by difficulty (1-5)
 * - premium: Filter by premium status (true/false)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseProjectFeatures } from "@/lib/types/contribution";

interface ProjectSubmission {
  projectId: string;
  featureId: string;
  prStatus: string | null;
}

interface ProjectData {
  id: string;
  createdAt: Date;
  slug: string;
  title: string;
  description: string;
  difficulty: number;
  isPremium: boolean;
  requiredPlan: string;
  category: string;
  estimatedHours: number;
  githubRepoUrl: string;
  features: string;
  xpReward: number;
  _count: { submissions: number };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const premiumFilter = searchParams.get("premium");

    // Build where clause
    const where: {
      published: boolean;
      category?: string;
      difficulty?: number;
      isPremium?: boolean;
      OR?: Array<{ isPremium: boolean } | { requiredPlan: string }>;
    } = {
      published: true,
    };

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = parseInt(difficulty, 10);
    }

    // Handle premium filtering
    if (premiumFilter === "true") {
      where.isPremium = true;
    } else if (premiumFilter === "false") {
      where.isPremium = false;
    }

    // Check user's subscription for premium content access
    const userSubscription = session?.user?.subscription || "FREE";

    // If user doesn't have premium, exclude premium projects
    // unless they explicitly filtered for premium (to show locked state)
    if (userSubscription === "FREE" && premiumFilter !== "true") {
      where.OR = [
        { isPremium: false },
        { requiredPlan: "FREE" }
      ];
    }

    // Fetch projects
    const projects = await prisma.contributionProject.findMany({
      where,
      orderBy: [
        { difficulty: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        estimatedHours: true,
        xpReward: true,
        isPremium: true,
        requiredPlan: true,
        features: true,
        githubRepoUrl: true,
        createdAt: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    // Add user's submission status if logged in
    let projectsWithStatus = projects;

    if (session?.user?.id) {
      const userSubmissions = await prisma.contributionSubmission.findMany({
        where: {
          userId: session.user.id,
          projectId: {
            in: (projects as ProjectData[]).map((p: ProjectData) => p.id),
          },
        },
        select: {
          projectId: true,
          featureId: true,
          prStatus: true,
        },
      });

      // Create a map of project submissions
      const submissionMap = new Map(
        (userSubmissions as ProjectSubmission[]).map((sub: ProjectSubmission) => [
          `${sub.projectId}-${sub.featureId}`,
          sub.prStatus,
        ])
      );

      projectsWithStatus = (projects as ProjectData[]).map((project: ProjectData) => {
        const features = parseProjectFeatures(project.features);
        const featuresWithStatus = (features as unknown[]).map((feature: unknown) => {
          const f = feature as { id: string };
          return {
            ...(feature as Record<string, unknown>),
            userStatus: submissionMap.get(`${project.id}-${f.id}`) || null,
          };
        });

        return {
          ...project,
          features: featuresWithStatus,
          totalSubmissions: project._count.submissions || 0,
        };
      });
    }

    return NextResponse.json({
      success: true,
      projects: projectsWithStatus,
      total: projectsWithStatus.length,
    });
  } catch (error) {
    console.error("Error fetching contribution projects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contribution projects",
      },
      { status: 500 }
    );
  }
}
