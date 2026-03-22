import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { awardXP } from "@/lib/services/xpService";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { amount, reason, metadata } = body;

  if (typeof amount !== "number" || amount <= 0 || !reason) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await awardXP(session.user.id, amount, reason, metadata ?? {});

  return NextResponse.json(result);
}
