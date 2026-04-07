import type { Step } from "react-joyride";

export const ANONYMOUS_TOUR_ID = "anonymous-dashboard";

export const anonymousDashboardTourSteps: Step[] = [
  {
    target: '[data-tour="anon-mood-selector"]',
    content:
      "Pick a mood to shape your experience. Chill keeps things relaxed, Rush adds time pressure, and Grind balances both.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: '[data-tour="anon-tutorials"]',
    content:
      "Interactive tutorials that teach one concept at a time. Each one has a hands-on coding exercise built in.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="anon-quizzes"]',
    content:
      "Quick knowledge checks that adapt to your mood. Try one for free without signing up.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="anon-cheat-sheets"]',
    content:
      "Reference guides for quick lookups. Great for interviews or when you need a refresher.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="anon-benefits"]',
    content:
      "A free account unlocks progress tracking, a personalized study plan, and mood-adaptive difficulty. No credit card needed.",
    skipBeacon: true,
    placement: "top",
  },
];
