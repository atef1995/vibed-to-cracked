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

    const { companySlug } = await request.json();

    const avatarSession = await HeyGenService.createAvatarSession(companySlug);

    return NextResponse.json(avatarSession);
  } catch (error) {
    console.error("Error creating avatar session:", error);
    return NextResponse.json(
      { error: "Failed to create avatar session" },
      { status: 500 }
    );
  }
}
