import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { leaderboardCache } from "@/lib/cache";

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  score: number;
  level: number;
}

export interface LeaderboardResponse {
  success: boolean;
  entries: LeaderboardEntry[];
  currentUser?: LeaderboardEntry & { isInTop100: boolean };
  type: "xp" | "points";
  scope: "global" | "friends";
  period: "all" | "weekly" | "monthly";
  error?: string;
}

const LEADERBOARD_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") as "xp" | "points") || "xp";
    const scope =
      (searchParams.get("scope") as "global" | "friends") || "global";
    const period =
      (searchParams.get("period") as "all" | "weekly" | "monthly") || "all";

    // Generate cache key
    const cacheKey = `leaderboard:${type}:${scope}:${period}:${
      scope === "friends" ? user.id : "global"
    }`;

    // Check cache
    const cached = leaderboardCache.get(cacheKey) as LeaderboardResponse | null;
    if (cached) {
      // Recalculate current user position (may have changed)
      const currentUserEntry = await getCurrentUserEntry(
        user.id,
        type,
        period,
        scope
      );
      return NextResponse.json({
        ...cached,
        currentUser: currentUserEntry,
      });
    }

    // Get friend IDs if scope is friends
    let friendIds: string[] = [];
    if (scope === "friends") {
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [{ user1Id: user.id }, { user2Id: user.id }],
        },
        select: { user1Id: true, user2Id: true },
      });

      friendIds = friendships.map((f) =>
        f.user1Id === user.id ? f.user2Id : f.user1Id
      );
      // Include current user in friends leaderboard
      friendIds.push(user.id);
    }

    let entries: LeaderboardEntry[];

    if (type === "xp") {
      entries = await getXpLeaderboard(period, scope, friendIds);
    } else {
      entries = await getPointsLeaderboard(period, scope, friendIds);
    }

    // Get current user's entry
    const currentUserEntry = await getCurrentUserEntry(
      user.id,
      type,
      period,
      scope
    );

    const response: LeaderboardResponse = {
      success: true,
      entries,
      currentUser: currentUserEntry,
      type,
      scope,
      period,
    };

    // Cache the response (without currentUser since that needs to be fresh)
    leaderboardCache.set(cacheKey, {
      ...response,
      currentUser: undefined,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

async function getXpLeaderboard(
  period: "all" | "weekly" | "monthly",
  scope: "global" | "friends",
  friendIds: string[]
): Promise<LeaderboardEntry[]> {
  if (period === "all") {
    // Use user.xp directly for all-time
    // Note: Users without userSettings or with showPublicProfile=true (default) should be included
    const users = await prisma.user.findMany({
      where: {
        ...(scope === "friends" ? { id: { in: friendIds } } : {}),
        OR: [
          { userSettings: null },
          { userSettings: { showPublicProfile: true } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        xp: true,
        level: true,
      },
      orderBy: { xp: "desc" },
      take: LEADERBOARD_LIMIT,
    });

    return users.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.name,
      username: u.username,
      image: u.image,
      score: u.xp,
      level: u.level,
    }));
  }

  // For weekly/monthly, aggregate from XpTransaction
  const dateFrom = getDateFrom(period);

  const aggregations = await prisma.xpTransaction.groupBy({
    by: ["userId"],
    where: {
      createdAt: { gte: dateFrom },
      ...(scope === "friends" ? { userId: { in: friendIds } } : {}),
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: LEADERBOARD_LIMIT,
  });

  const userIds = aggregations.map((a) => a.userId);
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      OR: [
        { userSettings: null },
        { userSettings: { showPublicProfile: true } },
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      level: true,
    },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return aggregations
    .map((a, index) => {
      const u = userMap.get(a.userId);
      if (!u) return null;
      return {
        rank: index + 1,
        id: u.id,
        name: u.name,
        username: u.username,
        image: u.image,
        score: a._sum.amount || 0,
        level: u.level,
      };
    })
    .filter((e): e is LeaderboardEntry => e !== null);
}

async function getPointsLeaderboard(
  period: "all" | "weekly" | "monthly",
  scope: "global" | "friends",
  friendIds: string[]
): Promise<LeaderboardEntry[]> {
  const dateFrom = period === "all" ? undefined : getDateFrom(period);

  // Get users with their achievement points
  // Note: Users without userSettings or with showPublicProfile=true (default) should be included
  const userAchievements = await prisma.userAchievement.findMany({
    where: {
      ...(dateFrom ? { unlockedAt: { gte: dateFrom } } : {}),
      ...(scope === "friends" ? { userId: { in: friendIds } } : {}),
      user: {
        OR: [
          { userSettings: null },
          { userSettings: { showPublicProfile: true } },
        ],
      },
    },
    include: {
      achievement: { select: { points: true } },
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          level: true,
        },
      },
    },
  });

  // Aggregate points per user
  const userPoints = new Map<
    string,
    { user: (typeof userAchievements)[0]["user"]; points: number }
  >();

  for (const ua of userAchievements) {
    const existing = userPoints.get(ua.userId);
    if (existing) {
      existing.points += ua.achievement.points;
    } else {
      userPoints.set(ua.userId, {
        user: ua.user,
        points: ua.achievement.points,
      });
    }
  }

  // Sort and limit
  const sorted = Array.from(userPoints.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, LEADERBOARD_LIMIT);

  return sorted.map((entry, index) => ({
    rank: index + 1,
    id: entry.user.id,
    name: entry.user.name,
    username: entry.user.username,
    image: entry.user.image,
    score: entry.points,
    level: entry.user.level,
  }));
}

