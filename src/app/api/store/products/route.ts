import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/services/storeService";
import { ProductType } from "@/generated/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filters from query params
    const type = searchParams.get("type") as ProductType | null;
    const published = searchParams.get("published") !== "false"; // Default true
    const inStock = searchParams.get("inStock") !== "false"; // Default true
    const search = searchParams.get("search");

    // Extract pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const filters = {
      type: type || undefined,
      published,
      inStock,
      search: search || undefined,
    };

    const pagination = { page, limit };

    const result = await getProducts(filters, pagination);

    const response = NextResponse.json({
      success: true,
      data: result,
    });

    // Cache for 5 minutes
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch products" },
      },
      { status: 500 }
    );
  }
}
