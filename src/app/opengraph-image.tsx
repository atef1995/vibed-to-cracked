import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Vibed to Cracked - Learn Programming at Your Own Pace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#0a0a0a",
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
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
          }}
        >
          ⚡
        </div>
        <span
          style={{
            fontSize: "36px",
            fontWeight: "700",
            color: "#ffffff",
            letterSpacing: "-0.5px",
          }}
        >
          Vibed to Cracked
        </span>
      </div>
      <p
        style={{
          fontSize: "24px",
          color: "#a1a1aa",
          textAlign: "center",
          maxWidth: "800px",
          margin: "0",
          lineHeight: "1.5",
        }}
      >
        Mood-driven programming. Tutorials, quizzes, and challenges at your own
        pace.
      </p>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "40px",
        }}
      >
        {["Chill", "Rush", "Grind"].map((mood) => (
          <span
            key={mood}
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              border: "1px solid #3f3f46",
              color: "#d4d4d8",
              fontSize: "16px",
            }}
          >
            {mood}
          </span>
        ))}
      </div>
    </div>,
    { ...size }
  );
}
