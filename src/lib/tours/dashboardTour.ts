import type { Step } from "react-joyride";

export const DASHBOARD_TOUR_ID = "dashboard";

export const dashboardTourSteps: Step[] = [
  {
    target: '[data-tour="mood-selector"]',
    content:
      "Your mood shapes the whole experience. Quiz difficulty, theme colors, and content recommendations all adapt to it. Switch anytime.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: '[data-tour="study-plan"]',
    content:
      "Your personalized roadmap. It maps out phases from fundamentals to advanced topics so you always know what to tackle next.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: '[data-tour="tutorials-section"]',
    content:
      "Interactive lessons that teach one concept at a time. Each one ends with a coding exercise you complete right in the browser.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="exercises-section"]',
    content:
      "Standalone practice tasks. Build real things with HTML, CSS, and JavaScript in sandboxed editors with instant feedback.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="problem-solving"]',
    content:
      "Algorithm and logic challenges. These sharpen your thinking with progressively harder problems.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="quizzes-section"]',
    content:
      "Quick knowledge checks that adapt to your mood — timed in Rush, relaxed in Chill, balanced in Grind.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="projects-section"]',
    content:
      "Capstone projects where you build complete apps. Submit your work for peer reviews and earn project badges.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="mentorship-section"]',
    content:
      "Code reviews from experienced developers. Get async feedback or book a live session on the Cracked plan.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: '[data-tour="explore-more"]',
    content:
      "Quick links to the blog, cheat sheets, contribution system, quiz challenges, and dev tools.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="achievements-section"]',
    content:
      "Your recent unlocks. Complete tutorials, exercises, and challenges to collect achievements and climb the leaderboard.",
    skipBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="progress-section"]',
    content:
      "Your overall stats at a glance. Track completion across tutorials, challenges, and projects from here.",
    skipBeacon: true,
    placement: "top",
  },
];
