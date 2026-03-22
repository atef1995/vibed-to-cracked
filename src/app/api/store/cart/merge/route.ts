import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mergeAnonymousCart } from "@/lib/services/cartService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = request.cookies.get("cart_session_id")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "No anonymous session found" },
        { status: 400 }
      );
    }

    const result = await mergeAnonymousCart(sessionId, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to merge cart" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      merged: result.merged,
      message: `Merged ${result.merged} items to your cart`,
    });
  } catch (error) {
    console.error("Cart merge error:", error);
    return NextResponse.json(
      { error: "Failed to merge cart" },
      { status: 500 }
    );
  }
}
