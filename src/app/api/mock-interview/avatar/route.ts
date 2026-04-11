import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HeyGenService } from "@/lib/heygenService";
import { DecartService } from "@/lib/decartService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Handle stop request
    if (body.action === "stop" && body.sessionId) {
      if (body.provider === "decart") {
        await DecartService.closeSession(body.sessionId);
      } else {
        await HeyGenService.closeSession(body.sessionId);
      }
      return NextResponse.json({ data: { success: true } });
    }

    // Handle Decart speak request
    if (body.action === "speak" && body.sessionId && body.text) {
      await DecartService.speak(body.sessionId, body.text);
      return NextResponse.json({ data: { success: true } });
    }

    // Create new session — try Decart first, fall back to HeyGen
    const { companySlug } = body;

    if (DecartService.isConfigured()) {
      try {
        const avatarSession =
          await DecartService.createAvatarSession(companySlug);
        return NextResponse.json({
          data: { ...avatarSession, provider: "decart" },
        });
      } catch (err) {
        console.warn(
          "Decart avatar session failed, falling back to HeyGen:",
          err
        );
      }
    }

    if (!HeyGenService.isConfigured()) {
      return NextResponse.json(
        { error: "Avatar service not configured" },
        { status: 503 }
      );
    }

    const avatarSession = await HeyGenService.createAvatarSession(companySlug);
    return NextResponse.json({
      data: { ...avatarSession, provider: "heygen" },
    });
  } catch (error) {
    console.error("Error in avatar route:", error);
    return NextResponse.json(
      { error: "Failed to process avatar request" },
      { status: 500 }
    );
  }
}
