import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCart, validateCartStock } from "@/lib/services/cartService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const anonymousSessionId = request.cookies.get(
      "anonymous_session_id"
    )?.value;

    const cart = await getCart(userId, anonymousSessionId);

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Cart not found" },
        },
        { status: 404 }
      );
    }

    const validation = await validateCartStock(cart.id);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Some items are unavailable or out of stock",
            details: validation.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { valid: true },
    });
  } catch (error) {
    console.error("Error validating cart stock:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to validate cart" },
      },
      { status: 500 }
    );
  }
}
