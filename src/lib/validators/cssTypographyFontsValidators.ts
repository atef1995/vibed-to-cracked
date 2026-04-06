/**
 * CSS Typography & Fonts — exercise validators
 * Tutorial slug: css-typography-fonts
 * All checks are CSS-text regex only (no iframeWindow).
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const cssTypographyFontsValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 01 — Font Weight & Style ─────────────────────────────────
  "css-typography-fonts-step-01": {
    "title-weight-700": (_h, css) =>
      /\.title[\s\S]*?font-weight\s*:\s*700/i.test(css),
    "title-italic": (_h, css) =>
      /\.title[\s\S]*?font-style\s*:\s*italic/i.test(css),
    "subtitle-small-caps": (_h, css) =>
      /\.subtitle[\s\S]*?font-variant\s*:\s*small-caps/i.test(css),
  },

  // ── Step 02 — Line Height & Spacing ───────────────────────────────
  "css-typography-fonts-step-02": {
    "para-line-height": (_h, css) =>
      /\.paragraph[\s\S]*?line-height\s*:\s*1\.6/i.test(css),
    "para-letter-spacing": (_h, css) =>
      /\.paragraph[\s\S]*?letter-spacing\s*:/i.test(css),
    "heading-letter-spacing": (_h, css) =>
      /\.heading[\s\S]*?letter-spacing\s*:\s*-/i.test(css),
  },

  // ── Step 03 — Font Family Stacks ──────────────────────────────────
  "css-typography-fonts-step-03": {
    "body-sans-serif": (_h, css) =>
      /\.body-text[\s\S]*?font-family\s*:[^;]*sans-serif/i.test(css),
    "code-monospace": (_h, css) =>
      /\.code[\s\S]*?font-family\s*:[^;]*monospace/i.test(css),
    "quote-serif": (_h, css) =>
      /\.quote[\s\S]*?font-family\s*:[^;]*\bserif\b/i.test(css),
  },

  // ── Step 04 — Text Transform & Decoration ─────────────────────────
  "css-typography-fonts-step-04": {
    "label-uppercase": (_h, css) =>
      /\.label[\s\S]*?text-transform\s*:\s*uppercase/i.test(css),
    "link-decoration-color": (_h, css) =>
      /\.link[\s\S]*?text-decoration-color\s*:/i.test(css),
    "link-underline-offset": (_h, css) =>
      /\.link[\s\S]*?text-underline-offset\s*:/i.test(css),
  },

  // ── Step 05 — Type Scale with Variables ───────────────────────────
  "css-typography-fonts-step-05": {
    "has-fs-lg-var": (_h, css) => /--fs-lg\s*:\s*1\.5rem/i.test(css),
    "has-fs-base-var": (_h, css) => /--fs-base\s*:\s*1rem/i.test(css),
    "uses-fs-sm-meta": (_h, css) =>
      /\.meta[\s\S]*?font-size\s*:\s*var\(\s*--fs-sm/i.test(css),
  },

  // ── Step 06 — Heading Hierarchy ───────────────────────────────────
  "css-typography-fonts-step-06": {
    "h1-size": (_h, css) => /\.h1[\s\S]*?font-size\s*:\s*2rem/i.test(css),
    "h2-color": (_h, css) => /\.h2[\s\S]*?color\s*:\s*#818cf8/i.test(css),
    "h3-weight": (_h, css) => /\.h3[\s\S]*?font-weight\s*:\s*600/i.test(css),
  },

  // ── Step 07 — Text Shadow ─────────────────────────────────────────
  "css-typography-fonts-step-07": {
    "glow-shadow": (_h, css) =>
      /\.glow-heading[\s\S]*?text-shadow\s*:/i.test(css),
    "glow-color": (_h, css) =>
      /\.glow-heading[\s\S]*?color\s*:\s*#818cf8/i.test(css),
    "depth-shadow": (_h, css) =>
      /\.depth-heading[\s\S]*?text-shadow\s*:/i.test(css),
  },

  // ── Step 08 — Gradient Text & Stroke ──────────────────────────────
  "css-typography-fonts-step-08": {
    "gradient-clip": (_h, css) =>
      /\.gradient-title[\s\S]*?background-clip\s*:\s*text/i.test(css),
    "gradient-fill-transparent": (_h, css) =>
      /\.gradient-title[\s\S]*?-webkit-text-fill-color\s*:\s*transparent/i.test(
        css
      ),
    "outline-stroke": (_h, css) =>
      /\.outline-title[\s\S]*?-webkit-text-stroke\s*:/i.test(css),
  },

  // ── Step 09 — Responsive Typography ───────────────────────────────
  "css-typography-fonts-step-09": {
    "title-clamp": (_h, css) =>
      /\.title[\s\S]*?font-size\s*:\s*clamp\(/i.test(css),
    "text-clamp": (_h, css) =>
      /\.text[\s\S]*?font-size\s*:\s*clamp\(/i.test(css),
    "text-max-width": (_h, css) =>
      /\.text[\s\S]*?max-width\s*:\s*65ch/i.test(css),
  },

  // ── Step 10 — Typography System Challenge ─────────────────────────
  "css-typography-fonts-step-10": {
    "sys-title-clamp": (_h, css) => /--fs-title\s*:\s*clamp\(/i.test(css),
    "sys-title-gradient": (_h, css) =>
      /\.sys-title[\s\S]*?background-clip\s*:\s*text/i.test(css),
    "sys-body-measure": (_h, css) =>
      /\.sys-body[\s\S]*?max-width\s*:\s*65ch/i.test(css),
    "sys-label-transform": (_h, css) =>
      /\.sys-label[\s\S]*?text-transform\s*:\s*uppercase/i.test(css),
  },
};
