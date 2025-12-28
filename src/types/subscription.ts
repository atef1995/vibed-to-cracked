/**
 * Subscription Types
 * Centralized types for subscription-related entities
 */

// Plan constants
export const Plan = {
  FREE: "FREE",
  VIBED: "VIBED",
  CRACKED: "CRACKED",
} as const;

// Subscription status constants
export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  TRIAL: "TRIAL",
  INACTIVE: "INACTIVE",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

// Payment status constants
export const PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

// Type definitions from constants
export type Plan = (typeof Plan)[keyof typeof Plan];
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * Basic subscription information
 */
export interface SubscriptionInfo {
  id?: string;
  userId?: string;
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  daysLeftInTrial?: number | null;
  subscriptionEndsAt?: Date | string | null;
  stripeSubscriptionId?: string | null;
  canAccessPremium?: boolean;
  isActive?: boolean;
  isTrialActive?: boolean;
  trialEndsAt?: Date | null | undefined;
}


/**
 * Detailed subscription information from service
 */
export interface SubscriptionDetails {
  plan: Plan;
  status: SubscriptionStatus;
  subscriptionEndsAt: Date | null;
  isActive: boolean;
  canAccessPremium: boolean;
  stripeSubscriptionId?: string | null;
  isTrialActive: boolean;
  trialEndsAt: Date | null;
  daysLeftInTrial: number | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * Plan feature limits and capabilities
 */
export interface PlanLimits {
  maxTutorials: number;
  maxChallenges: number;
  hasQuizzes: boolean;
  maxQuizzes?: number;
  hasMoodAdaptation: boolean;
  hasProgressTracking: boolean;
  hasAdvancedFeatures: boolean;
  hasAIPoweredReviews?: boolean;
  hasMentorshipSessions?: boolean;
  hasEarlyAccess?: boolean;
}

/**
 * Plan configuration with pricing and features
 */
export interface PlanConfig {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  tutorialsPerMonth: number | null;
  challengesPerMonth: number | null;
  quizzesPerMonth: number | null;
  storageGB: number;
  features: string[];
}

/**
 * Subscription actions component props
 */
export interface SubscriptionActionsProps {
  subscription: SubscriptionInfo;
  currentPlan: Plan;
  isActive?: boolean;
  cancelling?: boolean;
  reactivating?: boolean;
  onCancel: (reason?: string) => void;
  onReactivate: () => void;
  onUpgrade: (plan: Plan) => void;
  onViewAllPlans: () => void;
}
