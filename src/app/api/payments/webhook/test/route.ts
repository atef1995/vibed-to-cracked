import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.text();

    console.log("[test-webhook] Received data:", {
      method: request.method,
      bodyLength: body.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Test webhook received",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[test-webhook] Error:", error);
    return NextResponse.json(
      { error: "Test webhook failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Test webhook endpoint is working",
    timestamp: new Date().toISOString(),
  });
}