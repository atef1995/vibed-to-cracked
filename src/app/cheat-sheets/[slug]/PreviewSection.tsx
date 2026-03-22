"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import Image from "next/image";

interface Props {
  previewUrl: string;
  isLocked: boolean;
  requiredPlan?: string | null;
}

export default function PreviewSection({
  previewUrl,
  isLocked,
  requiredPlan,
}: Props) {
  const router = useRouter();

  return (
    <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Fixed height container — object-top keeps the top portion always visible */}
      <div className="relative h-105">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image
          src={previewUrl}
          alt="Cheat sheet preview"
          fill
          className="object-cover object-top select-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          priority
        />

        {/* Gradient overlay: transparent at top → card bg colour at ~60% */}
        <div className="absolute inset-x-0 bottom-0 h-70% bg-linear-to-b from-transparent from-0% via-white/70 via-30% to-white to-60% dark:via-gray-900/70 dark:to-gray-900 pointer-events-none" />

        {/* Blur layer over lower portion */}
        <div className="absolute inset-x-0 bottom-0 h-65% backdrop-blur-md" />

        {isLocked ? (
          <div className="absolute inset-x-0 bottom-0 h-65% flex items-center justify-center pb-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg px-6 py-5 flex flex-col items-center gap-3 max-w-xs text-center">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2.5">
                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Full preview locked
                </p>
                {requiredPlan && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Requires {requiredPlan} plan
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push("/pricing")}
                className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-5 py-2 transition-colors"
              >
                Upgrade to unlock
              </button>
            </div>
          </div>
        ) : (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0"
            aria-label="View full preview"
          />
        )}
      </div>
    </div>
  );
}
