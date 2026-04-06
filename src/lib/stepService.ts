import { prisma } from "@/lib/prisma";
import { AchievementService } from "@/lib/achievementService";
import { awardXP, XPAwardResult } from "@/lib/services/xpService";
import { UserAchievement, Achievement } from "@/generated/client";
import { ProgressService } from "@/lib/progressService";

export interface StepWithNav {
  id: string;
  slug: string;
  tutorialId: string;
  order: number;
  title: string;
  description: string | null;
  mdxFile: string | null;
  validationType: string;
  validationConfig: unknown;
  prevStep: { slug: string; title: string } | null;
  nextStep: { slug: string; title: string } | null;
}

export class StepService {
  static async getStepsByTutorialId(tutorialId: string) {
    return prisma.tutorialStep.findMany({
      where: { tutorialId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        order: true,
        title: true,
        description: true,
        mdxFile: true,
        validationType: true,
      },
    });
  }

  static async getStepBySlug(
    tutorialId: string,
    stepSlug: string
  ): Promise<StepWithNav | null> {
    const steps = await prisma.tutorialStep.findMany({
      where: { tutorialId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        tutorialId: true,
        order: true,
        title: true,
        description: true,
        mdxFile: true,
        validationType: true,
        validationConfig: true,
      },
    });

    const index = steps.findIndex((s) => s.slug === stepSlug);
    if (index === -1) return null;

    const step = steps[index];
    return {
      ...step,
      prevStep:
        index > 0
          ? { slug: steps[index - 1].slug, title: steps[index - 1].title }
          : null,
      nextStep:
        index < steps.length - 1
          ? { slug: steps[index + 1].slug, title: steps[index + 1].title }
          : null,
    };
  }

  static async getStepProgress(userId: string, stepId: string) {
    return prisma.tutorialStepProgress.findUnique({
      where: { userId_stepId: { userId, stepId } },
    });
  }

  static async getAllStepProgress(userId: string, tutorialId: string) {
    const steps = await prisma.tutorialStep.findMany({
      where: { tutorialId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        order: true,
        title: true,
        progress: {
          where: { userId },
          select: {
            status: true,
            passed: true,
            attempts: true,
            completedAt: true,
          },
        },
      },
    });

    return steps.map((step) => ({
      stepId: step.id,
      slug: step.slug,
      order: step.order,
      title: step.title,
      status: step.progress[0]?.status ?? "NOT_STARTED",
      passed: step.progress[0]?.passed ?? false,
      attempts: step.progress[0]?.attempts ?? 0,
      completedAt: step.progress[0]?.completedAt ?? null,
    }));
  }

  static async canAccessStep(
    userId: string,
    tutorialId: string,
    stepOrder: number
  ): Promise<boolean> {
    if (stepOrder <= 1) return true;

    const previousSteps = await prisma.tutorialStep.findMany({
      where: { tutorialId, order: { lt: stepOrder } },
      select: {
        id: true,
        progress: {
          where: { userId },
          select: { passed: true },
        },
      },
    });

    return previousSteps.every((step) => step.progress[0]?.passed === true);
  }

  static async completeStep(
    userId: string,
    stepId: string,
    userCode: string,
    timeSpent?: number
  ): Promise<{
    progress: Awaited<ReturnType<typeof prisma.tutorialStepProgress.upsert>>;
    achievements: (UserAchievement & { achievement: Achievement })[];
    xpResult: XPAwardResult;
  }> {
    const progress = await prisma.tutorialStepProgress.upsert({
      where: { userId_stepId: { userId, stepId } },
      update: {
        status: "COMPLETED",
        passed: true,
        userCode,
        attempts: { increment: 1 },
        timeSpent: timeSpent ?? undefined,
        completedAt: new Date(),
      },
      create: {
        userId,
        stepId,
        status: "COMPLETED",
        passed: true,
        userCode,
        attempts: 1,
        timeSpent: timeSpent ?? undefined,
        completedAt: new Date(),
      },
    });

    // Get the step to find the tutorialId
    const step = await prisma.tutorialStep.findUnique({
      where: { id: stepId },
      select: { tutorialId: true },
    });

    const achievements = await AchievementService.checkAndUnlockAchievements({
      userId,
      action: "STEP_COMPLETED",
      metadata: {
        stepId,
        tutorialId: step?.tutorialId,
        timeSpent,
        attempts: progress.attempts,
      },
    });

    const xpResult = await awardXP(userId, 10, "STEP_COMPLETED", {
      stepId,
      tutorialId: step?.tutorialId,
    });

    // Check if all steps for this tutorial are now complete
    if (step?.tutorialId) {
      await StepService.checkTutorialCompletion(userId, step.tutorialId);
    }

    return { progress, achievements, xpResult };
  }

  /**
   * After all steps pass, mark the tutorial complete (or IN_PROGRESS if a quiz remains).
   */
  static async checkTutorialCompletion(
    userId: string,
    tutorialId: string
  ): Promise<void> {
    const allSteps = await prisma.tutorialStep.findMany({
      where: { tutorialId },
      select: {
        id: true,
        progress: {
          where: { userId },
          select: { passed: true },
        },
      },
    });

    const allPassed =
      allSteps.length > 0 &&
      allSteps.every((s) => s.progress[0]?.passed === true);
    if (!allPassed) return;

    // Check whether this tutorial has a quiz
    const quiz = await prisma.quiz.findFirst({
      where: { tutorialId },
      select: { id: true },
    });

    if (quiz) {
      // Steps done but quiz still required — ensure progress exists as IN_PROGRESS
      // (don't overwrite COMPLETED if quiz was already passed)
      const existing = await prisma.tutorialProgress.findUnique({
        where: { userId_tutorialId: { userId, tutorialId } },
        select: { status: true },
      });
      if (!existing || existing.status === "NOT_STARTED") {
        await prisma.tutorialProgress.upsert({
          where: { userId_tutorialId: { userId, tutorialId } },
          update: { status: "IN_PROGRESS", updatedAt: new Date() },
          create: { userId, tutorialId, status: "IN_PROGRESS" },
        });
      }
    } else {
      // No quiz — completing all steps finishes the tutorial
      await ProgressService.markTutorialCompleted(userId, tutorialId);
      // Fire tutorial-completion achievements
      await AchievementService.checkAndUnlockAchievements({
        userId,
        action: "TUTORIAL_COMPLETED",
        metadata: { tutorialId },
      });
    }
  }

  static async recordFailedAttempt(
    userId: string,
    stepId: string,
    userCode: string
  ) {
    return prisma.tutorialStepProgress.upsert({
      where: { userId_stepId: { userId, stepId } },
      update: {
        status: "IN_PROGRESS",
        userCode,
        attempts: { increment: 1 },
      },
      create: {
        userId,
        stepId,
        status: "IN_PROGRESS",
        passed: false,
        userCode,
        attempts: 1,
      },
    });
  }

  static async getStepContentByMdxFile(
    mdxFile: string
  ): Promise<string | null> {
    const step = await prisma.tutorialStep.findFirst({
      where: { mdxFile },
      select: { content: true },
    });
    return step?.content ?? null;
  }

  static async getTutorialBySlugWithSteps(slug: string) {
    return prisma.tutorial.findUnique({
      where: { slug },
      include: {
        steps: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            slug: true,
            order: true,
            title: true,
            description: true,
            validationType: true,
          },
        },
        category: { select: { slug: true, title: true } },
      },
    });
  }
}
