/**
 * CSS Transforms & Transitions — Exercise Validators
 * Steps for the css-transforms-transitions tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const cssTransformsTransitionsValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Translate ─────────────────────────────────────────────

  "css-transforms-transitions-step-01": {
    "has-translateX": (_html, css): boolean => {
      return /translateX\s*\(/i.test(css);
    },
    "moves-40px": (_html, css): boolean => {
      return /translateX\s*\(\s*40px\s*\)/i.test(css);
    },
    "has-bg": (_html, css): boolean => {
      return /background(-color)?\s*:/i.test(css);
    },
  },

  // ── Step 2: Rotate and Scale ──────────────────────────────────────

  "css-transforms-transitions-step-02": {
    "has-rotate": (_html, css): boolean => {
      return /rotate\s*\(/i.test(css);
    },
    "has-scale": (_html, css): boolean => {
      return /scale\s*\(/i.test(css);
    },
    "has-bg": (_html, css): boolean => {
      return /background(-color)?\s*:/i.test(css);
    },
  },

  // ── Step 3: Transform Origin ──────────────────────────────────────

  "css-transforms-transitions-step-03": {
    "has-origin": (_html, css): boolean => {
      return /transform-origin\s*:/i.test(css);
    },
    "has-rotate": (_html, css): boolean => {
      return /rotate\s*\(/i.test(css);
    },
    "origin-top": (_html, css): boolean => {
      return /transform-origin\s*:[^;]*top/i.test(css);
    },
  },

  // ── Step 4: Combining Transforms ──────────────────────────────────

  "css-transforms-transitions-step-04": {
    "has-translateY": (_html, css): boolean => {
      return /translateY\s*\(/i.test(css);
    },
    "has-rotate": (_html, css): boolean => {
      return /rotate\s*\(/i.test(css);
    },
    "has-scale": (_html, css): boolean => {
      return /scale\s*\(/i.test(css);
    },
  },

  // ── Step 5: Transition Basics ─────────────────────────────────────

  "css-transforms-transitions-step-05": {
    "has-transition": (_html, css): boolean => {
      return /transition\s*:/i.test(css);
    },
    "hover-transform": (_html, css): boolean => {
      // Check for a :hover rule containing transform
      return (
        /\.btn\s*:hover\s*\{[^}]*transform\s*:/is.test(css) ||
        (/:\s*hover/i.test(css) && /transform\s*:/i.test(css))
      );
    },
    "has-duration": (_html, css): boolean => {
      // Look for a time value like 0.3s or 300ms
      return /transition[^;]*\d+\.?\d*(s|ms)/i.test(css);
    },
  },

  // ── Step 6: Timing Functions ──────────────────────────────────────

  "css-transforms-transitions-step-06": {
    "has-ease-in-out": (_html, css): boolean => {
      return /ease-in-out/i.test(css);
    },
    "has-transition": (_html, css): boolean => {
      return /transition\s*:/i.test(css);
    },
    "hover-transform": (_html, css): boolean => {
      return /:\s*hover\s*\{[^}]*transform\s*:/is.test(css);
    },
  },

  // ── Step 7: Hover Effects ─────────────────────────────────────────

  "css-transforms-transitions-step-07": {
    "has-transition": (_html, css): boolean => {
      // Transition on the base .card, not on :hover
      return /\.card\s*\{[^}]*transition\s*:/is.test(css);
    },
    "hover-translateY": (_html, css): boolean => {
      return /:\s*hover\s*\{[^}]*translateY\s*\(/is.test(css);
    },
    "hover-shadow": (_html, css): boolean => {
      return /:\s*hover\s*\{[^}]*box-shadow\s*:/is.test(css);
    },
  },

  // ── Step 8: 3D Transforms ────────────────────────────────────────

  "css-transforms-transitions-step-08": {
    "has-perspective": (_html, css): boolean => {
      return /perspective\s*:/i.test(css);
    },
    "has-rotateY": (_html, css): boolean => {
      return /rotateY\s*\(/i.test(css);
    },
    "has-transition": (_html, css): boolean => {
      return /transition\s*:/i.test(css);
    },
  },

  // ── Step 9: Animation Performance ─────────────────────────────────

  "css-transforms-transitions-step-09": {
    "gpu-props": (_html, css): boolean => {
      // Transition must reference transform and opacity (GPU-friendly)
      const t = css.match(/transition\s*:[^;]+/i);
      if (!t) return false;
      const val = t[0].toLowerCase();
      return val.includes("transform") && val.includes("opacity");
    },
    "hover-scale": (_html, css): boolean => {
      return /:\s*hover\s*\{[^}]*scale\s*\(/is.test(css);
    },
    "hover-opacity": (_html, css): boolean => {
      return /:\s*hover\s*\{[^}]*opacity\s*:/is.test(css);
    },
  },

  // ── Step 10: Transforms Challenge ─────────────────────────────────

  "css-transforms-transitions-step-10": {
    "card-transition": (_html, css): boolean => {
      return /\.card\s*\{[^}]*transition\s*:/is.test(css);
    },
    "card-hover-lift": (_html, css): boolean => {
      return /\.card\s*:hover\s*\{[^}]*translateY\s*\(/is.test(css);
    },
    "image-transition": (_html, css): boolean => {
      return (
        /\.image\s*\{[^}]*transition\s*:/is.test(css) ||
        /\.image[^{]*\{[^}]*transition\s*:/is.test(css)
      );
    },
    "image-hover-scale": (_html, css): boolean => {
      return (
        /\.card\s*:hover\s+\.image\s*\{[^}]*scale\s*\(/is.test(css) ||
        /\.card:hover\s+\.image\s*\{[^}]*scale\s*\(/is.test(css)
      );
    },
  },
};
