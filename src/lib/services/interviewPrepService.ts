import { prisma } from "@/lib/prisma";

export class InterviewPrepService {
  static async getCompanyPrepGuide(companySlug: string) {
    const company = await prisma.interviewCompany.findUnique({
      where: { slug: companySlug, published: true },
      include: {
        prepGuide: true,
        _count: {
          select: {
            questions: { where: { published: true } },
          },
        },
      },
    });

    if (!company) throw new Error("Company not found");
    if (!company.prepGuide) throw new Error("Prep guide not found");

    const questionBreakdown = await prisma.interviewQuestion.groupBy({
      by: ["type", "difficulty"],
      where: { companyId: company.id, published: true },
      _count: true,
    });

    return {
      company: {
        id: company.id,
        slug: company.slug,
        name: company.name,
        logoUrl: company.logoUrl,
        description: company.description,
        interviewStyle: company.interviewStyle,
        color: company.color,
      },
      guide: company.prepGuide,
      totalQuestions: company._count.questions,
      questionBreakdown,
    };
  }

  static async getQuestionWalkthroughs(
    companySlug: string,
    type?: string,
    userPlan?: string
  ) {
    const company = await prisma.interviewCompany.findUnique({
      where: { slug: companySlug, published: true },
    });

    if (!company) throw new Error("Company not found");

    const where: Record<string, unknown> = {
      question: {
        companyId: company.id,
        published: true,
        ...(type ? { type } : {}),
      },
      published: true,
    };

    const walkthroughs = await prisma.questionWalkthrough.findMany({
      where,
      include: {
        question: {
          select: {
            id: true,
            type: true,
            difficulty: true,
            question: true,
            category: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const isPaid = userPlan === "VIBED" || userPlan === "CRACKED";

    return walkthroughs.map((w) => ({
      id: w.id,
      questionId: w.question.id,
      question: w.question.question,
      type: w.question.type,
      difficulty: w.question.difficulty,
      category: w.question.category,
      timeGuidance: w.timeGuidance,
      requiredPlan: w.requiredPlan,
      locked: w.requiredPlan !== "FREE" && !isPaid,
      order: w.order,
    }));
  }

  static async getWalkthrough(questionId: string, userPlan?: string) {
    const walkthrough = await prisma.questionWalkthrough.findUnique({
      where: { questionId, published: true },
      include: {
        question: {
          select: {
            id: true,
            type: true,
            difficulty: true,
            question: true,
            category: true,
            followUps: true,
            expectedApproach: true,
            company: {
              select: {
                slug: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!walkthrough) throw new Error("Walkthrough not found");

    const isPaid = userPlan === "VIBED" || userPlan === "CRACKED";
    if (walkthrough.requiredPlan !== "FREE" && !isPaid) {
      throw new Error("Upgrade required");
    }

    return walkthrough;
  }

  static async updateStudyProgress(
    userId: string,
    walkthroughId: string,
    confidence: string
  ) {
    const valid = ["CONFIDENT", "NEEDS_REVIEW", "UNKNOWN"];
    if (!valid.includes(confidence)) {
      throw new Error("Invalid confidence value");
    }

    return prisma.prepStudyProgress.upsert({
      where: {
        userId_walkthroughId: { userId, walkthroughId },
      },
      update: {
        confidence,
        studied: true,
        studyCount: { increment: 1 },
        lastStudiedAt: new Date(),
      },
      create: {
        userId,
        walkthroughId,
        confidence,
        studied: true,
        studyCount: 1,
        lastStudiedAt: new Date(),
      },
    });
  }

  static async getUserStudyStats(userId: string, companySlug?: string) {
    const where: Record<string, unknown> = { userId };

    if (companySlug) {
      const company = await prisma.interviewCompany.findUnique({
        where: { slug: companySlug },
      });
      if (company) {
        where.walkthrough = {
          question: { companyId: company.id },
        };
      }
    }

    const progress = await prisma.prepStudyProgress.findMany({
      where,
      include: {
        walkthrough: {
          include: {
            question: {
              select: { type: true, companyId: true },
            },
          },
        },
      },
    });

    const total = progress.length;
    const confident = progress.filter(
      (p) => p.confidence === "CONFIDENT"
    ).length;
    const needsReview = progress.filter(
      (p) => p.confidence === "NEEDS_REVIEW"
    ).length;

    const byType: Record<string, { studied: number; confident: number }> = {};
    for (const p of progress) {
      const type = p.walkthrough.question.type;
      if (!byType[type]) byType[type] = { studied: 0, confident: 0 };
      byType[type].studied++;
      if (p.confidence === "CONFIDENT") byType[type].confident++;
    }

    return { total, confident, needsReview, byType };
  }

  static async getAllCompaniesWithGuides() {
    const companies = await prisma.interviewCompany.findMany({
      where: { published: true, prepGuide: { isNot: null } },
      include: {
        prepGuide: { select: { id: true } },
        _count: {
          select: {
            questions: { where: { published: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return companies.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      logoUrl: c.logoUrl,
      description: c.description,
      interviewStyle: c.interviewStyle,
      color: c.color,
      questionCount: c._count.questions,
    }));
  }
}
