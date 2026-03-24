import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/services/emailService";
import { Plan } from "@/lib/subscriptionConstants";

/**
 * POST /api/admin/broadcast-email
 *
 * Send broadcast emails to all users or specific groups.
 * Only accessible by admin users.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      recipientType,
      specificEmails,
      subject,
      message,
      includeUnsubscribe,
    } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    let recipients: {
      email: string;
      name: string | null;
      username: string | null;
    }[] = [];

    // Fetch recipients based on type
    switch (recipientType) {
      case "all":
        recipients = await prisma.user.findMany({
          where: {
            emailUnsubscribed: false,
          },
          select: {
            email: true,
            name: true,
            username: true,
          },
        });
        break;

      case "free":
        recipients = await prisma.user.findMany({
          where: {
            subscription: Plan.FREE,
            emailUnsubscribed: false,
          },
          select: {
            email: true,
            name: true,
            username: true,
          },
        });
        break;

      case "premium":
        recipients = await prisma.user.findMany({
          where: {
            subscription: {
              in: [Plan.VIBED, Plan.CRACKED],
            },
            emailUnsubscribed: false,
          },
          select: {
            email: true,
            name: true,
            username: true,
          },
        });
        break;

      case "specific":
        if (!specificEmails || specificEmails.length === 0) {
          return NextResponse.json(
            { error: "Please provide specific email addresses" },
            { status: 400 }
          );
        }

        recipients = await prisma.user.findMany({
          where: {
            email: {
              in: specificEmails,
            },
            emailUnsubscribed: false,
          },
          select: {
            email: true,
            name: true,
            username: true,
          },
        });

        if (recipients.length === 0) {
          return NextResponse.json(
            { error: "No valid recipients found with provided emails" },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid recipient type" },
          { status: 400 }
        );
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found for the selected criteria" },
        { status: 400 }
      );
    }

    // Send emails in batches to avoid rate limiting
    const BATCH_SIZE = 10;
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        batch.map((recipient) =>
          emailService.sendBroadcastEmail(
            recipient,
            subject,
            message,
            includeUnsubscribe
          )
        )
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        if (result.status === "fulfilled" && result.value.success) {
          sentCount++;
        } else {
          failedCount++;
          const errMsg =
            result.status === "rejected"
              ? result.reason?.message || "Unknown error"
              : result.value.error;
          errors.push(`${batch[j].email}: ${errMsg}`);
        }
      }

      // Delay between batches to avoid SMTP rate limits
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Log broadcast activity
    try {
      await prisma.emailLog.create({
        data: {
          type: "BROADCAST",
          subject,
          recipientCount: recipients.length,
          sentCount,
          failedCount,
          recipientType,
          sentBy: session.user.email || "admin",
        },
      });
    } catch (logError) {
      console.error("Failed to log broadcast email:", logError);
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: recipients.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    console.error("Error sending broadcast emails:", error);
    return NextResponse.json(
      {
        error: "Failed to send broadcast emails",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
