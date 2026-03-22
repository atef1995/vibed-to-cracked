import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Search users and get current user ID in parallel
    const [users, currentUserRecord] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query } },
            { name: { contains: query } },
          ],
          NOT: { email: session.user.email },
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          updatedAt: true,
        },
        take: 10,
      }),
      prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      }),
    ]);

    if (!currentUserRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserId = currentUserRecord.id;

    // Fetch friend relationships and existing requests in parallel
    const [existingRelationships, friendships] = await Promise.all([
      prisma.friendRequest.findMany({
        where: {
          OR: [
            {
              senderId: currentUserId,
              receiverId: { in: users.map((u) => u.id) },
            },
            {
              senderId: { in: users.map((u) => u.id) },
              receiverId: currentUserId,
            },
          ],
        },
        select: { senderId: true, receiverId: true, status: true },
      }),
      prisma.friendship.findMany({
        where: {
          OR: [
            { user1Id: currentUserId, user2Id: { in: users.map((u) => u.id) } },
            { user1Id: { in: users.map((u) => u.id) }, user2Id: currentUserId },
          ],
        },
        select: { user1Id: true, user2Id: true },
      }),
    ]);

    // Create sets of user IDs to exclude
    const requestUserIds = new Set(
      existingRelationships.map(
        (rel: { senderId: string; receiverId: string }) =>
          rel.senderId === currentUserId ? rel.receiverId : rel.senderId
      )
    );

    const friendUserIds = new Set(
      friendships.map((friendship: { user1Id: string; user2Id: string }) =>
        friendship.user1Id === currentUserId
          ? friendship.user2Id
          : friendship.user1Id
      )
    );

    // Filter out users with existing relationships
    const availableUsers = users
      .filter(
        (user: {
          id: string;
          name: string | null;
          username: string | null;
          image: string | null;
          updatedAt: Date;
        }) => !requestUserIds.has(user.id) && !friendUserIds.has(user.id)
      )
      .map(
        (user: {
          id: string;
          name: string | null;
          username: string | null;
          image: string | null;
          updatedAt: Date;
        }) => ({
          ...user,
          lastActive: user.updatedAt,
          isOnline:
            new Date().getTime() - new Date(user.updatedAt).getTime() <
            5 * 60 * 1000, // Online if active within 5 minutes
        })
      );

    return NextResponse.json({ users: availableUsers });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
