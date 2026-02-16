import { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/store/products/${slug}`, {
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      const product = data.data?.product;

      if (!product) {
        throw new Error("Product not found in response");
      }

      const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency.toUpperCase(),
        }).format(price);
      };

      const price = formatPrice(product.price, product.currency);

      return {
        title: `${product.name} - ${price} - Vibed to Cracked Store`,
        description: product.description,
        openGraph: {
          title: product.name,
          description: product.description,
          type: "website",
          images:
            product.images && product.images.length > 0
              ? [product.images[0]]
              : [],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Product - Vibed to Cracked Store",
    description: "Shop exclusive products at Vibed to Cracked",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <ProductDetailClient params={resolvedParams} />;
}
