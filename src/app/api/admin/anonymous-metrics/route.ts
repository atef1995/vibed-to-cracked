import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnonymousTrackingService } from "@/lib/services/anonymousTrackingService";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [
      funnel,
      topTutorials,
      recentSessions,
      deviceBreakdown,
      sourceBreakdown,
    ] = await Promise.all([
      AnonymousTrackingService.getConversionFunnel(),
      AnonymousTrackingService.getTopConvertingTutorials(10),
      getRecentSessions(20),
      getDeviceBreakdown(),
      getSourceBreakdown(),
    ]);

    return NextResponse.json({
      stats: {
        totalSessions: funnel.totalSessions,
        convertedSessions: funnel.convertedSessions,
        unconvertedSessions: funnel.unconvertedSessions,
        conversionRate: funnel.conversionRate,
        avgTutorialsViewed: funnel.avgTutorialsViewed,
      },
      funnel: funnel.funnel,
      topTutorials,
      recentSessions,
      deviceBreakdown,
      sourceBreakdown,
    });
  } catch (error) {
    console.error("Error fetching anonymous metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}

async function getRecentSessions(limit: number) {
  return prisma.anonymousSession.findMany({
    orderBy: { lastActiveAt: "desc" },
    take: limit,
    select: {
      id: true,
      anonymousId: true,
      pagesViewed: true,
      totalTimeSpent: true,
      tutorialsViewed: true,
      device: true,
      browser: true,
      os: true,
      country: true,
      source: true,
      landingPage: true,
      convertedToUserId: true,
      convertedAt: true,
      createdAt: true,
      lastActiveAt: true,
    },
  });
}

async function getDeviceBreakdown() {
  const sessions = await prisma.anonymousSession.groupBy({
    by: ["device"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
  return sessions.map((s) => ({
    device: s.device || "Unknown",
    count: s._count.id,
  }));
}

async function getSourceBreakdown() {
  const sessions = await prisma.anonymousSession.groupBy({
    by: ["source"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });
  return sessions.map((s) => ({
    source: s.source || "Direct",
    count: s._count.id,
  }));
}
