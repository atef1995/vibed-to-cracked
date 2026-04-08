import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Blog Post - Vibed to Cracked";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "60px",
      }}
    >
      <div
        style={{
          fontSize: 16,
          color: "#3b82f6",
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: 2,
          marginBottom: 16,
        }}
      >
        Blog
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          maxWidth: 900,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 18,
          color: "#3b82f6",
          marginTop: 32,
          fontWeight: 600,
        }}
      >
        vibed-to-cracked.com
      </div>
    </div>,
    { ...size }
  );
}
