"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Download, Lock } from "lucide-react";
import { Plan } from "@/lib/subscriptionConstants";

interface Props {
  id: string;
  isPremium: boolean;
  isLocked: boolean;
  requiredPlan?: string | null;
  fileFormat: string;
}

export default function DownloadButton({
  id,
  isPremium,
  isLocked,
  requiredPlan,
  fileFormat,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    if (
      isPremium &&
      (session.user as { subscription?: string })?.subscription === Plan.FREE
    ) {
      router.push("/pricing");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cheat-sheets/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetId: id }),
      });

      if (!res.ok) throw new Error("Download failed");

      const contentType = res.headers.get("content-type") ?? "";

      if (
        contentType.includes("application/pdf") ||
        contentType.includes("application/octet-stream")
      ) {
        // API returned binary — stream it as a blob download
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `cheat-sheet.${fileFormat.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // API returned a URL (non-PDF formats)
        const data = await res.json();
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLocked) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <Lock className="h-4 w-4 shrink-0" />
          <span>
            This is a {requiredPlan ?? "premium"} sheet.{" "}
            {!session ? "Sign in" : "Upgrade your plan"} to download it.
          </span>
        </div>
        <button
          onClick={() =>
            router.push(!session ? "/api/auth/signin" : "/pricing")
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 text-sm font-medium transition-colors"
        >
          <Lock className="h-4 w-4" />
          {!session ? "Sign in to download" : "Upgrade to download"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-6 py-2.5 text-sm font-medium transition-colors"
    >
      <Download className="h-4 w-4" />
      {loading ? "Downloading..." : `Download ${fileFormat}`}
    </button>
  );
}
