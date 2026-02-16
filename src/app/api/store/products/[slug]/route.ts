import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/services/storeService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let slug: string | undefined;

  try {
    ({ slug } = await params);

    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Product not found" },
        },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: { product },
    });

    // Cache for 5 minutes
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    console.error(`Error fetching product ${slug ?? "unknown"}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch product" },
      },
      { status: 500 }
    );
  }
}
