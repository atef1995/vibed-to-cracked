"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Coins,
  CreditCard,
  ArrowLeft,
  Check,
  Loader,
  Sparkles,
} from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";

interface CreditPack {
  id: string;
  slug: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface CreditsResponse {
  credits: number;
  packs: CreditPack[];
  history: {
    transactions: Transaction[];
    total: number;
    totalPages: number;
  };
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(price);
}

function CreditsPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const purchased = searchParams.get("purchased");

  const { data, isLoading } = useQuery<CreditsResponse>({
    queryKey: ["interview-credits"],
    queryFn: async () => {
      const res = await fetch("/api/mock-interview/credits");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!session?.user,
  });

  const handlePurchase = async (packSlug: string) => {
    try {
      const res = await fetch("/api/mock-interview/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packSlug }),
      });
      if (!res.ok) throw new Error("Failed to create checkout");
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  if (!session?.user) {
    return (
      <PageLayout
        title="Interview Credits"
        className="flex flex-col items-center"
      >
        <p className="text-gray-500 dark:text-gray-400">
          <Link
            href="/auth/signin"
            className="text-violet-600 dark:text-violet-400 hover:underline"
          >
            Sign in
          </Link>{" "}
          to manage your interview credits.
        </p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Interview Credits"
      subtitle="Purchase credits to unlock full AI mock interviews"
      className="flex flex-col items-center"
    >
      <div className="max-w-4xl w-full">
        <Link
          href="/mock-interview"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Mock Interviews
        </Link>

        {/* Success Banner */}
        {purchased && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-200">
              Credits purchased successfully.
            </p>
          </div>
        )}

        {/* Credit Balance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8 text-center">
          <Coins className="h-10 w-10 text-violet-500 mx-auto mb-3" />
          {isLoading ? (
            <Loader className="h-6 w-6 animate-spin mx-auto text-gray-400" />
          ) : (
            <>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {data?.credits ?? 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                credits available
              </p>
            </>
          )}
        </div>

        {/* CRACKED badge */}
        {session.user.subscription === "CRACKED" && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl">
            <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <p className="text-sm text-violet-800 dark:text-violet-200">
              You get 5 free interview credits every month with your CRACKED
              subscription.
            </p>
          </div>
        )}

        {/* Credit Packs */}
        {data?.packs && data.packs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Buy Credits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.packs.map((pack, i) => (
                <div
                  key={pack.slug}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 transition-all ${
                    i === 1
                      ? "border-violet-500 shadow-lg"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {i === 1 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs px-3 py-0.5 rounded-full font-medium">
                      Best Value
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                    {pack.name}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {formatPrice(pack.price, pack.currency)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {pack.credits} credits (
                    {formatPrice(pack.price / pack.credits, pack.currency)}/ea)
                  </p>
                  <button
                    onClick={() => handlePurchase(pack.slug)}
                    className={`w-full py-2.5 rounded-xl font-medium transition-colors ${
                      i === 1
                        ? "bg-violet-600 hover:bg-violet-700 text-white"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    }`}
                  >
                    <CreditCard className="h-4 w-4 inline mr-1.5" />
                    Buy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History */}
        {data?.history?.transactions &&
          data.history.transactions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Transaction History
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">
                        Date
                      </th>
                      <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </th>
                      <th className="text-right p-4 font-medium text-gray-500 dark:text-gray-400">
                        Credits
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                      >
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-gray-900 dark:text-white">
                          {tx.description}
                        </td>
                        <td
                          className={`p-4 text-right font-medium ${
                            tx.amount > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>
    </PageLayout>
  );
}

export default function CreditsPage() {
  return (
    <Suspense>
      <CreditsPageContent />
    </Suspense>
  );
}
