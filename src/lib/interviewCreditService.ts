import { prisma } from "@/lib/prisma";
import { CreditTransactionType } from "@/lib/interviewConstants";

export class InterviewCreditService {
  static async getUserCredits(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { interviewCredits: true },
    });
    return user?.interviewCredits ?? 0;
  }

  static async hasCredits(userId: string): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    return credits >= 1;
  }

  static async deductCredit(userId: string, interviewId: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { interviewCredits: true },
      });

      if (!user || user.interviewCredits < 1) {
        throw new Error("Insufficient interview credits");
      }

      await tx.user.update({
        where: { id: userId },
        data: { interviewCredits: { decrement: 1 } },
      });

      await tx.interviewCreditTransaction.create({
        data: {
          userId,
          amount: -1,
          type: CreditTransactionType.DEDUCTION,
          referenceId: interviewId,
          description: "Interview session started",
        },
      });
    });
  }

  static async addCredits(
    userId: string,
    amount: number,
    type: string,
    referenceId?: string,
    description?: string
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { interviewCredits: { increment: amount } },
      });

      await tx.interviewCreditTransaction.create({
        data: {
          userId,
          amount,
          type,
          referenceId: referenceId || null,
          description: description || `Added ${amount} interview credits`,
        },
      });
    });
  }

  static async getCreditPacks() {
    return prisma.interviewCreditPack.findMany({
      orderBy: { credits: "asc" },
    });
  }

  static async getCreditPackBySlug(slug: string) {
    return prisma.interviewCreditPack.findUnique({
      where: { slug },
    });
  }

  static async processSubscriptionCredits(userId: string) {
    const monthlyCredits = 5;
    await this.addCredits(
      userId,
      monthlyCredits,
      CreditTransactionType.SUBSCRIPTION,
      undefined,
      "Monthly CRACKED subscription credits"
    );
  }

  static async getTransactionHistory(
    userId: string,
    page: number = 1,
    pageSize: number = 20
  ) {
    const [transactions, total] = await Promise.all([
      prisma.interviewCreditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.interviewCreditTransaction.count({
        where: { userId },
      }),
    ]);

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
