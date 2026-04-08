import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Coding Quizzes - Vibed to Cracked";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          fontSize: 72,
          marginBottom: 24,
        }}
      >
        🧠
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#ffffff",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Interactive Quizzes
      </div>
      <div
        style={{
          fontSize: 24,
          color: "#94a3b8",
          textAlign: "center",
          maxWidth: 800,
        }}
      >
        Test your JavaScript, HTML, CSS, DSA and OOP knowledge
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
