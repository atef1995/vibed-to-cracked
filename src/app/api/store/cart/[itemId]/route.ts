import { NextRequest, NextResponse } from "next/server";
import {
  removeFromCart,
  updateCartItemQuantity,
} from "@/lib/services/cartService";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  let itemId: string | undefined;

  try {
    ({ itemId } = await params);
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
