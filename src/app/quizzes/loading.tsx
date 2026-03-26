import { PageLayout } from "@/components/ui/PageLayout";
import { ContentGrid } from "@/components/ui/ContentGrid";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";

export default function Loading() {
  return (
    <PageLayout
      title="Coding Quizzes"
      subtitle="Test your knowledge across JavaScript, HTML, CSS, DSA, OOP, GitHub and more"
    >
      <ContentGrid columns="3">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </ContentGrid>
    </PageLayout>
  );
}
