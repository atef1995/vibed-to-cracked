import { PageLayout } from "@/components/ui/PageLayout";
import { ContentGrid } from "@/components/ui/ContentGrid";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";

export default function Loading() {
  return (
    <PageLayout>
      <div className="mb-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 mb-2 animate-pulse" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-80 animate-pulse" />
      </div>
      <ContentGrid>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </ContentGrid>
    </PageLayout>
  );
}
