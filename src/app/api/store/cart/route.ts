import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { clearCart, getCart } from "@/lib/services/cartService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Get anonymous session ID from header/cookie
    const anonymousSessionId = request.cookies.get(
      "anonymous_session_id"
    )?.value;

    if (!userId && !anonymousSessionId) {
      return NextResponse.json({
        success: true,
        data: { cart: null, total: 0, itemCount: 0 },
      });
    }

    const cart = await getCart(userId, anonymousSessionId);

    return NextResponse.json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch cart" },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const anonymousSessionId = request.cookies.get(
      "anonymous_session_id"
    )?.value;

    const result = await clearCart(userId, anonymousSessionId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: result.error || "Failed to clear cart" },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Cart cleared" },
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to clear cart" },
      },
      { status: 500 }
    );
  }
}
