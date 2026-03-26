import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProgressService } from "@/lib/progressService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await ProgressService.getInProgressItems(session.user.id, 3);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching continue items:", error);
    return NextResponse.json(
      { error: "Failed to fetch continue items" },
      { status: 500 }
    );
  }
}
