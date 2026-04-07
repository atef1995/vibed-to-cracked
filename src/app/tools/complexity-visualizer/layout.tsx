import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Big O Complexity Visualizer — Interactive Charts & Benchmarks | Vibed to Cracked",
  description:
    "Visualize Big O time and space complexity with interactive charts. Compare sorting and searching algorithms, analyze your code, and run real performance benchmarks.",
  keywords:
    "big o notation, time complexity, space complexity, algorithm complexity, complexity visualizer, algorithm comparison, performance benchmark, big o chart, learn algorithms, javascript algorithms",
  openGraph: {
    title: "Big O Complexity Visualizer | Vibed to Cracked",
    description:
      "Interactive charts for Big O notation, side-by-side algorithm comparisons, code analysis, and real performance benchmarks.",
    type: "website",
    url: "https://vibed-to-cracked.com/tools/complexity-visualizer",
    siteName: "Vibed to Cracked",
  },
  twitter: {
    card: "summary_large_image",
    title: "Big O Complexity Visualizer | Vibed to Cracked",
    description:
      "Interactive charts for Big O notation, side-by-side algorithm comparisons, code analysis, and real performance benchmarks.",
  },
  alternates: {
    canonical: "https://vibed-to-cracked.com/tools/complexity-visualizer",
  },
};

export default function ComplexityVisualizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Big O Complexity Visualizer",
    description:
      "Visualize Big O time and space complexity with interactive charts. Compare sorting and searching algorithms, analyze your code, and run real performance benchmarks.",
    url: "https://vibed-to-cracked.com/tools/complexity-visualizer",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "Vibed to Cracked",
      url: "https://vibed-to-cracked.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
