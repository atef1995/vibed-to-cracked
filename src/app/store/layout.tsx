import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store - Vibed to Cracked",
  description:
    "Shop exclusive merchandise and resources to support your web development learning journey on Vibed to Cracked.",
  openGraph: {
    title: "Store - Vibed to Cracked",
    description: "Shop exclusive merchandise and resources for web developers",
    type: "website",
    url: "/store",
    siteName: "Vibed to Cracked",
  },
  twitter: {
    card: "summary_large_image",
    title: "Store - Vibed to Cracked",
    description: "Shop exclusive merchandise and resources for web developers",
  },
  alternates: {
    canonical: "/store",
  },
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
