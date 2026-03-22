import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  removeFromCart,
  updateCartItemQuantity,
} from "@/lib/services/cartService";

async function verifyCartItemOwnership(
  itemId: string,
  request: NextRequest
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    select: { cart: { select: { userId: true, sessionId: true } } },
  });

  if (!item) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Item not found" }, { status: 404 }),
    };
  }

  const session = await getServerSession(authOptions);

  if (item.cart.userId) {
    // Authenticated cart — must be the owner
    if (!session?.user?.id || item.cart.userId !== session.user.id) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 403 }),
      };
    }
  } else if (item.cart.sessionId) {
    // Anonymous cart — session cookie must match
    const cookieSessionId = request.cookies.get("cart_session_id")?.value;
    if (!cookieSessionId || item.cart.sessionId !== cookieSessionId) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 403 }),
      };
    }
  }

  return { ok: true };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  let itemId: string | undefined;

  try {
    ({ itemId } = await params);

    const ownership = await verifyCartItemOwnership(itemId, request);
    if (!ownership.ok) return ownership.response;

    const body = await request.json();
    const quantity = Number(body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Quantity must be a positive integer" },
        },
        { status: 400 }
      );
    }

    const result = await updateCartItemQuantity(itemId, quantity);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: result.error || "Failed to update cart item" },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { cartItem: result.cartItem },
    });
  } catch (error) {
    console.error(`Error updating cart item ${itemId ?? "unknown"}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to update cart item" },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  let itemId: string | undefined;

  try {
    ({ itemId } = await params);

    const ownership = await verifyCartItemOwnership(itemId, request);
    if (!ownership.ok) return ownership.response;

    const result = await removeFromCart(itemId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: result.error || "Failed to remove item from cart" },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Item removed from cart" },
    });
  } catch (error) {
    console.error(`Error removing cart item ${itemId ?? "unknown"}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to remove item from cart" },
      },
      { status: 500 }
    );
  }
}
