/**
 * Challenge Types
 * Centralized types for challenge-related entities
 */

export interface ChallengeTest {
  id: string;
  input: unknown; // JsonValue from Prisma
  expected: unknown; // JsonValue from Prisma
  description?: string;
}

export interface TestResult {
  passed: boolean;
  description?: string;
  expected: unknown;
  actual: unknown;
  error?: string;
}

export interface MoodAdaptation {
  mood: string;
  content: string;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  isPremium?: boolean;
  requiredPlan?: string;
  estimatedTime?: string | number;
  starter: string;
  solution: string;
  order?: number;
  published?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChallengeWithTests extends Challenge {
  tests: ChallengeTest[];
  moodAdaptations?: MoodAdaptation[];
}
