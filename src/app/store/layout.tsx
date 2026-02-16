import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store - Vibed to Cracked",
  description:
    "Shop exclusive merchandise and resources to support your web development learning journey on Vibed to Cracked.",
  openGraph: {
    title: "Store - Vibed to Cracked",
    description: "Shop exclusive merchandise and resources for web developers",
    type: "website",
  },
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
