import { prisma } from "@/lib/prisma";

export class TutorService {
  /**
   * Get or create a conversation for a user on a specific content item
   */
  static async getOrCreateConversation(
    userId: string,
    contentType: string,
    contentId: string
  ) {
    try {
      const conversation = await prisma.tutorConversation.upsert({
        where: {
          userId_contentType_contentId: { userId, contentType, contentId },
        },
        create: { userId, contentType, contentId },
        update: { updatedAt: new Date() },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 50,
          },
        },
      });
      return conversation;
    } catch (error) {
      console.error("Error in getOrCreateConversation:", error);
      throw new Error("Failed to get or create conversation");
    }
  }

  /**
   * Get conversation messages with optional limit
   */
  static async getConversationMessages(conversationId: string, limit = 50) {
    try {
      return await prisma.tutorMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        take: limit,
      });
    } catch (error) {
      console.error("Error in getConversationMessages:", error);
      throw new Error("Failed to fetch messages");
    }
  }

  /**
   * Save a single message to a conversation
   */
  static async saveMessage(
    conversationId: string,
    role: string,
    content: string,
    highlightedText?: string
  ) {
    try {
      const message = await prisma.tutorMessage.create({
        data: {
          conversationId,
          role,
          content,
          highlightedText: highlightedText || null,
        },
      });

      // Touch the conversation's updatedAt
      await prisma.tutorConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    } catch (error) {
      console.error("Error in saveMessage:", error);
      throw new Error("Failed to save message");
    }
  }

  /**
   * Count how many messages a user has sent today (for rate limiting)
   */
  static async getUserDailyMessageCount(userId: string): Promise<number> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const count = await prisma.tutorMessage.count({
        where: {
          role: "user",
          createdAt: { gte: startOfDay },
          conversation: { userId },
        },
      });

      return count;
    } catch (error) {
      console.error("Error in getUserDailyMessageCount:", error);
      return 0;
    }
  }

  /**
   * Clear all messages in a conversation
   */
  static async clearConversation(conversationId: string, userId: string) {
    try {
      // Verify ownership before deleting
      const conversation = await prisma.tutorConversation.findFirst({
        where: { id: conversationId, userId },
      });

      if (!conversation) {
        throw new Error("Conversation not found or access denied");
      }

      await prisma.tutorMessage.deleteMany({
        where: { conversationId },
      });

      return true;
    } catch (error) {
      console.error("Error in clearConversation:", error);
      throw new Error("Failed to clear conversation");
    }
  }

  /**
   * Get a user's conversation for a specific content item by slug
   */
  static async getConversationBySlug(
    userId: string,
    contentType: string,
    contentSlug: string
  ) {
    try {
      // Look up the content ID from the slug based on content type
      let contentId: string | null = null;

      if (contentType === "tutorial") {
        const tutorial = await prisma.tutorial.findUnique({
          where: { slug: contentSlug },
          select: { id: true },
        });
        contentId = tutorial?.id ?? null;
      } else if (contentType === "challenge") {
        const challenge = await prisma.challenge.findUnique({
          where: { slug: contentSlug },
          select: { id: true },
        });
        contentId = challenge?.id ?? null;
      } else if (contentType === "exercise") {
        const exercise = await prisma.exercise.findUnique({
          where: { slug: contentSlug },
          select: { id: true },
        });
        contentId = exercise?.id ?? null;
      }

      if (!contentId) return null;

      const conversation = await prisma.tutorConversation.findUnique({
        where: {
          userId_contentType_contentId: { userId, contentType, contentId },
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 50,
          },
        },
      });
      return conversation;
    } catch (error) {
      console.error("Error in getConversationBySlug:", error);
      return null;
    }
  }
}
