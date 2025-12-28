// Client-safe subscription constants (no server imports)

export const Plan = {
  FREE: "FREE",
  VIBED: "VIBED",
  CRACKED: "CRACKED",
} as const;

export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  TRIAL: "TRIAL",
  INACTIVE: "INACTIVE",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

export type Plan = typeof Plan[keyof typeof Plan];
export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

// Plan configurations
export const PLAN_CONFIGS = {
  [Plan.FREE]: {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    tutorialsPerMonth: 5,
    challengesPerMonth: 3,
    quizzesPerMonth: 2,
    storageGB: 0.5,
    features: [
      "Limited tutorials (5/month)",
      "Limited challenges (3/month)",
      "Limited quizzes (2/month)",
      "0.5GB storage",
    ],
  },
  [Plan.VIBED]: {
    name: "Vibed",
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    tutorialsPerMonth: null, // Unlimited
    challengesPerMonth: null,
    quizzesPerMonth: null,
    storageGB: 10,
    features: [
      "Unlimited tutorials",
      "Unlimited challenges",
      "Unlimited quizzes",
      "10GB storage",
      "Priority support",
      "Ad-free experience",
      "Advanced analytics",
    ],
  },
  [Plan.CRACKED]: {
    name: "Cracked",
    monthlyPrice: 19.99,
    annualPrice: 199.99,
    tutorialsPerMonth: null,
    challengesPerMonth: null,
    quizzesPerMonth: null,
    storageGB: 50,
    features: [
      "All Vibed features",
      "50GB storage",
      "1-on-1 mentoring",
      "Custom learning paths",
      "API access",
      "Team collaboration",
      "Offline access",
    ],
  },
} as const;
