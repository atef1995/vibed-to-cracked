import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MentorshipService } from "@/lib/mentorshipService";
import { MentorshipSessionType, Plan } from "@/lib/subscriptionConstants";
import { emailService } from "@/lib/services/emailService";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [result, availability] = await Promise.all([
      MentorshipService.getUserSessions(session.user.id),
      MentorshipService.canBookSession(session.user.id),
    ]);

    return NextResponse.json({
      sessions: result.sessions,
      total: result.total,
      ...availability,
    });
  } catch (error) {
    console.error("Error fetching mentorship sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.subscription !== Plan.CRACKED) {
      return NextResponse.json(
        { error: "Cracked subscription required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, codeLink, description, scheduledAt, calendlyEventUri } = body;

    if (
      !type ||
      ![MentorshipSessionType.LIVE, MentorshipSessionType.ASYNC].includes(type)
    ) {
      return NextResponse.json(
        { error: "Invalid session type" },
        { status: 400 }
      );
    }

    if (
      !description ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const mentorshipSession = await MentorshipService.createSession(
      session.user.id,
      {
        type,
        codeLink: codeLink || undefined,
        description: description.trim(),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        calendlyEventUri: calendlyEventUri || undefined,
      }
    );

    // Send emails in background — don't block the response
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (user) {
      emailService
        .sendMentorshipBookingConfirmation(user, mentorshipSession)
        .catch(() => {});
      emailService
        .sendMentorshipNewRequest({
          ...mentorshipSession,
          user: { name: user.name, username: user.username, email: user.email },
        })
        .catch(() => {});
    }

    return NextResponse.json(mentorshipSession, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Monthly mentorship session limit reached"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error creating mentorship session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
