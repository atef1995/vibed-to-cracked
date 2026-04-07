import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { dashboardTourCompleted: true },
    });

    return NextResponse.json({ completed: true });
  } catch (error) {
    console.error("Error completing dashboard tour:", error);
    return NextResponse.json(
      { error: "Failed to complete tour" },
      { status: 500 }
    );
  }
}
