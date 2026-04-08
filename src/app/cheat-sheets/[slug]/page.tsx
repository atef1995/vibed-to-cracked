import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Tag } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plan } from "@/lib/subscriptionConstants";
import DownloadButton from "./DownloadButton";
import PreviewSection from "./PreviewSection";

interface Props {
  params: Promise<{ slug: string }>;
}

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const sheets = await prisma.cheatSheet.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return sheets.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export default async function CheatSheetPage({ params }: Props) {
  const { slug } = await params;

  const [sheet, session] = await Promise.all([
    prisma.cheatSheet.findUnique({ where: { slug, published: true } }),
    getServerSession(authOptions),
  ]);

  if (!sheet) notFound();

  const isLocked =
    sheet.isPremium &&
    (!session ||
      (session.user as { subscription?: string })?.subscription === Plan.FREE);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: sheet.title,
    description: sheet.description,
    url: `https://vibed-to-cracked.com/cheat-sheets/${slug}`,
    dateModified: sheet.updatedAt?.toISOString(),
    proficiencyLevel: sheet.difficulty,
    keywords: sheet.tags.join(", "),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://vibed-to-cracked.com" },
      { "@type": "ListItem", position: 2, name: "Cheat Sheets", item: "https://vibed-to-cracked.com/cheat-sheets" },
      { "@type": "ListItem", position: 3, name: sheet.title, item: `https://vibed-to-cracked.com/cheat-sheets/${slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="max-w-2xl mx-auto">
        <Link
          href="/cheat-sheets"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All Cheat Sheets
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2 shrink-0">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sheet.topic}
                </p>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {sheet.title}
                </h1>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                difficultyColors[sheet.difficulty] ??
                difficultyColors.intermediate
              }`}
            >
              {sheet.difficulty}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {sheet.description}
          </p>

          {sheet.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {sheet.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs text-gray-600 dark:text-gray-400"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {sheet.previewUrl && (
            <PreviewSection
              previewUrl={sheet.previewUrl}
              title={sheet.title}
              isLocked={isLocked}
              requiredPlan={sheet.requiredPlan}
            />
          )}

          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
            <span className="font-medium">{sheet.fileFormat}</span>
            <span>·</span>
            <span>{sheet.fileSize}</span>
            <span>·</span>
            <span>{sheet.category}</span>
          </div>

          <DownloadButton
            id={sheet.id}
            isPremium={sheet.isPremium}
            isLocked={isLocked}
            requiredPlan={sheet.requiredPlan}
            fileFormat={sheet.fileFormat}
          />
        </div>
      </div>
    </div>
  );
}
