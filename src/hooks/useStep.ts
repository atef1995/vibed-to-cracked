"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serialize } from "next-mdx-remote/serialize";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

interface StepNav {
  slug: string;
  title: string;
}

export interface StepData {
  id: string;
  slug: string;
  tutorialId: string;
  order: number;
  title: string;
  description: string | null;
  mdxFile: string | null;
  validationType: string;
  validationConfig: {
    expectedOutput?: string;
    patterns?: {
      regex: string;
      flags?: string;
      message: string;
      shouldMatch: boolean;
    }[];
    hints?: string[];
    initialCode?: string;
    taskInstructions?: string;
  } | null;
  prevStep: StepNav | null;
  nextStep: StepNav | null;
  mdxSource?: MDXRemoteSerializeResult;
  tutorialTitle: string;
  exerciseSlug: string | null;
  progress: {
    status: string;
    passed: boolean;
    attempts: number;
    userCode: string | null;
    completedAt: string | null;
  } | null;
}

export interface ValidationResponse {
  passed: boolean;
  feedback: string;
  outputMatch: boolean | null;
  patternResults: { pattern: string; passed: boolean; message: string }[];
  canAdvance: boolean;
  nextStep: StepNav | null;
}

async function fetchStep(
  tutorialSlug: string,
  stepSlug: string
): Promise<StepData> {
  const res = await fetch(
    `/api/tutorials/${encodeURIComponent(tutorialSlug)}/steps/${encodeURIComponent(stepSlug)}`
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (data.locked) throw new Error("STEP_LOCKED");
    throw new Error(data.error || "Failed to fetch step");
  }

  const data = await res.json();
  const step = data.step;

  // Load MDX content if step has an mdxFile
  let mdxSource: MDXRemoteSerializeResult | undefined;
  if (step.mdxFile) {
    const mdxRes = await fetch(
      `/api/tutorials/mdx?file=${encodeURIComponent(step.mdxFile)}`
    );
    if (mdxRes.ok) {
      const mdxData = await mdxRes.json();
      if (mdxData.success) {
        mdxSource = await serialize(mdxData.data.content, {
          parseFrontmatter: false,
          blockJS: false,
          mdxOptions: {
            remarkPlugins: [],
            rehypePlugins: [],
            development: process.env.NODE_ENV === "development",
          },
        });
      }
    }
  }

  return {
    ...step,
    mdxSource,
    tutorialTitle: data.tutorialTitle,
    exerciseSlug: data.exerciseSlug,
    progress: data.progress,
  };
}

async function validateStepCode(
  tutorialSlug: string,
  stepSlug: string,
  code: string,
  output: string
): Promise<ValidationResponse> {
  const res = await fetch(
    `/api/tutorials/${encodeURIComponent(tutorialSlug)}/steps/${encodeURIComponent(stepSlug)}/validate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, output }),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Validation failed");
  }

  return res.json();
}

export function useStep(tutorialSlug: string, stepSlug: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["tutorial-step", tutorialSlug, stepSlug],
    queryFn: () => fetchStep(tutorialSlug, stepSlug),
    enabled: !!tutorialSlug && !!stepSlug,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message === "STEP_LOCKED") return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });

  const validate = useMutation({
    mutationFn: ({ code, output }: { code: string; output: string }) =>
      validateStepCode(tutorialSlug, stepSlug, code, output),
    onSuccess: (result) => {
      if (result.passed) {
        // Invalidate step data to refresh progress
        queryClient.invalidateQueries({
          queryKey: ["tutorial-step", tutorialSlug, stepSlug],
        });
        // Invalidate the steps list to refresh the stepper
        queryClient.invalidateQueries({
          queryKey: ["tutorial-steps", tutorialSlug],
        });
      }
    },
  });

  return {
    ...query,
    validate,
  };
}

export interface StepListItem {
  id: string;
  slug: string;
  order: number;
  title: string;
  description: string | null;
  validationType: string;
  status: string;
  passed: boolean;
  attempts: number;
  completedAt: string | null;
}

export interface StepListData {
  tutorialId: string;
  tutorialTitle: string;
  exerciseSlug: string | null;
  category: { slug: string; title: string } | null;
  steps: StepListItem[];
}

export function useStepList(tutorialSlug: string) {
  return useQuery({
    queryKey: ["tutorial-steps", tutorialSlug],
    queryFn: async (): Promise<StepListData> => {
      const res = await fetch(
        `/api/tutorials/${encodeURIComponent(tutorialSlug)}/steps`
      );
      if (!res.ok) throw new Error("Failed to fetch steps");
      return res.json();
    },
    enabled: !!tutorialSlug,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
