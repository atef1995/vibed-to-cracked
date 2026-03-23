import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TutorialService } from "@/lib/tutorialService";
import { SubscriptionService, Plan } from "@/lib/subscriptionService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETER",
            message: "File parameter is required",
          },
        },
        { status: 400 }
      );
    }

    // Reject path traversal and enforce safe slug format.
    // Each segment must start with alphanumeric/_/- so ".." is impossible.
    if (
      !/^[a-zA-Z0-9_-][a-zA-Z0-9._-]*(\/[a-zA-Z0-9_-][a-zA-Z0-9._-]*)*$/.test(
        fileName
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_PARAMETER", message: "Invalid file name" },
        },
        { status: 400 }
      );
    }

    // Get tutorial from database (includes content if stored there)
    const tutorial = await TutorialService.getTutorialByMdxFile(fileName);

    // Security: Check if tutorial is premium and verify user access
    if (
      tutorial?.isPremium ||
      (tutorial?.requiredPlan && tutorial.requiredPlan !== Plan.FREE)
    ) {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required for premium content",
            },
          },
          { status: 401 }
        );
      }

      // Check user's subscription
      const hasAccess = await SubscriptionService.canUserAccessContent(
        session.user.id,
        (tutorial.requiredPlan as Plan) || Plan.VIBED,
        tutorial.isPremium
      );

      if (!hasAccess) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Upgrade your plan to access this premium content",
              requiredPlan: tutorial.requiredPlan,
            },
          },
          { status: 403 }
        );
      }
    }

    // PRIORITY 1: Try to get content from database (secure for premium content)
    if (tutorial?.content && tutorial.content.length > 100) {
      const { data: frontmatter, content } = matter(tutorial.content);

      const cleanContent = content
        .trim()
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n");

      return NextResponse.json({
        success: true,
        data: {
          frontmatter,
          content: cleanContent,
          source: "database",
        },
      });
    }

    // PRIORITY 2: Fall back to file system (for local development)
    const tutorialsDir = path.resolve(
      path.join(process.cwd(), "src", "content", "tutorials")
    );
    const filePath = path.resolve(path.join(tutorialsDir, `${fileName}.mdx`));

    // Ensure resolved path stays within tutorials directory
    if (
      !filePath.startsWith(tutorialsDir + path.sep) &&
      filePath !== tutorialsDir
    ) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Access denied" },
        },
        { status: 403 }
      );
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Tutorial content not found" },
        },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data: frontmatter, content } = matter(fileContent);

    const cleanContent = content
      .trim()
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n");

    return NextResponse.json({
      success: true,
      data: {
        frontmatter,
        content: cleanContent,
        source: "file",
      },
    });
  } catch (error) {
    console.error("Error reading MDX content:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to read tutorial content",
        },
      },
      { status: 500 }
    );
  }
}