async function getCurrentUserEntry(
  userId: string,
  type: "xp" | "points",
  period: "all" | "weekly" | "monthly",
  scope: "global" | "friends"
): Promise<(LeaderboardEntry & { isInTop100: boolean }) | undefined> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      xp: true,
      level: true,
    },
  });

  if (!user) return undefined;

  let score: number;
  let rank: number;

  if (type === "xp") {
    if (period === "all") {
      score = user.xp;
      // Count users with higher XP
      rank =
        (await prisma.user.count({
          where: { xp: { gt: user.xp } },
        })) + 1;
    } else {
      const dateFrom = getDateFrom(period);
      const userXp = await prisma.xpTransaction.aggregate({
        where: { userId, createdAt: { gte: dateFrom } },
        _sum: { amount: true },
      });
      score = userXp._sum.amount || 0;

      // Count users with higher XP in period
      const higherUsers = await prisma.xpTransaction.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: dateFrom } },
        _sum: { amount: true },
        having: { amount: { _sum: { gt: score } } },
      });
      rank = higherUsers.length + 1;
    }
  } else {
    const dateFrom = period === "all" ? undefined : getDateFrom(period);
    const userAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        ...(dateFrom ? { unlockedAt: { gte: dateFrom } } : {}),
      },
      include: { achievement: { select: { points: true } } },
    });
    score = userAchievements.reduce(
      (sum, ua) => sum + ua.achievement.points,
      0
    );

    // Calculate rank for points - fetch all achievements and aggregate manually
    const usersWithPoints = await prisma.userAchievement.findMany({
      where: dateFrom ? { unlockedAt: { gte: dateFrom } } : {},
      include: { achievement: { select: { points: true } } },
    });

    const pointsByUser = new Map<string, number>();
    for (const ua of usersWithPoints) {
      pointsByUser.set(
        ua.userId,
        (pointsByUser.get(ua.userId) || 0) + ua.achievement.points
      );
    }

    rank =
      Array.from(pointsByUser.values()).filter((p) => p > score).length + 1;
  }

  return {
    rank,
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.image,
    score,
    level: user.level,
    isInTop100: rank <= LEADERBOARD_LIMIT,
  };
}

function getDateFrom(period: "weekly" | "monthly"): Date {
  const now = new Date();
  if (period === "weekly") {
    const date = new Date(now);
    date.setDate(date.getDate() - 7);
    return date;
  } else {
    const date = new Date(now);
    date.setMonth(date.getMonth() - 1);
    return date;
  }
}
