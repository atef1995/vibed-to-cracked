import { PageLayout } from "@/components/ui/PageLayout";
import { ContentGrid } from "@/components/ui/ContentGrid";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";

export default function Loading() {
  return (
    <PageLayout
      title="Projects"
      subtitle="Build real applications and get peer feedback"
    >
      <div className="mb-12 rounded-3xl p-8 bg-gray-100 dark:bg-gray-800 animate-pulse">
        <div className="text-center max-w-4xl mx-auto">
          <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto mb-6" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3 mx-auto mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
        </div>
      </div>
      <ContentGrid>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </ContentGrid>
    </PageLayout>
  );
}
