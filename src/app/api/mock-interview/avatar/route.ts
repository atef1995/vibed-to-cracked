import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HeyGenService } from "@/lib/heygenService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!HeyGenService.isConfigured()) {
      return NextResponse.json(
        { error: "Avatar service not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Handle stop request
    if (body.action === "stop" && body.sessionId) {
      await HeyGenService.closeSession(body.sessionId);
      return NextResponse.json({ data: { success: true } });
    }

    // Create new session token
    const { companySlug } = body;
    const avatarSession = await HeyGenService.createAvatarSession(companySlug);

    return NextResponse.json({ data: avatarSession });
  } catch (error) {
    console.error("Error in avatar route:", error);
    return NextResponse.json(
      { error: "Failed to process avatar request" },
      { status: 500 }
    );
  }
}
