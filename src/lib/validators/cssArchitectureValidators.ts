/**
 * CSS Architecture — exercise validators
 * Tutorial slug: css-architecture
 * All checks are CSS-text regex only (no iframeWindow).
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const cssArchitectureValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 01 — Naming Conflicts & Specificity Wars ─────────────────
  "css-architecture-step-01": {
    "header-title-color": (_h, css) =>
      /\.header-title[\s\S]*?color\s*:\s*#e2e8f0/i.test(css),
    "card-title-color": (_h, css) =>
      /\.card-title[\s\S]*?color\s*:\s*#1e293b/i.test(css),
    "no-important": (_h, css) => !/!important/i.test(css),
  },

  // ── Step 02 — BEM Blocks ──────────────────────────────────────────
  "css-architecture-step-02": {
    "alert-block": (_h, css) =>
      /\.alert[\s\S]*?background\s*:\s*#fef2f2/i.test(css) &&
      /\.alert[\s\S]*?border-left\s*:/i.test(css),
    "badge-block": (_h, css) =>
      /\.badge[\s\S]*?display\s*:\s*inline-block/i.test(css) &&
      /\.badge[\s\S]*?border-radius\s*:\s*12px/i.test(css),
    "avatar-block": (_h, css) =>
      /\.avatar[\s\S]*?width\s*:\s*48px/i.test(css) &&
      /\.avatar[\s\S]*?border-radius\s*:\s*50%/i.test(css),
  },

  // ── Step 03 — BEM Elements ────────────────────────────────────────
  "css-architecture-step-03": {
    "profile-avatar": (_h, css) =>
      /\.profile__avatar[\s\S]*?width\s*:\s*56px/i.test(css) &&
      /\.profile__avatar[\s\S]*?border-radius\s*:\s*50%/i.test(css),
    "profile-name": (_h, css) =>
      /\.profile__name[\s\S]*?font-weight\s*:\s*600/i.test(css),
    "profile-role": (_h, css) =>
      /\.profile__role[\s\S]*?color\s*:\s*#64748b/i.test(css),
  },

  // ── Step 04 — BEM Modifiers ───────────────────────────────────────
  "css-architecture-step-04": {
    "tag-success": (_h, css) =>
      /\.tag--success[\s\S]*?background\s*:\s*#dcfce7/i.test(css),
    "tag-warning": (_h, css) =>
      /\.tag--warning[\s\S]*?color\s*:\s*#854d0e/i.test(css),
    "tag-large": (_h, css) =>
      /\.tag--large[\s\S]*?padding\s*:/i.test(css) &&
      /\.tag--large[\s\S]*?font-size\s*:\s*15px/i.test(css),
  },

  // ── Step 05 — SMACSS Base & Layout ────────────────────────────────
  "css-architecture-step-05": {
    "base-h2": (_h, css) => /\bh2\s*\{[^}]*font-size\s*:\s*1\.5rem/i.test(css),
    "layout-container": (_h, css) =>
      /\.l-container[\s\S]*?display\s*:\s*flex/i.test(css),
    "layout-aside": (_h, css) =>
      /\.l-aside[\s\S]*?width\s*:\s*220px/i.test(css),
  },

  // ── Step 06 — SMACSS Module & State ───────────────────────────────
  "css-architecture-step-06": {
    "is-visible": (_h, css) =>
      /\.notification\.is-visible[\s\S]*?opacity\s*:\s*1/i.test(css) ||
      /\.notification\.is-visible\s*\{[^}]*opacity\s*:\s*1/i.test(css),
    "is-warning": (_h, css) =>
      /\.notification\.is-warning[\s\S]*?background\s*:\s*#fef9c3/i.test(css) ||
      /\.notification\.is-warning\s*\{[^}]*background\s*:\s*#fef9c3/i.test(css),
    "is-error": (_h, css) =>
      /\.notification\.is-error[\s\S]*?border-left-color\s*:\s*#ef4444/i.test(
        css
      ) ||
      /\.notification\.is-error\s*\{[^}]*border-left-color\s*:\s*#ef4444/i.test(
        css
      ),
  },

  // ── Step 07 — Component-Based Architecture ────────────────────────
  "css-architecture-step-07": {
    "tooltip-base": (_h, css) =>
      /\.tooltip[\s\S]*?position\s*:\s*relative/i.test(css) &&
      /\.tooltip[\s\S]*?background\s*:\s*#1e293b/i.test(css),
    "tooltip-arrow": (_h, css) =>
      /\.tooltip__arrow[\s\S]*?position\s*:\s*absolute/i.test(css),
    "tooltip-light": (_h, css) =>
      /\.tooltip--light[\s\S]*?background\s*:\s*#f8fafc/i.test(css),
  },

  // ── Step 08 — Design Tokens with Custom Properties ────────────────
  "css-architecture-step-08": {
    "has-clr-primary": (_h, css) =>
      /:root[\s\S]*?--clr-primary\s*:\s*#6366f1/i.test(css),
    "box-uses-primary": (_h, css) =>
      /\.box[\s\S]*?background\s*:\s*var\(\s*--clr-primary/i.test(css),
    "box-uses-space": (_h, css) =>
      /\.box[\s\S]*?padding\s*:\s*var\(\s*--space-4/i.test(css),
  },

  // ── Step 09 — File Organization Patterns ──────────────────────────
  "css-architecture-step-09": {
    "has-accent-token": (_h, css) =>
      /:root[\s\S]*?--clr-accent\s*:\s*#6366f1/i.test(css),
    "chip-uses-token": (_h, css) =>
      /\.chip[\s\S]*?background\s*:\s*var\(\s*--clr-accent/i.test(css),
    "utility-mt": (_h, css) => /\.u-mt[\s\S]*?margin-top\s*:/i.test(css),
  },

  // ── Step 10 — Architecture Challenge ──────────────────────────────
  "css-architecture-step-10": {
    "root-tokens": (_h, css) =>
      /:root[\s\S]*?--clr-primary\s*:\s*#6366f1/i.test(css),
    "bem-element-token": (_h, css) =>
      /\.status-card__title[\s\S]*?color\s*:\s*var\(\s*--clr-primary/i.test(
        css
      ),
    "modifier-success": (_h, css) =>
      /\.status-card--success[\s\S]*?border-left\s*:/i.test(css),
    "state-active": (_h, css) =>
      /\.status-card\.is-active[\s\S]*?box-shadow\s*:/i.test(css) ||
      /\.status-card\.is-active\s*\{[^}]*box-shadow\s*:/i.test(css),
  },
};
