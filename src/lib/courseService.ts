import { prisma } from "@/lib/prisma";

export class CourseService {
  /**
   * Find a course subscriber by email.
   */
  static async findByEmail(email: string) {
    return prisma.courseSubscriber.findUnique({
      where: { email },
    });
  }

  /**
   * Re-subscribe a previously unsubscribed user, resetting to Day 1.
   */
  static async resubscribe(email: string) {
    return prisma.courseSubscriber.update({
      where: { email },
      data: {
        status: "ACTIVE",
        unsubscribedAt: null,
        emailsSent: [1],
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Create a new course subscriber.
   */
  static async create(data: {
    email: string;
    name?: string | null;
    ipAddress: string;
    source: string;
  }) {
    return prisma.courseSubscriber.create({
      data: {
        email: data.email,
        name: data.name || null,
        emailsSent: [1],
        status: "ACTIVE",
        ipAddress: data.ipAddress,
        source: data.source,
      },
    });
  }

  /**
   * Count recent subscriptions from an IP address (last 24 hours).
   */
  static async countRecentByIp(ip: string): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return prisma.courseSubscriber.count({
      where: {
        ipAddress: ip,
        createdAt: { gte: oneDayAgo },
      },
    });
  }
}
