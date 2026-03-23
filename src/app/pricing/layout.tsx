import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - Vibed to Cracked",
  description:
    "Choose the plan that fits your learning style. Free access to core tutorials, quizzes, and challenges. Upgrade to VIBED or CRACKED for premium content, cheat sheets, and advanced tools.",
  keywords:
    "vibed to cracked pricing, coding platform plans, programming subscription, learn programming free, CRACKED plan, premium coding content",
  openGraph: {
    title: "Pricing - Vibed to Cracked",
    description:
      "Free, VIBED, and CRACKED plans. Pick the level that matches your grind.",
    type: "website",
    url: "/pricing",
    siteName: "Vibed to Cracked",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - Vibed to Cracked",
    description:
      "Free, VIBED, and CRACKED plans. Pick the level that matches your grind.",
  },
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
