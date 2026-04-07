import type { Step } from "react-joyride";

export const DASHBOARD_TOUR_ID = "dashboard";

export const dashboardTourSteps: Step[] = [
  {
    target: '[data-tour="mood-selector"]',
    content:
      "This is your mood. It changes how quizzes work, the difficulty, and the whole platform vibe. Switch it anytime.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: '[data-tour="study-plan"]',
    content:
      "Your personalized path. Follow it to stay on track from fundamentals to advanced topics.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: '[data-tour="tutorials-section"]',
    content:
      "Start here. Each tutorial teaches one concept with hands-on coding exercises you complete right in the browser.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="exercises-section"]',
    content:
      "Practice what you learn. Build real things with HTML, CSS, and JavaScript in interactive sandboxes.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="quizzes-section"]',
    content:
      "Test yourself. Quizzes adapt to your mood - harder in Rush, relaxed in Chill.",
    skipBeacon: true,
    placement: "top",
  },
];
