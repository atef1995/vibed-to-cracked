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
      dropOffData,
    ] = await Promise.all([
      AnonymousTrackingService.getConversionFunnel(),
      AnonymousTrackingService.getTopConvertingTutorials(10),
      getRecentSessions(50),
      getDeviceBreakdown(),
      getSourceBreakdown(),
      getDropOffAnalysis(),
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
      dropOff: dropOffData,
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
      region: true,
      source: true,
      medium: true,
      referrer: true,
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

interface TutorialViewJson {
  tutorialId: string;
  slug?: string;
  startedAt?: string;
  timeSpent: number;
}

async function getDropOffAnalysis() {
  const abandoned = await prisma.anonymousSession.findMany({
    where: { convertedToUserId: null },
    select: {
      tutorialsViewed: true,
      totalTimeSpent: true,
      pagesViewed: true,
      landingPage: true,
      createdAt: true,
      lastActiveAt: true,
    },
  });

  // Last tutorial before leaving (drop-off points)
  const lastTutorialCounts: Record<string, number> = {};
  // Landing page engagement
  const landingStats: Record<
    string,
    { visits: number; totalTime: number; totalPages: number; bounces: number }
  > = {};
  // Session duration buckets
  const durationBuckets = {
    "< 30s": 0,
    "30s-2m": 0,
    "2m-5m": 0,
    "5m-15m": 0,
    "15m-30m": 0,
    "30m+": 0,
  };
  let totalBounces = 0;

  for (const s of abandoned) {
    const tutorials =
      (s.tutorialsViewed as unknown as TutorialViewJson[]) || [];
    const duration = s.totalTimeSpent;

    // Last tutorial
    if (tutorials.length > 0) {
      const last = tutorials[tutorials.length - 1];
      const key = last.slug || last.tutorialId;
      lastTutorialCounts[key] = (lastTutorialCounts[key] || 0) + 1;
    }

    // Landing page stats
    const page = s.landingPage || "(unknown)";
    if (!landingStats[page]) {
      landingStats[page] = {
        visits: 0,
        totalTime: 0,
        totalPages: 0,
        bounces: 0,
      };
    }
    landingStats[page].visits++;
    landingStats[page].totalTime += duration;
    landingStats[page].totalPages += s.pagesViewed;
    if (s.pagesViewed <= 1 && duration < 30) {
      landingStats[page].bounces++;
      totalBounces++;
    }

    // Duration buckets
    if (duration < 30) durationBuckets["< 30s"]++;
    else if (duration < 120) durationBuckets["30s-2m"]++;
    else if (duration < 300) durationBuckets["2m-5m"]++;
    else if (duration < 900) durationBuckets["5m-15m"]++;
    else if (duration < 1800) durationBuckets["15m-30m"]++;
    else durationBuckets["30m+"]++;
  }

  const lastTutorials = Object.entries(lastTutorialCounts)
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const landingPages = Object.entries(landingStats)
    .map(([page, d]) => ({
      page,
      visits: d.visits,
      avgTime: d.visits > 0 ? Math.round(d.totalTime / d.visits) : 0,
      avgPages:
        d.visits > 0 ? Math.round((d.totalPages / d.visits) * 10) / 10 : 0,
      bounceRate: d.visits > 0 ? Math.round((d.bounces / d.visits) * 100) : 0,
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);

  return {
    lastTutorials,
    landingPages,
    durationBuckets: Object.entries(durationBuckets).map(([bucket, count]) => ({
      bucket,
      count,
    })),
    bounceRate:
      abandoned.length > 0
        ? Math.round((totalBounces / abandoned.length) * 100)
        : 0,
    totalAbandoned: abandoned.length,
  };
}
