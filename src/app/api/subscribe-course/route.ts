import { NextRequest, NextResponse } from "next/server";
import { CourseService } from "@/lib/courseService";
import { emailService } from "@/lib/services/emailService";
import validator from "validator";
import mailchecker from "mailchecker";

const MAX_SUBSCRIPTIONS_PER_IP = 5;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { email, name } = body;

  if (!email || typeof email !== "string" || !validator.isEmail(email)) {
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 }
    );
  }

  if (!mailchecker.isValid(email)) {
    return NextResponse.json(
      { error: "Please use a real email address, not a disposable one." },
      { status: 400 }
    );
  }

  const sanitizedEmail = validator.normalizeEmail(email) || email;
  const sanitizedName = name
    ? validator.escape(validator.trim(name)).slice(0, 100)
    : null;

  try {
    const ip = getClientIp(req);

    // Rate limit: max subscriptions per IP in 24h
    const recentCount = await CourseService.countRecentByIp(ip);
    if (recentCount >= MAX_SUBSCRIPTIONS_PER_IP) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const existing = await CourseService.findByEmail(sanitizedEmail);

    if (existing) {
      if (existing.status === "UNSUBSCRIBED") {
        await CourseService.resubscribe(sanitizedEmail);
      } else {
        return NextResponse.json({ alreadySubscribed: true }, { status: 200 });
      }
    } else {
      const rawReferer = req.headers.get("referer");
      const source = rawReferer
        ? validator.escape(rawReferer.slice(0, 200))
        : "direct";

      await CourseService.create({
        email: sanitizedEmail,
        name: sanitizedName,
        ipAddress: ip,
        source,
      });
    }

    // Send Day 1 email — failures are non-blocking (cron retries)
    try {
      const result = await emailService.sendFreeCourseEmail(
        sanitizedEmail,
        1,
        sanitizedName || undefined
      );
      if (!result.success) {
        console.error("Failed to send Day 1 email:", result.error);
      }
    } catch (emailError) {
      console.error("Error sending course email:", emailError);
    }

    return NextResponse.json(
      { message: "Subscribed. Check your email for Day 1." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error subscribing to course:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
