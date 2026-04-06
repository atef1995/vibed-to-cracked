/**
 * CSS Variables (Custom Properties) — exercise validators
 * Tutorial slug: css-variables
 * All checks are CSS-text regex only (no iframeWindow).
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const cssVariablesValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 01 — Declaring & Using Variables ─────────────────────────
  "css-variables-step-01": {
    "has-main-color-var": (_h, css) => /--main-color\s*:\s*#6366f1/i.test(css),
    "has-radius-var": (_h, css) => /--radius\s*:\s*6px/i.test(css),
    "uses-main-color": (_h, css) =>
      /\.card[\s\S]*?background\s*:\s*var\(\s*--main-color/i.test(css),
  },

  // ── Step 02 — Variable Scope & Inheritance ────────────────────────
  "css-variables-step-02": {
    "has-bg-override": (_h, css) => /\.highlight[\s\S]*?--bg\s*:/i.test(css),
    "has-text-override": (_h, css) =>
      /\.highlight[\s\S]*?--text\s*:/i.test(css),
    "bg-value-correct": (_h, css) =>
      /\.highlight[\s\S]*?--bg\s*:\s*#422006/i.test(css),
  },

  // ── Step 03 — Fallback Values ─────────────────────────────────────
  "css-variables-step-03": {
    "has-bg-fallback": (_h, css) => /var\(\s*--card-bg\s*,/i.test(css),
    "has-text-fallback": (_h, css) => /var\(\s*--card-text\s*,/i.test(css),
    "has-nested-fallback": (_h, css) =>
      /var\(\s*--card-radius\s*,\s*var\(/i.test(css),
  },

  // ── Step 04 — calc() with Variables ───────────────────────────────
  "css-variables-step-04": {
    "has-base-var": (_h, css) => /--base\s*:\s*20px/i.test(css),
    "has-calc-padding": (_h, css) =>
      /padding\s*:\s*calc\(\s*var\(\s*--base\s*\)/i.test(css),
    "has-calc-gap": (_h, css) =>
      /gap\s*:\s*calc\(\s*var\(\s*--base\s*\)/i.test(css),
  },

  // ── Step 05 — Color Theming ───────────────────────────────────────
  "css-variables-step-05": {
    "has-primary-var": (_h, css) => /--primary\s*:\s*#8b5cf6/i.test(css),
    "has-success-var": (_h, css) => /--success\s*:\s*#10b981/i.test(css),
    "uses-surface-var": (_h, css) =>
      /\.card[\s\S]*?background\s*:\s*var\(\s*--surface/i.test(css),
  },

  // ── Step 06 — Typography Scale ────────────────────────────────────
  "css-variables-step-06": {
    "has-fs-heading": (_h, css) => /--fs-heading\s*:\s*1\.75rem/i.test(css),
    "has-fw-bold": (_h, css) => /--fw-bold\s*:\s*700/i.test(css),
    "uses-fs-body": (_h, css) =>
      /\.text[\s\S]*?font-size\s*:\s*var\(\s*--fs-body/i.test(css),
  },

  // ── Step 07 — Spacing System ──────────────────────────────────────
  "css-variables-step-07": {
    "has-space-sm": (_h, css) => /--space-sm\s*:\s*8px/i.test(css),
    "has-space-lg": (_h, css) => /--space-lg\s*:\s*32px/i.test(css),
    "uses-space-md-gap": (_h, css) => /gap\s*:\s*var\(\s*--space-md/i.test(css),
  },

  // ── Step 08 — Dark Mode with Variables ────────────────────────────
  "css-variables-step-08": {
    "has-page-bg": (_h, css) => /\.page\s*\{[\s\S]*?--bg\s*:/i.test(css),
    "has-dark-override": (_h, css) => /\.page\.dark[\s\S]*?--bg\s*:/i.test(css),
    "uses-accent-title": (_h, css) =>
      /\.title[\s\S]*?color\s*:\s*var\(\s*--accent/i.test(css),
  },

  // ── Step 09 — Responsive Variable Overrides ───────────────────────
  "css-variables-step-09": {
    "has-columns-var": (_h, css) => /--columns\s*:\s*3/i.test(css),
    "uses-columns-grid": (_h, css) =>
      /repeat\(\s*var\(\s*--columns\s*\)\s*,\s*1fr\s*\)/i.test(css),
    "has-media-override": (_h, css) =>
      /@media[\s\S]*?--columns\s*:\s*1/i.test(css),
  },

  // ── Step 10 — Design System Challenge ─────────────────────────────
  "css-variables-step-10": {
    "has-unit-and-calc": (_h, css) =>
      /--unit\s*:\s*16px/i.test(css) &&
      /--pad\s*:\s*calc\(\s*var\(\s*--unit\s*\)/i.test(css),
    "uses-surface-card": (_h, css) =>
      /\.sys-card[\s\S]*?background\s*:\s*var\(\s*--surface/i.test(css),
    "uses-accent-title-ds": (_h, css) =>
      /\.sys-title[\s\S]*?color\s*:\s*var\(\s*--accent/i.test(css),
    "has-media-unit-override": (_h, css) =>
      /@media[\s\S]*?--unit\s*:\s*12px/i.test(css),
  },
};
