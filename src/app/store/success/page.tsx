import { Suspense } from "react";
import SuccessPageContent from "./SuccessPageContent";
import { PageLayout } from "@/components/ui/PageLayout";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </PageLayout>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
