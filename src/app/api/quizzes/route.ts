import { NextRequest, NextResponse } from "next/server";
import { QuizService } from "@/lib/quizService";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorialId = searchParams.get("tutorialId");
    const id = searchParams.get("id");
    const search = searchParams.get("search") || "";
    const rawPage = parseInt(searchParams.get("page") || "0", 10);
    const rawLimit = parseInt(searchParams.get("limit") || "0", 10);

    if (id) {
      const quiz = await QuizService.getQuizById(id);
      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }

      const response = NextResponse.json({ quiz });
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=600"
      );
      return response;
    }

    if (tutorialId) {
      const quizzes = await QuizService.getQuizzesByTutorialId(tutorialId);
      const response = NextResponse.json({ quizzes });
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=600"
      );
      return response;
    }

    // Paginated listing with optional search
    if (search || rawPage > 0 || rawLimit > 0) {
      const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage || 1);
      const limit = Math.min(
        50,
        Math.max(1, isNaN(rawLimit) ? 9 : rawLimit || 9)
      );
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { tutorial: { title: { contains: search, mode: "insensitive" } } },
        ];
      }

      const [quizzes, total] = await Promise.all([
        prisma.quiz.findMany({
          where,
          include: { tutorial: { select: { title: true, slug: true } } },
          orderBy: { title: "asc" },
          skip,
          take: limit,
        }),
        prisma.quiz.count({ where }),
      ]);

      const response = NextResponse.json({
        quizzes,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=600"
      );
      return response;
    }

    // Default: return all quizzes (unchanged for backward compat)
    const quizzes = await QuizService.getAllQuizzes();
    const response = NextResponse.json({ quizzes });
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=1200"
    );
    return response;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}
