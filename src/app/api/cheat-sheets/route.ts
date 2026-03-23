import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface StringSearchFilter {
  contains: string;
  mode: "insensitive";
}

interface CheatSheetFilter {
  published?: boolean;
  title?: StringSearchFilter;
  description?: StringSearchFilter;
  category?: string;
  difficulty?: string;
  isPremium?: boolean;
  tags?: { hasSome: string[] };
  OR?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const rawPage = parseInt(searchParams.get("page") || "1");
    const rawLimit = parseInt(searchParams.get("limit") || "6");
    const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
    const limit = Math.min(50, Math.max(1, isNaN(rawLimit) ? 6 : rawLimit));
    const isPremium = searchParams.get("isPremium");

    // Build filter object
    const where: CheatSheetFilter = {
      published: true,
    };

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    // Category filter
    if (category && category !== "all") {
      where.category = category;
    }

    // Difficulty filter
    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    // Premium filter
    if (isPremium === "true") {
      where.isPremium = true;
    } else if (isPremium === "false") {
      where.isPremium = false;
    }

    // Get total count
    const total = await prisma.cheatSheet.count({ where });

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch cheat sheets
    const cheatSheets = await prisma.cheatSheet.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isPremium: "desc" }, { order: "asc" }],
    });

    // Fetch all distinct categories for filter dropdown
    const allCategories = await prisma.cheatSheet.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    return NextResponse.json({
      data: cheatSheets,
      categories: allCategories.map((c) => c.category),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching cheat sheets:", error);
    return NextResponse.json(
      { error: "Failed to fetch cheat sheets" },
      { status: 500 }
    );
  }
}
