import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Get all stats in parallel
    const [
      totalUsers,
      subscribedUsers,
      activeToday,
      activeThisWeek,
      newThisWeek,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          subscription: { in: ["VIBED", "CRACKED"] },
        },
      }),
      prisma.user.count({
        where: {
          updatedAt: { gte: startOfDay },
        },
      }),
      prisma.user.count({
        where: {
          updatedAt: { gte: startOfWeek },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startOfWeek },
        },
      }),
      prisma.user.findMany({
        orderBy: { updatedAt: "desc" },
        take: 20,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          image: true,
          subscription: true,
          xp: true,
          level: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        subscribedUsers,
        freeUsers: totalUsers - subscribedUsers,
        activeToday,
        activeThisWeek,
        newThisWeek,
      },
      recentUsers,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
