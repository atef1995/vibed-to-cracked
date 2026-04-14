import Link from "next/link";
import {
  Building2,
  Users,
  Code,
  BrainCircuit,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { InterviewPrepService } from "@/lib/services/interviewPrepService";

const COMPANY_GRADIENTS: Record<string, string> = {
  "#FF9900": "from-orange-400 to-orange-600",
  "#4285F4": "from-blue-400 to-blue-600",
  "#0668E1": "from-blue-500 to-blue-700",
  "#A2AAAD": "from-gray-400 to-gray-600",
  "#00A4EF": "from-cyan-400 to-cyan-600",
  "#6772E5": "from-indigo-400 to-indigo-600",
  "#E50914": "from-red-500 to-red-700",
  "#000000": "from-gray-700 to-gray-900",
  "#FF5A5F": "from-rose-400 to-rose-600",
  "#1DB954": "from-green-400 to-green-600",
};

function getGradient(color: string | null) {
  return COMPANY_GRADIENTS[color ?? ""] ?? "from-blue-400 to-blue-600";
}

const TYPE_ICONS: Record<string, typeof Code> = {
  BEHAVIORAL: Users,
  TECHNICAL: Code,
  SYSTEM_DESIGN: BrainCircuit,
};

export default async function InterviewPrepPage() {
  let companies: Array<{
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
    description: string | null;
    interviewStyle: string | null;
    color: string | null;
    questionCount: number;
  }> = [];

  try {
    companies = await InterviewPrepService.getAllCompaniesWithGuides();
  } catch {
    // Graceful fallback — page still renders
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tech Interview Preparation Guides",
    description:
      "Comprehensive interview preparation guides for top technology companies including question walkthroughs, model answers, and scoring rubrics.",
    url: "https://vibed-to-cracked.com/interview-prep",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: companies.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${c.name} Interview Prep`,
        url: `https://vibed-to-cracked.com/interview-prep/${c.slug}`,
      })),
    },
  };

  const breadcrumbLd = {
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
        name: "Interview Prep",
        item: "https://vibed-to-cracked.com/interview-prep",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Tech Interview Prep
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
            Company-specific guides with question walkthroughs, model answers,
            scoring rubrics, and common mistakes. Know exactly what to expect
            before you walk in.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {[
              { icon: Building2, text: `${companies.length} companies` },
              {
                icon: CheckCircle,
                text: `${companies.reduce((s, c) => s + c.questionCount, 0)}+ questions`,
              },
              { icon: Users, text: "Behavioral + Technical + System Design" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SSR nav for SEO crawlers */}
      {companies.length > 0 && (
        <div data-nosnippet className="sr-only">
          <nav aria-label="Interview prep companies">
            <ul>
              {companies.map((c) => (
                <li key={c.slug}>
                  <a href={`/interview-prep/${c.slug}`}>
                    {c.name} Interview Prep — {c.questionCount} questions
                    {c.description && ` — ${c.description}`}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Company Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
          Choose a Company
        </h2>

        {companies.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Interview prep guides are coming soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Link
                key={company.slug}
                href={`/interview-prep/${company.slug}`}
                className="group flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-md overflow-hidden"
              >
                {/* Color bar */}
                <div
                  className={`h-2 bg-linear-to-r ${getGradient(company.color)}`}
                />

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={`${company.name} logo`}
                        className="h-10 w-10 rounded-lg object-contain bg-gray-100 dark:bg-gray-800 p-1"
                        width={40}
                        height={40}
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {company.name}
                    </h3>
                  </div>

                  {company.interviewStyle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {company.interviewStyle}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {company.questionCount} questions
                    </span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Guide
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* What You Get Section — SEO text */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          What Each Guide Includes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: "Culture Breakdown",
              description:
                "Understand what each company values. Learn their leadership principles, interview philosophy, and what interviewers are trained to look for.",
            },
            {
              icon: Code,
              title: "Question Walkthroughs",
              description:
                "Every question comes with a model answer, scoring rubric, common mistakes, follow-up questions, and time guidance.",
            },
            {
              icon: BrainCircuit,
              title: "All Question Types",
              description:
                "Behavioral, technical coding, and system design questions. Each type has its own approach strategies and evaluation criteria.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <Icon className="h-6 w-6 text-blue-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
