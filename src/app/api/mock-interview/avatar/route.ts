import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HeyGenService } from "@/lib/heygenService";
import { SimliService } from "@/lib/services/simliService";

function getAvatarProvider(): "simli" | "heygen" {
  const provider = process.env.AVATAR_PROVIDER?.toLowerCase();
  if (provider === "simli") return "simli";
  return "heygen";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = getAvatarProvider();
    const body = await request.json();

    // Lightweight probe: return provider without creating sessions
    if (body.action === "probe") {
      return NextResponse.json({ data: { provider } });
    }

    if (provider === "simli") {
      if (!SimliService.isConfigured()) {
        return NextResponse.json(
          { error: "Avatar service not configured" },
          { status: 503 }
        );
      }

      if (body.action === "stop") {
        return NextResponse.json({ data: { success: true } });
      }

      const { interviewType } = body;
      const { sessionToken, faceId } =
        await SimliService.createSessionToken(interviewType);
      return NextResponse.json({
        data: { provider: "simli", sessionToken, faceId },
      });
    }

    // HeyGen flow (default)
    if (!HeyGenService.isConfigured()) {
      return NextResponse.json(
        { error: "Avatar service not configured" },
        { status: 503 }
      );
    }

    // Handle stop request
    if (body.action === "stop" && body.sessionId) {
      await HeyGenService.closeSession(body.sessionId);
      return NextResponse.json({ data: { success: true } });
    }

    // Create new session token
    const { interviewType } = body;
    const avatarSession =
      await HeyGenService.createAvatarSession(interviewType);

    return NextResponse.json({
      data: { provider: "heygen", ...avatarSession },
    });
  } catch (error) {
    console.error("Error in avatar route:", error);
    return NextResponse.json(
      { error: "Failed to process avatar request" },
      { status: 500 }
    );
  }
}
