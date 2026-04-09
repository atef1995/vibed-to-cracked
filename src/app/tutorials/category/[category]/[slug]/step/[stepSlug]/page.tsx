import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StepClient from "@/components/tutorial/StepClient";
import ErrorBoundary, {
  TutorialErrorFallback,
} from "@/components/ErrorBoundary";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface StepPageProps {
  params: Promise<{ category: string; slug: string; stepSlug: string }>;
}

export default async function StepPage({ params }: StepPageProps) {
  const { category, slug, stepSlug } = await params;

  return (
    <ErrorBoundary fallback={TutorialErrorFallback}>
      <StepClient category={category} tutorialSlug={slug} stepSlug={stepSlug} />
    </ErrorBoundary>
  );
}
