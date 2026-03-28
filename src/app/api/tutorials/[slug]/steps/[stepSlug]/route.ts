import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StepService } from "@/lib/stepService";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; stepSlug: string }> }
) {
  try {
    const { slug, stepSlug } = await params;

    // Find the tutorial first
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, title: true, exerciseSlug: true },
    });

    if (!tutorial) {
      return NextResponse.json(
        { error: "Tutorial not found" },
        { status: 404 }
      );
    }

    const step = await StepService.getStepBySlug(tutorial.id, stepSlug);
    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    // Check step locking for authenticated users
    const session = await getServerSession(authOptions);
    let progress = null;
    let canAccess = true;

    if (session?.user?.id) {
      canAccess = await StepService.canAccessStep(
        session.user.id,
        tutorial.id,
        step.order
      );

      if (!canAccess) {
        return NextResponse.json(
          { error: "Complete previous steps first", locked: true },
          { status: 403 }
        );
      }

      progress = await StepService.getStepProgress(session.user.id, step.id);
    }

    return NextResponse.json({
      step,
      tutorialTitle: tutorial.title,
      exerciseSlug: tutorial.exerciseSlug,
      progress: progress
        ? {
            status: progress.status,
            passed: progress.passed,
            attempts: progress.attempts,
            userCode: progress.userCode,
            completedAt: progress.completedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching step:", error);
    return NextResponse.json(
      { error: "Failed to fetch step" },
      { status: 500 }
    );
  }
}
