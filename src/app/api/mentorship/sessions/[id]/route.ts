import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MentorshipService } from "@/lib/mentorshipService";
import { prisma } from "@/lib/prisma";
import { MentorshipSessionStatus } from "@/lib/subscriptionConstants";
import { emailService } from "@/lib/services/emailService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, feedback } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = Object.values(MentorshipSessionStatus);
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    let updated;
    if (status === MentorshipSessionStatus.COMPLETED) {
      updated = await MentorshipService.markComplete(id, feedback);

      // Notify user that feedback is ready
      const sessionWithUser = await prisma.mentorshipSession.findUnique({
        where: { id },
        include: { user: true },
      });
      if (sessionWithUser?.user) {
        emailService
          .sendMentorshipFeedbackReady(sessionWithUser.user, sessionWithUser)
          .catch(() => {});
      }
    } else if (status === MentorshipSessionStatus.CANCELLED) {
      updated = await MentorshipService.cancelSession(id);
    } else {
      updated = await prisma.mentorshipSession.update({
        where: { id },
        data: { status },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating mentorship session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const cancelled = await MentorshipService.cancelSession(
      id,
      session.user.id
    );

    return NextResponse.json(cancelled);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Session not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (
        error.message === "Not authorized to cancel this session" ||
        error.message.includes("Cannot cancel")
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    console.error("Error cancelling mentorship session:", error);
    return NextResponse.json(
      { error: "Failed to cancel session" },
      { status: 500 }
    );
  }
}
