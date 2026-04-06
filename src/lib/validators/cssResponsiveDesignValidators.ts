/**
 * CSS Responsive Design — Exercise Validators
 * Steps for the css-responsive-design tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const cssResponsiveDesignValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Media Query Basics ────────────────────────────────────

  "css-responsive-design-step-01": {
    "has-base-bg": (_html, css): boolean => {
      return /\.card\s*\{[^}]*background(-color)?\s*:/i.test(css);
    },
    "has-media-query": (_html, css): boolean => {
      return /@media\s*[^{]*min-width\s*:\s*768px/i.test(css);
    },
    "has-query-bg": (_html, css): boolean => {
      // A background declaration inside a @media block
      return /@media[^{]*\{[^}]*\.card\s*\{[^}]*background(-color)?\s*:/is.test(
        css
      );
    },
  },

  // ── Step 2: Common Breakpoints ────────────────────────────────────

  "css-responsive-design-step-02": {
    "has-grid": (_html, css): boolean => {
      return /display\s*:\s*grid/i.test(css);
    },
    "has-480-bp": (_html, css): boolean => {
      return /@media[^{]*min-width\s*:\s*480px/i.test(css);
    },
    "has-768-bp": (_html, css): boolean => {
      return /@media[^{]*min-width\s*:\s*768px/i.test(css);
    },
  },

  // ── Step 3: Fluid Typography ──────────────────────────────────────

  "css-responsive-design-step-03": {
    "has-clamp-title": (_html, css): boolean => {
      return /\.title\s*\{[^}]*font-size\s*:\s*clamp\s*\(/is.test(css);
    },
    "has-clamp-text": (_html, css): boolean => {
      return /\.text\s*\{[^}]*font-size\s*:\s*clamp\s*\(/is.test(css);
    },
    "has-vw-unit": (_html, css): boolean => {
      return /clamp\s*\([^)]*\d+vw[^)]*\)/i.test(css);
    },
  },

  // ── Step 4: Responsive Images ─────────────────────────────────────

  "css-responsive-design-step-04": {
    "has-aspect-ratio": (_html, css): boolean => {
      return /aspect-ratio\s*:/i.test(css);
    },
    "has-grid": (_html, css): boolean => {
      return /display\s*:\s*grid/i.test(css);
    },
    "has-breakpoint": (_html, css): boolean => {
      return /@media[^{]*min-width\s*:\s*600px/i.test(css);
    },
  },

  // ── Step 5: Container Queries ─────────────────────────────────────

  "css-responsive-design-step-05": {
    "has-container-type": (_html, css): boolean => {
      return /container-type\s*:\s*inline-size/i.test(css);
    },
    "has-container-query": (_html, css): boolean => {
      return /@container\s*\(/i.test(css);
    },
    "has-query-style": (_html, css): boolean => {
      // Something inside the @container block
      return /@container\s*\([^)]*\)\s*\{[^}]*background/is.test(css);
    },
  },

  // ── Step 6: Responsive Navigation ─────────────────────────────────

  "css-responsive-design-step-06": {
    "has-flex-nav": (_html, css): boolean => {
      return /\.nav\s*\{[^}]*display\s*:\s*flex/is.test(css);
    },
    "has-max-width-query": (_html, css): boolean => {
      return /@media[^{]*max-width\s*:\s*600px/i.test(css);
    },
    "has-column-direction": (_html, css): boolean => {
      return /flex-direction\s*:\s*column/i.test(css);
    },
  },

  // ── Step 7: Preference Queries ────────────────────────────────────

  "css-responsive-design-step-07": {
    "has-dark-mode": (_html, css): boolean => {
      return /@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/i.test(css);
    },
    "has-reduced-motion": (_html, css): boolean => {
      return /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i.test(
        css
      );
    },
    "has-base-styles": (_html, css): boolean => {
      return /\.box\s*\{[^}]*background/is.test(css);
    },
  },

  // ── Step 8: Responsive Grid Layout ────────────────────────────────

  "css-responsive-design-step-08": {
    "has-auto-fit": (_html, css): boolean => {
      return /auto-fit|auto-fill/i.test(css);
    },
    "has-minmax": (_html, css): boolean => {
      return /minmax\s*\(/i.test(css);
    },
    "has-grid": (_html, css): boolean => {
      return /display\s*:\s*grid/i.test(css);
    },
  },

  // ── Step 9: Mobile-First Utilities ────────────────────────────────

  "css-responsive-design-step-09": {
    "has-min-height": (_html, css): boolean => {
      return /min-height\s*:\s*44px/i.test(css);
    },
    "has-rem": (_html, css): boolean => {
      return /\d+\.?\d*rem/i.test(css);
    },
    "has-clamp": (_html, css): boolean => {
      return /clamp\s*\(/i.test(css);
    },
  },

  // ── Step 10: Responsive Challenge ─────────────────────────────────

  "css-responsive-design-step-10": {
    "has-clamp": (_html, css): boolean => {
      return /clamp\s*\(/i.test(css);
    },
    "has-auto-fit": (_html, css): boolean => {
      return /auto-fit|auto-fill/i.test(css);
    },
    "has-dark-mode": (_html, css): boolean => {
      return /@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/i.test(css);
    },
    "has-minmax": (_html, css): boolean => {
      return /minmax\s*\(/i.test(css);
    },
  },
};
