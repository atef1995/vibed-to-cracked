"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Award, Trophy, Filter } from "lucide-react";
import CertificateCard from "@/components/ui/CertificateCard";
import { useMood } from "@/components/providers/MoodProvider";
import getMoodColors from "@/lib/getMoodColors";
import { Certificate } from "@/types/certificate";
import { PageLayout } from "@/components/ui/PageLayout";

export default function CertificatesPage() {
  const { data: session } = useSession();
  const { currentMood } = useMood();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | "ALL">("ALL");

  const fetchCertificates = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "ALL") {
        params.append("type", filter);
      }

      const response = await fetch(`/api/certificates?${params}`);
      const data = await response.json();

      if (data.success) {
        setCertificates(data.data);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  console.log(certificates);

  const moodColors = getMoodColors(currentMood.id);

  const tutorialCertificates = certificates.filter(
    (cert) => cert.type === "TUTORIAL"
  );
  const categoryCertificates = certificates.filter(
    (cert) => cert.type === "CATEGORY"
  );

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sign in to view your certificates
          </h1>
        </div>
      </div>
    );
  }

  return (
    <PageLayout className={`flex flex-col items-center`}>
      <div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`${moodColors.accent} p-4 rounded-full`}>
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            My Certificates
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your learning achievements and completed milestones
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2 w-fit max-w-svw">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Filter:
            </span>
          </div>
          <div className="flex-1 sm:flex space-y-1 gap-2 w-fit max-w-svw">
            {[
              { value: "ALL", label: "All", icon: Award },
              {
                value: "TUTORIAL",
                label: "Tutorials",
                icon: Award,
              },
              {
                value: "CATEGORY",
                label: "Categories",
                icon: Trophy,
              },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFilter(value as string | "ALL")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all w-36 ${
                  filter === value
                    ? `${moodColors.accent} text-white shadow-lg`
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading certificates...
            </p>
          </div>
        )}

        {/* No certificates */}
        {!loading && certificates.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <Award className="h-16 w-16 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No certificates yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Complete tutorials and quizzes to earn your first certificate!
            </p>
          </div>
        )}

        {/* Category Certificates */}
        {!loading &&
          categoryCertificates.length > 0 &&
          (filter === "ALL" || filter === "CATEGORY") && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
                <Trophy className="h-6 w-6" />
                Category Certificates
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({categoryCertificates.length})
                </span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryCertificates.map((certificate) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Tutorial Certificates */}
        {!loading &&
          tutorialCertificates.length > 0 &&
          (filter === "ALL" || filter === "TUTORIAL") && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3 max-w-dvw">
                <Award className="h-6 w-6" />
                Tutorial Certificates
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({tutorialCertificates.length})
                </span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorialCertificates.map((certificate) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                  />
                ))}
              </div>
            </div>
          )}
      </div>
    </PageLayout>
  );
}
