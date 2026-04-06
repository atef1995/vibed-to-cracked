/**
 * CSS Positioning & Z-Index — Exercise Validators
 * Steps for the css-positioning-z-index tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const cssPositioningZIndexValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Static Positioning ────────────────────────────────────

  "css-positioning-z-index-step-01": {
    "is-static": (_html, css): boolean => {
      return /position\s*:\s*static/i.test(css);
    },
    "has-top": (_html, css): boolean => {
      return /top\s*:\s*\d+/i.test(css);
    },
    "has-bg": (_html, css, _js, iframeWindow): boolean => {
      if (!css.match(/background(-color)?\s*:/i)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".tag");
      if (!el) return false;
      const bg = iframeWindow.getComputedStyle(el).backgroundColor;
      return bg !== "" && bg !== "rgba(0, 0, 0, 0)";
    },
  },

  // ── Step 2: Relative Positioning ──────────────────────────────────

  "css-positioning-z-index-step-02": {
    "is-relative": (_html, css, _js, iframeWindow): boolean => {
      if (!/position\s*:\s*relative/i.test(css)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".label");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).position === "relative";
    },
    "top-10": (_html, css): boolean => {
      return /top\s*:\s*10px/i.test(css);
    },
    "left-20": (_html, css): boolean => {
      return /left\s*:\s*20px/i.test(css);
    },
  },

  // ── Step 3: Absolute Positioning ──────────────────────────────────

  "css-positioning-z-index-step-03": {
    "is-absolute": (_html, css, _js, iframeWindow): boolean => {
      if (!/position\s*:\s*absolute/i.test(css)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".badge");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).position === "absolute";
    },
    "top-zero": (_html, css): boolean => {
      return /top\s*:\s*0(?:px)?\s*;/i.test(css);
    },
    "right-zero": (_html, css): boolean => {
      return /right\s*:\s*0(?:px)?\s*;/i.test(css);
    },
  },

  // ── Step 4: Fixed Positioning ─────────────────────────────────────

  "css-positioning-z-index-step-04": {
    "is-fixed": (_html, css): boolean => {
      return /position\s*:\s*fixed/i.test(css);
    },
    "bottom-zero": (_html, css): boolean => {
      return /bottom\s*:\s*0(?:px)?\s*;/i.test(css);
    },
    "has-bg": (_html, css, _js, iframeWindow): boolean => {
      if (!css.match(/background(-color)?\s*:/i)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".bottombar");
      if (!el) return false;
      const bg = iframeWindow.getComputedStyle(el).backgroundColor;
      return bg !== "" && bg !== "rgba(0, 0, 0, 0)";
    },
  },

  // ── Step 5: Sticky Positioning ────────────────────────────────────

  "css-positioning-z-index-step-05": {
    "is-sticky": (_html, css): boolean => {
      return /position\s*:\s*sticky/i.test(css);
    },
    "top-zero": (_html, css): boolean => {
      return (
        /\.section-header[^}]*top\s*:\s*0(?:px)?\s*;/is.test(css) ||
        (/position\s*:\s*sticky/i.test(css) &&
          /top\s*:\s*0(?:px)?\s*;/i.test(css))
      );
    },
    "has-bg": (_html, css, _js, iframeWindow): boolean => {
      if (!css.match(/background(-color)?\s*:/i)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".section-header");
      if (!el) return false;
      const bg = iframeWindow.getComputedStyle(el).backgroundColor;
      return bg !== "" && bg !== "rgba(0, 0, 0, 0)";
    },
  },

  // ── Step 6: Z-Index Basics ────────────────────────────────────────

  "css-positioning-z-index-step-06": {
    "front-top": (_html, css): boolean => {
      const match = css.match(/\.front\s*\{[^}]*z-index\s*:\s*(\d+)/i);
      return match !== null && parseInt(match[1], 10) >= 10;
    },
    "middle-mid": (_html, css): boolean => {
      const match = css.match(/\.middle\s*\{[^}]*z-index\s*:\s*(\d+)/i);
      return match !== null && parseInt(match[1], 10) >= 2;
    },
    "back-low": (_html, css): boolean => {
      const match = css.match(/\.back\s*\{[^}]*z-index\s*:\s*(\d+)/i);
      if (!match) return false;
      const frontMatch = css.match(/\.front\s*\{[^}]*z-index\s*:\s*(\d+)/i);
      if (!frontMatch) return false;
      return parseInt(match[1], 10) < parseInt(frontMatch[1], 10);
    },
  },

  // ── Step 7: Stacking Contexts ─────────────────────────────────────

  "css-positioning-z-index-step-07": {
    "low-z1": (_html, css): boolean => {
      return (
        /\.group-low\s*\{[^}]*z-index\s*:\s*1\s*;/is.test(css) ||
        /\.group-low[^{]*\{[^}]*z-index\s*:\s*1/is.test(css)
      );
    },
    "high-z2": (_html, css): boolean => {
      return (
        /\.group-high\s*\{[^}]*z-index\s*:\s*2\s*;/is.test(css) ||
        /\.group-high[^{]*\{[^}]*z-index\s*:\s*2/is.test(css)
      );
    },
    "both-relative": (_html, css): boolean => {
      const hasLowRelative =
        /\.group-low[^{]*\{[^}]*position\s*:\s*relative/is.test(css);
      const hasHighRelative =
        /\.group-high[^{]*\{[^}]*position\s*:\s*relative/is.test(css);
      return hasLowRelative && hasHighRelative;
    },
  },

  // ── Step 8: Building a Tooltip ────────────────────────────────────

  "css-positioning-z-index-step-08": {
    "btn-relative": (_html, css, _js, iframeWindow): boolean => {
      if (!/position\s*:\s*relative/i.test(css)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".btn");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).position === "relative";
    },
    "tip-absolute": (_html, css, _js, iframeWindow): boolean => {
      if (!/position\s*:\s*absolute/i.test(css)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".tooltip");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).position === "absolute";
    },
    "tip-centered": (_html, css): boolean => {
      return /transform\s*:\s*translateX\(\s*-50%\s*\)/i.test(css);
    },
  },

  // ── Step 9: Building an Overlay ───────────────────────────────────

  "css-positioning-z-index-step-09": {
    "is-fixed": (_html, css, _js, iframeWindow): boolean => {
      if (!/position\s*:\s*fixed/i.test(css)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".backdrop");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).position === "fixed";
    },
    "covers-viewport": (_html, css): boolean => {
      return (
        /top\s*:\s*0/i.test(css) &&
        /right\s*:\s*0/i.test(css) &&
        /bottom\s*:\s*0/i.test(css) &&
        /left\s*:\s*0/i.test(css)
      );
    },
    "flex-center": (_html, css): boolean => {
      return (
        /display\s*:\s*flex/i.test(css) &&
        /align-items\s*:\s*center/i.test(css) &&
        /justify-content\s*:\s*center/i.test(css)
      );
    },
  },

  // ── Step 10: Positioning Challenge ────────────────────────────────

  "css-positioning-z-index-step-10": {
    "nav-fixed": (_html, css, _js, iframeWindow): boolean => {
      if (!/position\s*:\s*fixed/i.test(css)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".nav");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).position === "fixed";
    },
    "toc-sticky": (_html, css, _js, iframeWindow): boolean => {
      if (!/position\s*:\s*sticky/i.test(css)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".toc");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).position === "sticky";
    },
    "tag-absolute": (_html, css, _js, iframeWindow): boolean => {
      if (!/position\s*:\s*absolute/i.test(css)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".tag");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).position === "absolute";
    },
    "card-relative": (_html, css, _js, iframeWindow): boolean => {
      if (!/position\s*:\s*relative/i.test(css)) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".card");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).position === "relative";
    },
  },
};
