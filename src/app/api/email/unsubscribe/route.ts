import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmailService } from "@/lib/services/emailService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/unsubscribe?error=missing`,
        { status: 302 }
      );
    }

    if (!EmailService.verifyUnsubscribeToken(email, token)) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/unsubscribe?error=invalid`,
        { status: 302 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.userSettings.upsert({
      where: {
        userId: user.id,
      },
      update: {
        emailNotifications: false,
        reminderNotifications: false,
        achievementNotifications: false,
        weeklyProgressReports: false,
      },
      create: {
        userId: user.id,
        emailNotifications: false,
        reminderNotifications: false,
        achievementNotifications: false,
        weeklyProgressReports: false,
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/unsubscribe?success=true`,
      { status: 302 }
    );
  } catch (error) {
    console.error("Error unsubscribing user:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/unsubscribe?error=true`,
      { status: 302 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.userSettings.upsert({
      where: {
        userId: user.id,
      },
      update: {
        emailNotifications: false,
        reminderNotifications: false,
        achievementNotifications: false,
        weeklyProgressReports: false,
      },
      create: {
        userId: user.id,
        emailNotifications: false,
        reminderNotifications: false,
        achievementNotifications: false,
        weeklyProgressReports: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from all emails",
    });
  } catch (error) {
    console.error("Error unsubscribing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
