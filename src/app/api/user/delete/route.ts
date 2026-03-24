import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/user/delete - Delete user account
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Delete all user-related data in the correct order (due to foreign key constraints)
    await prisma.$transaction(async (tx: unknown) => {
      const txClient = tx as typeof prisma;
      // Delete progress records first
      await txClient.tutorialProgress.deleteMany({
        where: { userId },
      });

      await txClient.challengeProgress.deleteMany({
        where: { userId },
      });

      await txClient.progress.deleteMany({
        where: { userId },
      });

      // Delete attempts
      await txClient.challengeAttempt.deleteMany({
        where: { userId },
      });

      await txClient.quizAttempt.deleteMany({
        where: { userId },
      });

      // Delete payments and subscriptions
      await txClient.payment.deleteMany({
        where: { userId },
      });

      await txClient.subscription.deleteMany({
        where: { userId },
      });

      // Delete user sessions
      await txClient.session.deleteMany({
        where: { userId },
      });

      // Delete accounts
      await txClient.account.deleteMany({
        where: { userId },
      });

      // Finally delete the user
      await txClient.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
