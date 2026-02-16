import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getOrderById } from "@/lib/services/storeService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get order and verify it belongs to the user
    const order = await getOrderById(id, session.user.id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Order not found" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch order" },
      },
      { status: 500 }
    );
  }
}
