import { prisma } from "@/lib/prisma";
import {
  MentorshipSessionStatus,
  MentorshipSessionType,
  MENTORSHIP_MONTHLY_LIMIT,
  Plan,
} from "@/lib/subscriptionConstants";

export class MentorshipService {
  /**
   * Count non-cancelled sessions for the current calendar month.
   */
  static async getMonthlyUsage(userId: string): Promise<number> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return prisma.mentorshipSession.count({
      where: {
        userId,
        status: { not: MentorshipSessionStatus.CANCELLED },
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    });
  }

  /**
   * Check if user can book a new session (CRACKED + under monthly limit).
   */
  static async canBookSession(
    userId: string
  ): Promise<{ canBook: boolean; remaining: number; limit: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscription: true, subscriptionStatus: true },
    });

    if (
      !user ||
      user.subscription !== Plan.CRACKED ||
      !["ACTIVE", "TRIAL"].includes(user.subscriptionStatus)
    ) {
      return { canBook: false, remaining: 0, limit: MENTORSHIP_MONTHLY_LIMIT };
    }

    const used = await this.getMonthlyUsage(userId);
    const remaining = Math.max(0, MENTORSHIP_MONTHLY_LIMIT - used);

    return {
      canBook: remaining > 0,
      remaining,
      limit: MENTORSHIP_MONTHLY_LIMIT,
    };
  }

  /**
   * Create a new mentorship session after validating eligibility.
   */
  static async createSession(
    userId: string,
    data: {
      type: MentorshipSessionType;
      codeLink?: string;
      description: string;
      scheduledAt?: Date;
      calendlyEventUri?: string;
    }
  ) {
    const { canBook } = await this.canBookSession(userId);
    if (!canBook) {
      throw new Error("Monthly mentorship session limit reached");
    }

    return prisma.mentorshipSession.create({
      data: {
        userId,
        type: data.type,
        status: MentorshipSessionStatus.PENDING,
        codeLink: data.codeLink || null,
        description: data.description,
        scheduledAt: data.scheduledAt || null,
        calendlyEventUri: data.calendlyEventUri || null,
      },
      include: { user: { select: { name: true, email: true } } },
    });
  }

  /**
   * Get a user's sessions, optionally filtered by status.
   */
  static async getUserSessions(
    userId: string,
    options?: { status?: string; page?: number; pageSize?: number }
  ) {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;

    const where: Record<string, unknown> = { userId };
    if (options?.status) {
      where.status = options.status;
    }

    const [sessions, total] = await Promise.all([
      prisma.mentorshipSession.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.mentorshipSession.count({ where }),
    ]);

    return { sessions, total, page, pageSize };
  }

  /**
   * Admin: get all sessions with filters.
   */
  static async getAllSessions(options?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;

    const where: Record<string, unknown> = {};
    if (options?.status) {
      where.status = options.status;
    }

    const [sessions, total] = await Promise.all([
      prisma.mentorshipSession.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.mentorshipSession.count({ where }),
    ]);

    return { sessions, total, page, pageSize };
  }

  /**
   * Admin: mark a session as completed with optional feedback.
   */
  static async markComplete(sessionId: string, feedback?: string) {
    return prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: {
        status: MentorshipSessionStatus.COMPLETED,
        completedAt: new Date(),
        feedback: feedback || null,
      },
    });
  }

  /**
   * Cancel a session. Validates ownership for non-admin callers.
   */
  static async cancelSession(sessionId: string, userId?: string) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (userId && session.userId !== userId) {
      throw new Error("Not authorized to cancel this session");
    }

    if (
      session.status === MentorshipSessionStatus.COMPLETED ||
      session.status === MentorshipSessionStatus.CANCELLED
    ) {
      throw new Error("Cannot cancel a completed or already cancelled session");
    }

    return prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: { status: MentorshipSessionStatus.CANCELLED },
    });
  }

  /**
   * Admin: get pending and scheduled sessions sorted by date.
   */
  static async getUpcomingSessions() {
    return prisma.mentorshipSession.findMany({
      where: {
        status: {
          in: [
            MentorshipSessionStatus.PENDING,
            MentorshipSessionStatus.SCHEDULED,
          ],
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Get a single session by ID.
   */
  static async getSession(sessionId: string) {
    return prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  }
}
