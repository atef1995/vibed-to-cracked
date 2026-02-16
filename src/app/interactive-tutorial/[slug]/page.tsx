import Button from "@/components/ui/Button";
import Card, { CardAction } from "@/components/ui/Card";
import { PageLayout } from "@/components/ui/PageLayout";
import { BUTTON_COLOR } from "@/types/button";

const InteractiveTutorialPage = () => {
  return (
    <PageLayout>
      <Card
        title="title"
        description="aaa"
        footer={
          <Button color={BUTTON_COLOR.BLUE} onClick={() => {}}>
            next
          </Button>
        }
      >
        <p>enter the code here</p>
      </Card>
    </PageLayout>
  );
};

export default InteractiveTutorialPage;
