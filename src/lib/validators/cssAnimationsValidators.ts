/**
 * CSS Animations — Exercise Validators
 * Steps for the css-animations tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const cssAnimationsValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Keyframes Basics ──────────────────────────────────────

  "css-animations-step-01": {
    "has-keyframes": (_html, css): boolean => {
      return /@keyframes\s+\w+/i.test(css);
    },
    "has-animation-name": (_html, css): boolean => {
      return /animation(-name)?\s*:/i.test(css);
    },
    "has-duration": (_html, css): boolean => {
      return /animation[^;]*\d+\.?\d*(s|ms)/i.test(css);
    },
  },

  // ── Step 2: Percentage Keyframes ──────────────────────────────────

  "css-animations-step-02": {
    "has-percentages": (_html, css): boolean => {
      return /\d+%\s*\{/i.test(css);
    },
    "has-three-stops": (_html, css): boolean => {
      const stops = css.match(/\d+%\s*\{/g);
      return stops !== null && stops.length >= 3;
    },
    "has-animation": (_html, css): boolean => {
      return /animation\s*:/i.test(css);
    },
  },

  // ── Step 3: Animation Shorthand ───────────────────────────────────

  "css-animations-step-03": {
    "has-shorthand": (_html, css): boolean => {
      // animation shorthand (not animation-name, animation-duration, etc.)
      return /animation\s*:[^;]+\d+\.?\d*(s|ms)/i.test(css);
    },
    "has-duration": (_html, css): boolean => {
      return /animation[^;]*\d+\.?\d*(s|ms)/i.test(css);
    },
    "has-keyframes": (_html, css): boolean => {
      return /@keyframes\s+\w+/i.test(css);
    },
  },

  // ── Step 4: Timing and Delay ──────────────────────────────────────

  "css-animations-step-04": {
    "has-keyframes": (_html, css): boolean => {
      return /@keyframes\s+\w+/i.test(css);
    },
    "has-delay": (_html, css): boolean => {
      return /animation-delay\s*:/i.test(css);
    },
    "has-negative-delay": (_html, css): boolean => {
      return /animation-delay\s*:\s*-/i.test(css);
    },
  },

  // ── Step 5: Direction and Fill Mode ───────────────────────────────

  "css-animations-step-05": {
    "has-alternate": (_html, css): boolean => {
      return /alternate/i.test(css);
    },
    "has-fill-mode": (_html, css): boolean => {
      return (
        /animation-fill-mode\s*:/i.test(css) ||
        /animation\s*:[^;]*(forwards|backwards|both)/i.test(css)
      );
    },
    "has-keyframes": (_html, css): boolean => {
      return /@keyframes\s+\w+/i.test(css);
    },
  },

  // ── Step 6: Iteration Count ───────────────────────────────────────

  "css-animations-step-06": {
    "has-infinite": (_html, css): boolean => {
      return /infinite/i.test(css);
    },
    "has-keyframes": (_html, css): boolean => {
      return /@keyframes\s+\w+/i.test(css);
    },
    "has-animation": (_html, css): boolean => {
      return /animation\s*:/i.test(css);
    },
  },

  // ── Step 7: Loading Spinner ───────────────────────────────────────

  "css-animations-step-07": {
    "has-rotate": (_html, css): boolean => {
      return /@keyframes[\s\S]*rotate\s*\(/i.test(css);
    },
    "has-infinite": (_html, css): boolean => {
      return /infinite/i.test(css);
    },
    "has-border": (_html, css): boolean => {
      return /border(-top)?\s*:/i.test(css);
    },
  },

  // ── Step 8: Hover Animations ──────────────────────────────────────

  "css-animations-step-08": {
    "has-hover-animation": (_html, css): boolean => {
      return /:hover\s*\{[^}]*animation\s*:/is.test(css);
    },
    "has-keyframes": (_html, css): boolean => {
      return /@keyframes\s+\w+/i.test(css);
    },
    "has-rotate": (_html, css): boolean => {
      return /@keyframes[\s\S]*rotate\s*\(/i.test(css);
    },
  },

  // ── Step 9: Multiple Animations ───────────────────────────────────

  "css-animations-step-09": {
    "has-two-keyframes": (_html, css): boolean => {
      const matches = css.match(/@keyframes\s+\w+/g);
      return matches !== null && matches.length >= 2;
    },
    "has-multi-animation": (_html, css): boolean => {
      // Comma-separated animation values
      return /animation\s*:[^;]+,\s*[^;]+/i.test(css);
    },
    "has-infinite": (_html, css): boolean => {
      return /infinite/i.test(css);
    },
  },

  // ── Step 10: Animations Challenge ─────────────────────────────────

  "css-animations-step-10": {
    "has-two-keyframes": (_html, css): boolean => {
      const matches = css.match(/@keyframes\s+\w+/g);
      return matches !== null && matches.length >= 2;
    },
    "has-multi-animation": (_html, css): boolean => {
      return /animation\s*:[^;]+,\s*[^;]+/i.test(css);
    },
    "has-fill-mode": (_html, css): boolean => {
      return /animation[^;]*(forwards|backwards|both)/i.test(css);
    },
    "has-delay": (_html, css): boolean => {
      // Second animation has a delay (time value after first animation's time)
      const animLine = css.match(/animation\s*:[^;]+/i);
      if (!animLine) return false;
      // Look for a delay-like pattern: two time values in the second animation
      const parts = animLine[0].split(",");
      if (parts.length < 2) return false;
      const secondAnim = parts[1];
      const times = secondAnim.match(/\d+\.?\d*(s|ms)/g);
      return times !== null && times.length >= 2;
    },
  },
};
