// Interview types
export const InterviewType = {
  BEHAVIORAL: "BEHAVIORAL",
  TECHNICAL: "TECHNICAL",
  MIXED: "MIXED",
} as const;
export type InterviewType = (typeof InterviewType)[keyof typeof InterviewType];

// Interview statuses
export const InterviewStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ABANDONED: "ABANDONED",
} as const;
export type InterviewStatus =
  (typeof InterviewStatus)[keyof typeof InterviewStatus];

// Question types
export const QuestionType = {
  BEHAVIORAL: "BEHAVIORAL",
  TECHNICAL: "TECHNICAL",
  SYSTEM_DESIGN: "SYSTEM_DESIGN",
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

// Difficulty levels
export const Difficulty = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

// Response types
export const ResponseType = {
  TEXT: "TEXT",
  CODE: "CODE",
  VOICE: "VOICE",
} as const;
export type ResponseType = (typeof ResponseType)[keyof typeof ResponseType];

// Credit transaction types
export const CreditTransactionType = {
  PURCHASE: "PURCHASE",
  SUBSCRIPTION: "SUBSCRIPTION",
  DEDUCTION: "DEDUCTION",
  REFUND: "REFUND",
  ADMIN: "ADMIN",
} as const;
export type CreditTransactionType =
  (typeof CreditTransactionType)[keyof typeof CreditTransactionType];

// Score interpretations
export const ScoreInterpretation = {
  0: "Needs Work",
  1: "Needs Work",
  2: "Needs Work",
  3: "Needs Work",
  4: "Getting There",
  5: "Getting There",
  6: "Competitive",
  7: "Competitive",
  8: "Strong Hire",
  9: "Strong Hire",
  10: "Exceptional",
} as const;

export function getScoreLabel(score: number): string {
  const rounded = Math.round(Math.min(10, Math.max(0, score)));
  return ScoreInterpretation[rounded as keyof typeof ScoreInterpretation];
}

// XP awards
export const INTERVIEW_XP = {
  COMPLETED: 50,
  HIGH_SCORE_BONUS: 25,
  HIGH_SCORE_THRESHOLD: 7,
} as const;

// Interview config
export const INTERVIEW_CONFIG = {
  QUESTIONS_PER_SESSION: 5,
  PREVIEW_QUESTIONS: 1,
  PREVIEW_DURATION_SECONDS: 30,
  MAX_RESPONSE_LENGTH: 10000,
  MAX_CODE_LENGTH: 15000,
} as const;

// Scoring weights by company slug
export const COMPANY_SCORING_WEIGHTS: Record<string, Record<string, number>> = {
  amazon: {
    culturalFit: 0.3,
    communication: 0.25,
    technical: 0.25,
    problemSolving: 0.2,
  },
  google: {
    technical: 0.35,
    problemSolving: 0.3,
    communication: 0.2,
    culturalFit: 0.15,
  },
  meta: {
    problemSolving: 0.3,
    technical: 0.3,
    communication: 0.2,
    culturalFit: 0.2,
  },
  default: {
    communication: 0.25,
    technical: 0.25,
    problemSolving: 0.25,
    culturalFit: 0.25,
  },
};

export function getScoringWeights(companySlug: string): Record<string, number> {
  return (
    COMPANY_SCORING_WEIGHTS[companySlug] || COMPANY_SCORING_WEIGHTS.default
  );
}

// Evaluation categories
export const EVALUATION_CATEGORIES = [
  "communication",
  "technicalDepth",
  "problemSolving",
  "codeQuality",
  "culturalFit",
] as const;
export type EvaluationCategory = (typeof EVALUATION_CATEGORIES)[number];

// Interview session states (client-side state machine)
export const SessionState = {
  INTRO: "INTRO",
  QUESTION: "QUESTION",
  RESPONDING: "RESPONDING",
  FOLLOW_UP: "FOLLOW_UP",
  TRANSITION: "TRANSITION",
  CLOSING: "CLOSING",
  SCORING: "SCORING",
} as const;
export type SessionState = (typeof SessionState)[keyof typeof SessionState];
