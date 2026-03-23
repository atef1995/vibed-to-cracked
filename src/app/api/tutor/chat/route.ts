import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TutorService } from "@/lib/tutorService";
import { TutorialService } from "@/lib/tutorialService";
import { buildSystemPrompt, buildUserMessage } from "@/lib/tutorPrompts";
import { PLAN_CONFIGS, Plan } from "@/lib/subscriptionConstants";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tutorialSlug, message, highlightedText } = await request.json();

    if (!tutorialSlug || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof message !== "string" || message.length > 2000) {
      return NextResponse.json(
        { error: "Message must be a string under 2000 characters" },
        { status: 400 }
      );
    }

    // Rate limit check
    const userPlan = (session.user.subscription || "FREE") as Plan;
    const planConfig = PLAN_CONFIGS[userPlan] || PLAN_CONFIGS[Plan.FREE];
    const dailyLimit = planConfig.aiTutorMessagesPerDay;
    const dailyCount = await TutorService.getUserDailyMessageCount(
      session.user.id
    );

    if (dailyLimit !== null && dailyCount >= dailyLimit) {
      return NextResponse.json(
        {
          error: "Daily message limit reached",
          limit: dailyLimit,
          used: dailyCount,
        },
        { status: 429 }
      );
    }

    // Get tutorial content for context
    const tutorial = await TutorialService.getTutorialBySlug(tutorialSlug);
    if (!tutorial) {
      return NextResponse.json(
        { error: "Tutorial not found" },
        { status: 404 }
      );
    }

    // Get or create conversation
    const conversation = await TutorService.getOrCreateConversation(
      session.user.id,
      tutorial.id
    );

    // Save the user message
    await TutorService.saveMessage(
      conversation.id,
      "user",
      message,
      highlightedText
    );

    // Build message history for OpenAI (last 20 messages for context window)
    const recentMessages = conversation.messages.slice(-20);
    const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: buildSystemPrompt(
          session.user.mood || "CHILL",
          tutorial.title,
          tutorial.content || tutorial.description || ""
        ),
      },
      ...recentMessages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: buildUserMessage(message, highlightedText),
      },
    ];

    // Stream the response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      stream: true,
      max_tokens: 800,
      temperature: 0.7,
    });

    // Create a ReadableStream that forwards the OpenAI stream
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // Save the complete assistant response after streaming finishes
          await TutorService.saveMessage(
            conversation.id,
            "assistant",
            fullResponse
          );

          controller.close();
        } catch (err) {
          console.error("Error during streaming:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Conversation-Id": conversation.id,
      },
    });
  } catch (error) {
    console.error("Error in tutor chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
