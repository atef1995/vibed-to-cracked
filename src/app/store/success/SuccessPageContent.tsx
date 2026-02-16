"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Home,
  ShoppingBag,
} from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";
import { useMoodColors } from "@/hooks/useMoodColors";

export default function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moodColors = useMoodColors();

  const [orderDetails, setOrderDetails] = useState<{
    id: string;
    status: string;
    total: number;
    items: Array<{
      id: string;
      productName: string;
      quantity: number;
      price: number;
    }>;
    createdAt: Date;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const sessionId = searchParams.get("session_id");

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(
        `/api/store/checkout/verify?session_id=${sessionId}`
      );

      const data = await response.json();

      if (response.ok) {
        setOrderDetails(data.order);
        setError(null);
        setLoading(false);
      } else if (response.status === 202) {
        // Payment still processing - retry
        console.log("Payment processing, will retry...");
        if (retryCount < 15) {
          // Max 15 retries = 30 seconds
          setRetryCount((prev) => prev + 1);
          setTimeout(fetchOrderDetails, 2000);
        } else {
          setError(
            "Payment verification is taking longer than expected. Please check your email for order confirmation."
          );
          setLoading(false);
        }
      } else {
        // Failed
        console.error("Verification failed:", data);
        setError(data.error || "Failed to verify payment");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Network error. Please refresh the page.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Confirming your order...
          </p>
          {retryCount > 0 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Attempt {retryCount + 1} of 15
            </p>
          )}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto text-center py-12">
        {/* Success Icon */}
        <div className="mb-8">
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
            style={{ backgroundColor: `${moodColors.gradient}20` }}
          >
            <CheckCircle
              className="w-12 h-12"
              style={{ color: moodColors.text }}
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Order Confirmed! 🎉
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Thank you for your purchase
          </p>
        </div>

        {/* Order Info */}
        {orderDetails && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Order #{orderDetails.id.slice(-8)}
              </h2>
            </div>

            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>
                We&apos;ve sent a confirmation email with your order details.
              </p>
              <p>
                You&apos;ll receive a shipping notification once your order is
                on its way.
              </p>
            </div>
          </div>
        )}

        {!orderDetails && sessionId && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 mb-8">
            <p className="text-gray-600 dark:text-gray-300">
              Your order has been confirmed! You&apos;ll receive a confirmation
              email shortly.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <p className="text-red-800 dark:text-red-200 font-medium mb-2">
              Verification Issue
            </p>
            <p className="text-red-700 dark:text-red-300 text-sm mb-4">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                setRetryCount(0);
                fetchOrderDetails();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry Verification
            </button>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            What happens next?
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex gap-3">
              <CheckCircle
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: moodColors.text }}
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Order Confirmation
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You&apos;ll receive an email confirmation shortly
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Package className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Processing
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We&apos;ll prepare your order for shipment
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShoppingBag className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Shipping
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You&apos;ll receive tracking information when shipped
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/store")}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg"
            style={{ backgroundColor: moodColors.gradient, color: "white" }}
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
