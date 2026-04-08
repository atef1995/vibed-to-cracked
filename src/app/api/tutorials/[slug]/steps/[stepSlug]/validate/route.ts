import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StepService } from "@/lib/stepService";
import {
  validateStepCode,
  type ValidationConfig,
  type DomSnapshotEntry,
} from "@/lib/stepValidator";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; stepSlug: string }> }
) {
  try {
    const { slug, stepSlug } = await params;

    const body = await request.json();
    const { code, output, timeSpent, domSnapshot } = body;

    if (typeof code !== "string") {
      return NextResponse.json(
        { error: "Missing required field: code" },
        { status: 400 }
      );
    }

    // Find tutorial + step
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true },
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
    if (session?.user?.id) {
      const canAccess = await StepService.canAccessStep(
        session.user.id,
        tutorial.id,
        step.order
      );
      if (!canAccess) {
        return NextResponse.json(
          { error: "Complete previous steps first" },
          { status: 403 }
        );
      }
    }

    // Run validation
    const config = (step.validationConfig as ValidationConfig) ?? {};
    const snapshot = Array.isArray(domSnapshot)
      ? (domSnapshot as DomSnapshotEntry[])
      : undefined;
    const result = validateStepCode(
      step.validationType,
      config,
      code,
      typeof output === "string" ? output : "",
      snapshot
    );

    // Persist progress for authenticated users
    let achievements: { icon: string; title: string; description: string }[] =
      [];
    let xpAwarded = 0;

    if (session?.user?.id) {
      if (result.passed) {
        const parsedTime =
          typeof timeSpent === "number" && timeSpent > 0
            ? Math.round(timeSpent)
            : undefined;
        const completion = await StepService.completeStep(
          session.user.id,
          step.id,
          code,
          parsedTime
        );
        achievements = completion.achievements.map((ua) => ({
          icon: ua.achievement.icon,
          title: ua.achievement.title,
          description: ua.achievement.description,
        }));
        xpAwarded = completion.xpResult.xpAwarded;
      } else {
        await StepService.recordFailedAttempt(session.user.id, step.id, code);
      }
    }

    return NextResponse.json({
      passed: result.passed,
      feedback: result.feedback,
      outputMatch: result.outputMatch,
      patternResults: result.patternResults,
      domCheckResults: result.domCheckResults ?? [],
      canAdvance: result.passed,
      nextStep: result.passed ? step.nextStep : null,
      achievements: result.passed ? achievements : [],
      xpAwarded: result.passed ? xpAwarded : 0,
    });
  } catch (error) {
    console.error("Error validating step code:", error);
    return NextResponse.json(
      { error: "Failed to validate code" },
      { status: 500 }
    );
  }
}
