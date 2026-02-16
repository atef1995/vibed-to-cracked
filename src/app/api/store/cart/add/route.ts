import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { addToCart } from "@/lib/services/cartService";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Product ID is required" },
        },
        { status: 400 }
      );
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Quantity must be a positive integer" },
        },
        { status: 400 }
      );
    }

    // Get or generate anonymous session ID
    let anonymousSessionId = request.cookies.get("anonymous_session_id")?.value;

    if (!userId && !anonymousSessionId) {
      // Generate new anonymous session ID
      anonymousSessionId = randomBytes(32).toString("hex");
    }

    const result = await addToCart({
      productId,
      quantity,
      userId,
      sessionId: anonymousSessionId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: result.error || "Failed to add to cart" },
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: { cartItem: result.cartItem },
    });

    // Set anonymous session cookie if needed
    if (!userId && anonymousSessionId) {
      response.cookies.set("anonymous_session_id", anonymousSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to add to cart" },
      },
      { status: 500 }
    );
  }
}
