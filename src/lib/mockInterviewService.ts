import { prisma } from "@/lib/prisma";
import {
  InterviewStatus,
  InterviewType,
  INTERVIEW_CONFIG,
} from "@/lib/interviewConstants";
import { InterviewCreditService } from "@/lib/interviewCreditService";

export class MockInterviewService {
  static async getCompanies() {
    return prisma.interviewCompany.findMany({
      where: { published: true },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { questions: { where: { published: true } } } },
      },
    });
  }

  static async getCompanyBySlug(slug: string) {
    return prisma.interviewCompany.findUnique({
      where: { slug },
      include: {
        _count: { select: { questions: { where: { published: true } } } },
      },
    });
  }

  static async getUserInterviews(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ) {
    const [interviews, total] = await Promise.all([
      prisma.mockInterview.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          company: { select: { name: true, slug: true, color: true } },
        },
      }),
      prisma.mockInterview.count({ where: { userId } }),
    ]);

    return {
      interviews,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static async startInterview(userId: string, companyId: string, type: string) {
    const questions = await this.selectQuestions(companyId, type);

    const interview = await prisma.mockInterview.create({
      data: {
        userId,
        companyId,
        interviewType: type,
        questionsAsked: questions.length,
        isPreview: false,
        rounds: {
          create: questions.map((q, i) => ({
            questionId: q.id,
            questionText: q.question,
            order: i,
          })),
        },
      },
      include: {
        company: true,
        rounds: {
          orderBy: { order: "asc" },
          include: { question: true },
        },
      },
    });

    // Deduct credit after successful creation
    await InterviewCreditService.deductCredit(userId, interview.id);

    return { interview, questions };
  }

  static async startPreview(userId: string, companyId: string) {
    // Check if user already has a preview for this company
    const existing = await prisma.mockInterview.findFirst({
      where: { userId, companyId, isPreview: true },
    });

    if (existing) {
      throw new Error(
        "You have already used your free preview for this company"
      );
    }

    const questions = await this.selectQuestions(
      companyId,
      InterviewType.MIXED,
      INTERVIEW_CONFIG.PREVIEW_QUESTIONS
    );

    const interview = await prisma.mockInterview.create({
      data: {
        userId,
        companyId,
        interviewType: InterviewType.MIXED,
        questionsAsked: questions.length,
        isPreview: true,
        rounds: {
          create: questions.map((q, i) => ({
            questionId: q.id,
            questionText: q.question,
            order: i,
          })),
        },
      },
      include: {
        company: true,
        rounds: {
          orderBy: { order: "asc" },
          include: { question: true },
        },
      },
    });

    return { interview, questions };
  }

  static async getInterview(id: string, userId?: string) {
    const where: { id: string; userId?: string } = { id };
    if (userId) where.userId = userId;

    return prisma.mockInterview.findFirst({
      where,
      include: {
        company: true,
        rounds: {
          orderBy: { order: "asc" },
          include: {
            question: {
              select: {
                type: true,
                difficulty: true,
                category: true,
                evaluationCriteria: true,
                starterCode: true,
              },
            },
          },
        },
      },
    });
  }

  static async saveRound(
    interviewId: string,
    data: {
      questionId?: string;
      questionText: string;
      responseText?: string;
      responseCode?: string;
      responseType?: string;
      score?: number;
      feedback?: Record<string, unknown>;
      order: number;
      duration?: number;
    }
  ) {
    return prisma.mockInterviewRound.create({
      data: {
        interviewId,
        questionId: data.questionId || null,
        questionText: data.questionText,
        responseText: data.responseText || null,
        responseCode: data.responseCode || null,
        responseType: data.responseType || "TEXT",
        score: data.score || null,
        feedback: data.feedback || null,
        order: data.order,
        duration: data.duration || null,
      },
    });
  }

  static async updateRound(
    roundId: string,
    data: {
      responseText?: string;
      responseCode?: string;
      responseType?: string;
      score?: number;
      feedback?: Record<string, unknown>;
      duration?: number;
    }
  ) {
    return prisma.mockInterviewRound.update({
      where: { id: roundId },
      data,
    });
  }

  static async completeInterview(
    interviewId: string,
    overallScore: number,
    feedback: Record<string, unknown>
  ) {
    return prisma.mockInterview.update({
      where: { id: interviewId },
      data: {
        status: InterviewStatus.COMPLETED,
        overallScore,
        feedback,
      },
    });
  }

  static async abandonInterview(interviewId: string) {
    return prisma.mockInterview.update({
      where: { id: interviewId },
      data: { status: InterviewStatus.ABANDONED },
    });
  }

  static async getUserAverageScore(
    userId: string,
    companySlug?: string
  ): Promise<number | null> {
    const where: Record<string, unknown> = {
      userId,
      status: InterviewStatus.COMPLETED,
      overallScore: { not: null },
      isPreview: false,
    };
    if (companySlug) {
      where.company = { slug: companySlug };
    }

    const result = await prisma.mockInterview.aggregate({
      where,
      _avg: { overallScore: true },
    });

    return result._avg.overallScore;
  }

  private static async selectQuestions(
    companyId: string,
    type: string,
    count: number = INTERVIEW_CONFIG.QUESTIONS_PER_SESSION
  ) {
    const typeFilter =
      type === InterviewType.MIXED
        ? {}
        : type === InterviewType.BEHAVIORAL
          ? { type: { in: ["BEHAVIORAL"] } }
          : { type: { in: ["TECHNICAL", "SYSTEM_DESIGN"] } };

    const questions = await prisma.interviewQuestion.findMany({
      where: {
        companyId,
        published: true,
        ...typeFilter,
      },
      orderBy: { order: "asc" },
    });

    // Shuffle and pick `count` questions
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
