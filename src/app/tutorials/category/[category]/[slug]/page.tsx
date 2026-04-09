import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TutorialService } from "@/lib/tutorialService";
import TutorialClient from "../../../../../components/tutorial/TutorialClient";
import ErrorBoundary, {
  TutorialErrorFallback,
} from "@/components/ErrorBoundary";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface TutorialPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  // Check for session (but don't require it - allow anonymous browsing)
  const session = await getServerSession(authOptions);

  // Resolve params on server side
  const { category, slug } = await params;

  const tutorial = await TutorialService.getTutorialBySlug(slug);

  return (
    <ErrorBoundary fallback={TutorialErrorFallback}>
      <TutorialClient category={category} slug={slug} isAnonymous={!session} />
      {tutorial && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://vibed-to-cracked.com",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Tutorials",
                  item: "https://vibed-to-cracked.com/tutorials",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: tutorial.category.title,
                  item: `https://vibed-to-cracked.com/tutorials/category/${category}`,
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: tutorial.title,
                  item: `https://vibed-to-cracked.com/tutorials/category/${category}/${slug}`,
                },
              ],
            }),
          }}
        />
      )}
    </ErrorBoundary>
  );
}
