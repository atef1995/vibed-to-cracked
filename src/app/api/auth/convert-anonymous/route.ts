/**
 * Convert Anonymous Session API
 *
 * Migrates anonymous user data to authenticated user account after signup.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AnonymousTrackingService } from "@/lib/services/anonymousTrackingService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { anonymousId, stepProgress } = body;

    if (!anonymousId && !stepProgress) {
      return NextResponse.json(
        { error: "Missing anonymousId or stepProgress" },
        { status: 400 }
      );
    }

    // Convert anonymous session to user
    const result = await AnonymousTrackingService.convertAnonymousToUser(
      anonymousId,
      session.user.id,
      stepProgress
    );

    if (!result) {
      return NextResponse.json(
        { error: "Anonymous session not found and no step progress provided" },
        { status: 404 }
      );
    }

    const parts: string[] = [];
    if (result.tutorialsMigrated > 0) {
      parts.push(
        `${result.tutorialsMigrated} tutorial${result.tutorialsMigrated > 1 ? "s" : ""}`
      );
    }
    if (result.stepsMigrated > 0) {
      parts.push(
        `${result.stepsMigrated} completed step${result.stepsMigrated > 1 ? "s" : ""}`
      );
    }

    return NextResponse.json({
      success: true,
      tutorialsMigrated: result.tutorialsMigrated,
      stepsMigrated: result.stepsMigrated,
      message:
        parts.length > 0
          ? `Welcome! We've saved your progress: ${parts.join(" and ")}.`
          : "Welcome to Vibed to Cracked!",
    });
  } catch (error) {
    console.error("Error converting anonymous session:", error);
    return NextResponse.json(
      { error: "Failed to convert session" },
      { status: 500 }
    );
  }
}
