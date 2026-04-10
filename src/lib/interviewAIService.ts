import OpenAI from "openai";
import {
  buildInterviewerSystemPrompt,
  buildQuestionPrompt,
  buildFollowUpPrompt,
  buildTransitionPrompt,
  buildIntroPrompt,
  buildClosingPrompt,
  buildEvaluationPrompt,
  buildOverallAssessmentPrompt,
} from "@/lib/interviewPrompts";
import { getScoringWeights } from "@/lib/interviewConstants";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Anthropic SDK is used for evaluation/scoring tasks
// We use the REST API directly to avoid adding the full SDK dependency
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not set, falling back to OpenAI for evaluation");
    return callGPT(systemPrompt, userMessage);
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Claude API error:", error);
    // Fallback to OpenAI
    return callGPT(systemPrompt, userMessage);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
}

async function callGPT(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "";
}

function parseJSON<T>(text: string): T | null {
  // Extract JSON from potential markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    console.error("Failed to parse AI response as JSON:", jsonStr.slice(0, 200));
    return null;
  }
}

interface RoundEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestion: string;
  criteriaScores: Record<string, number>;
}

interface OverallAssessment {
  overallScore: number;
  hiringRecommendation: string;
  categoryScores: Record<string, number>;
  topStrengths: string[];
  areasToImprove: string[];
  detailedFeedback: string;
}

export class InterviewAIService {
  /**
   * Generate interviewer dialogue (intros, transitions, closings) — uses GPT-4o-mini (cheap, fast)
   */
  static async generateIntro(
    companySlug: string,
    companyName: string,
    interviewStyle: string,
    mood: string,
    candidateName: string,
    interviewType: string,
    questionCount: number
  ): Promise<string> {
    const systemPrompt = buildInterviewerSystemPrompt(
      companySlug,
      mood,
      companyName,
      interviewStyle
    );
    const userPrompt = buildIntroPrompt(
      companyName,
      candidateName,
      interviewType,
      questionCount
    );
    return callGPT(systemPrompt, userPrompt);
  }

  /**
   * Generate how the interviewer asks a question — uses GPT-4o-mini
   */
  static async generateQuestionDelivery(
    companySlug: string,
    companyName: string,
    interviewStyle: string,
    mood: string,
    questionText: string,
    questionType: string,
    starterCode?: string | null
  ): Promise<string> {
    const systemPrompt = buildInterviewerSystemPrompt(
      companySlug,
      mood,
      companyName,
      interviewStyle
    );
    const userPrompt = buildQuestionPrompt(
      questionText,
      questionType,
      starterCode
    );
    return callGPT(systemPrompt, userPrompt);
  }

  /**
   * Generate a follow-up question based on the candidate's response — uses GPT-4o-mini
   */
  static async generateFollowUp(
    companySlug: string,
    companyName: string,
    interviewStyle: string,
    mood: string,
    originalQuestion: string,
    userResponse: string,
    followUpSuggestions: string[]
  ): Promise<string> {
    const systemPrompt = buildInterviewerSystemPrompt(
      companySlug,
      mood,
      companyName,
      interviewStyle
    );
    const userPrompt = buildFollowUpPrompt(
      originalQuestion,
      userResponse,
      followUpSuggestions
    );
    return callGPT(systemPrompt, userPrompt);
  }

  /**
   * Generate a transition between questions — uses GPT-4o-mini
   */
  static async generateTransition(
    companySlug: string,
    companyName: string,
    interviewStyle: string,
    mood: string,
    previousQuestion: string,
    nextQuestion: string
  ): Promise<string> {
    const systemPrompt = buildInterviewerSystemPrompt(
      companySlug,
      mood,
      companyName,
      interviewStyle
    );
    const userPrompt = buildTransitionPrompt(previousQuestion, nextQuestion);
    return callGPT(systemPrompt, userPrompt);
  }

  /**
   * Generate closing remarks — uses GPT-4o-mini
   */
  static async generateClosing(
    companySlug: string,
    companyName: string,
    interviewStyle: string,
    mood: string
  ): Promise<string> {
    const systemPrompt = buildInterviewerSystemPrompt(
      companySlug,
      mood,
      companyName,
      interviewStyle
    );
    return callGPT(systemPrompt, buildClosingPrompt(companyName));
  }

  /**
   * Evaluate a single response — uses Claude Sonnet 4 (superior judgment)
   */
  static async evaluateResponse(
    question: string,
    response: string,
    evaluationCriteria: Record<string, string>,
    questionType: string,
    responseCode?: string
  ): Promise<RoundEvaluation> {
    const systemPrompt =
      "You are a calibrated interview evaluator. Provide honest, specific, and fair assessments. Always respond with valid JSON only.";
    const userPrompt = buildEvaluationPrompt(
      question,
      response,
      evaluationCriteria,
      questionType,
      responseCode
    );

    const result = await callClaude(systemPrompt, userPrompt);
    const parsed = parseJSON<RoundEvaluation>(result);

    if (!parsed) {
      return {
        score: 5,
        strengths: ["Response was provided"],
        weaknesses: ["Could not fully evaluate the response"],
        suggestion: "Try to be more specific and structured in your answers.",
        criteriaScores: Object.fromEntries(
          Object.keys(evaluationCriteria).map((k) => [k, 5])
        ),
      };
    }

    // Clamp score to valid range
    parsed.score = Math.min(10, Math.max(0, parsed.score));

    return parsed;
  }

  /**
   * Generate overall interview assessment — uses Claude Sonnet 4
   */
  static async generateOverallAssessment(
    companySlug: string,
    companyName: string,
    rounds: Array<{
      questionText: string;
      responseText?: string | null;
      responseCode?: string | null;
      score?: number | null;
      feedback?: Record<string, unknown> | null;
    }>
  ): Promise<OverallAssessment> {
    const systemPrompt =
      "You are a senior hiring committee member providing a final interview assessment. Be fair, specific, and calibrated. Always respond with valid JSON only.";
    const userPrompt = buildOverallAssessmentPrompt(companyName, rounds);

    const result = await callClaude(systemPrompt, userPrompt);
    const parsed = parseJSON<OverallAssessment>(result);

    if (!parsed) {
      // Calculate from round scores as fallback
      const scores = rounds
        .map((r) => r.score)
        .filter((s): s is number => s !== null && s !== undefined);
      const avgScore =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 5;

      return {
        overallScore: Math.round(avgScore * 10) / 10,
        hiringRecommendation: avgScore >= 7 ? "Lean Hire" : "Lean No Hire",
        categoryScores: {
          communication: avgScore,
          technicalDepth: avgScore,
          problemSolving: avgScore,
          codeQuality: avgScore,
          culturalFit: avgScore,
        },
        topStrengths: ["Completed the interview"],
        areasToImprove: ["Practice more interview scenarios"],
        detailedFeedback:
          "The assessment could not be fully generated. Please try again.",
      };
    }

    // Apply company-specific scoring weights
    const weights = getScoringWeights(companySlug);
    const weightedScore = Object.entries(weights).reduce((sum, [cat, weight]) => {
      const catScore =
        parsed.categoryScores[cat] ?? parsed.overallScore;
      return sum + catScore * weight;
    }, 0);

    parsed.overallScore = Math.round(weightedScore * 10) / 10;

    return parsed;
  }
}
