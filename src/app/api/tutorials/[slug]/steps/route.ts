import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StepService } from "@/lib/stepService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const tutorial = await StepService.getTutorialBySlugWithSteps(slug);
    if (!tutorial) {
      return NextResponse.json(
        { error: "Tutorial not found" },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);
    let stepProgress: Awaited<
      ReturnType<typeof StepService.getAllStepProgress>
    > = [];

    if (session?.user?.id) {
      stepProgress = await StepService.getAllStepProgress(
        session.user.id,
        tutorial.id
      );
    }

    const steps = tutorial.steps.map((step) => {
      const progress = stepProgress.find((p) => p.stepId === step.id);
      return {
        ...step,
        status: progress?.status ?? "NOT_STARTED",
        passed: progress?.passed ?? false,
        attempts: progress?.attempts ?? 0,
        completedAt: progress?.completedAt ?? null,
      };
    });

    return NextResponse.json({
      tutorialId: tutorial.id,
      tutorialTitle: tutorial.title,
      exerciseSlug: tutorial.exerciseSlug,
      category: tutorial.category,
      steps,
    });
  } catch (error) {
    console.error("Error fetching tutorial steps:", error);
    return NextResponse.json(
      { error: "Failed to fetch steps" },
      { status: 500 }
    );
  }
}
