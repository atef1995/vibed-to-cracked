import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TutorService } from "@/lib/tutorService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("contentType");
    const contentSlug = searchParams.get("contentSlug");

    if (!contentType || !contentSlug) {
      return NextResponse.json(
        { error: "Missing contentType or contentSlug parameter" },
        { status: 400 }
      );
    }

    const conversation = await TutorService.getConversationBySlug(
      session.user.id,
      contentType,
      contentSlug
    );

    if (!conversation) {
      return NextResponse.json({ conversation: null, messages: [] });
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("Error fetching tutor history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversationId parameter" },
        { status: 400 }
      );
    }

    await TutorService.clearConversation(conversationId, session.user.id);

    return NextResponse.json({ cleared: true });
  } catch (error) {
    console.error("Error clearing tutor history:", error);
    return NextResponse.json(
      { error: "Failed to clear history" },
      { status: 500 }
    );
  }
}
