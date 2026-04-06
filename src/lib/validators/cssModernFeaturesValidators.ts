/**
 * CSS Modern Features — exercise validators
 * Tutorial slug: css-modern-features
 * All checks are CSS-text regex only (no iframeWindow).
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const cssModernFeaturesValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 01 — Container Queries Basics ────────────────────────────
  "css-modern-features-step-01": {
    "container-type": (_h, css) =>
      /\.panel[\s\S]*?container-type\s*:\s*inline-size/i.test(css),
    "at-container-rule": (_h, css) =>
      /@container\s*\(\s*min-width\s*:/i.test(css),
    "card-flex": (_h, css) =>
      /@container[\s\S]*?\.card[\s\S]*?display\s*:\s*flex/i.test(css),
  },

  // ── Step 02 — Responsive Container Cards ──────────────────────────
  "css-modern-features-step-02": {
    "wrapper-container": (_h, css) =>
      /\.wrapper[\s\S]*?container-type\s*:\s*inline-size/i.test(css),
    "container-breakpoint": (_h, css) =>
      /@container\s*\(\s*min-width\s*:\s*300px\s*\)/i.test(css),
    "preview-grid": (_h, css) =>
      /@container[\s\S]*?\.preview[\s\S]*?display\s*:\s*grid/i.test(css),
  },

  // ── Step 03 — Cascade Layers ──────────────────────────────────────
  "css-modern-features-step-03": {
    "layer-order": (_h, css) =>
      /@layer\s+reset\s*,\s*theme\s*,\s*utilities\s*;/i.test(css),
    "reset-layer": (_h, css) =>
      /@layer\s+reset\s*\{[\s\S]*?\bp\b[\s\S]*?margin\s*:\s*0/i.test(css),
    "theme-layer": (_h, css) =>
      /@layer\s+theme\s*\{[\s\S]*?\.card[\s\S]*?background\s*:/i.test(css),
  },

  // ── Step 04 — CSS Nesting ─────────────────────────────────────────
  "css-modern-features-step-04": {
    "nested-title": (_h, css) =>
      /\.alert\s*\{[\s\S]*?\.alert-title\s*\{[\s\S]*?font-weight\s*:\s*600/i.test(
        css
      ),
    "nested-modifier": (_h, css) =>
      /\.alert\s*\{[\s\S]*?&\.alert--danger\s*\{[\s\S]*?background\s*:\s*#fef2f2/i.test(
        css
      ),
    "nested-paragraph": (_h, css) =>
      /\.alert\s*\{[\s\S]*?&\s+p\s*\{[\s\S]*?margin\s*:\s*0/i.test(css),
  },

  // ── Step 05 — The :has() Selector ─────────────────────────────────
  "css-modern-features-step-05": {
    "has-img": (_h, css) =>
      /\.card:has\(\s*img\s*\)[\s\S]*?border\s*:/i.test(css),
    "has-badge": (_h, css) =>
      /\.card:has\(\s*\.badge\s*\)[\s\S]*?padding-top\s*:/i.test(css),
    "has-hover": (_h, css) =>
      /\.list:has\(\s*li:hover\s*\)[\s\S]*?background\s*:/i.test(css),
  },

  // ── Step 06 — Color Mix & Modern Colors ───────────────────────────
  "css-modern-features-step-06": {
    "primary-token": (_h, css) =>
      /:root[\s\S]*?--primary\s*:\s*#3b82f6/i.test(css),
    "card-mix": (_h, css) =>
      /\.card[\s\S]*?background\s*:\s*color-mix\(/i.test(css),
    "accent-mix": (_h, css) =>
      /\.accent[\s\S]*?background\s*:\s*color-mix\(/i.test(css),
  },

  // ── Step 07 — Subgrid Basics ──────────────────────────────────────
  "css-modern-features-step-07": {
    "row-grid": (_h, css) =>
      /\.row[\s\S]*?display\s*:\s*grid/i.test(css) &&
      /\.row[\s\S]*?grid-template-columns\s*:\s*repeat\(\s*3/i.test(css),
    "col-subgrid": (_h, css) =>
      /\.col[\s\S]*?grid-template-rows\s*:\s*subgrid/i.test(css),
    "col-span": (_h, css) => /\.col[\s\S]*?grid-row\s*:\s*span\s+3/i.test(css),
  },

  // ── Step 08 — Feature Queries with @supports ──────────────────────
  "css-modern-features-step-08": {
    "baseline-block": (_h, css) =>
      /\.grid\s*\{[^}]*display\s*:\s*block/i.test(css),
    "supports-grid": (_h, css) =>
      /@supports\s*\(\s*display\s*:\s*grid\s*\)[\s\S]*?\.grid[\s\S]*?display\s*:\s*grid/i.test(
        css
      ),
    "supports-container": (_h, css) =>
      /@supports\s*\(\s*container-type\s*:\s*inline-size\s*\)/i.test(css),
  },

  // ── Step 09 — CSS Containment ─────────────────────────────────────
  "css-modern-features-step-09": {
    "widget-contain": (_h, css) =>
      /\.widget[\s\S]*?contain\s*:\s*layout\s+style\s+paint/i.test(css),
    "offscreen-cv": (_h, css) =>
      /\.offscreen[\s\S]*?content-visibility\s*:\s*auto/i.test(css),
    "isolated-strict": (_h, css) =>
      /\.isolated[\s\S]*?contain\s*:\s*strict/i.test(css),
  },

  // ── Step 10 — Modern Features Challenge ───────────────────────────
  "css-modern-features-step-10": {
    "box-container": (_h, css) =>
      /\.box[\s\S]*?container-type\s*:\s*inline-size/i.test(css),
    "color-mix-bg": (_h, css) =>
      /\.box[\s\S]*?background\s*:\s*color-mix\(/i.test(css),
    "has-icon": (_h, css) => /:has\(\s*\.icon\s*\)/i.test(css),
    "container-flex": (_h, css) =>
      /@container[\s\S]*?\.item[\s\S]*?display\s*:\s*flex/i.test(css),
  },
};
