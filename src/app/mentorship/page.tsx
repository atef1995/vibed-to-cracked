import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Plan } from "@/lib/subscriptionConstants";
import { MentorshipHub } from "@/components/mentorship/MentorshipHub";
import { PageLayout } from "@/components/ui/PageLayout";

export const metadata: Metadata = {
  title: "1-on-1 Code Reviews - Vibed to Cracked",
  description:
    "Book weekly 1-on-1 code review sessions with your mentor. Get personalized feedback on your code, architecture decisions, and career growth.",
  openGraph: {
    title: "1-on-1 Code Reviews - Vibed to Cracked",
    description:
      "Weekly code review sessions included with the Cracked plan. Live calls or async written feedback.",
  },
};

export default async function MentorshipPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/mentorship");
  }

  if (session.user.subscription !== Plan.CRACKED) {
    redirect("/pricing?feature=mentorship");
  }

  const calendlyUrl = process.env.CALENDLY_URL || "";

  return (
    <PageLayout
      title="1-on-1 Code Reviews"
      subtitle="Book a live session or submit code for async feedback. Up to 4 sessions per month."
    >
      <MentorshipHub calendlyUrl={calendlyUrl} />
    </PageLayout>
  );
}
