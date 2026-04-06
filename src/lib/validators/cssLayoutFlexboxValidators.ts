/**
 * CSS Layout Flexbox — Exercise Validators
 * Steps for the css-layout-flexbox tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const cssLayoutFlexboxValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Activating Flexbox ────────────────────────────────────

  "css-layout-flexbox-step-01": {
    "display-flex": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("flex")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".toolbar");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "flex";
    },
    "has-gap": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("8px")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".toolbar");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).gap === "8px";
    },
    "has-bg": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".toolbar");
      if (!el) return false;
      return (
        iframeWindow.getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)"
      );
    },
  },

  // ── Step 2: Flex Direction ────────────────────────────────────────

  "css-layout-flexbox-step-02": {
    "is-flex": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".sidebar");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "flex";
    },
    "is-column": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("column")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".sidebar");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).flexDirection === "column";
    },
    "has-gap": (html, css): boolean => {
      return /\.sidebar\s*\{[^}]*gap\s*:/s.test(css);
    },
  },

  // ── Step 3: Justify Content ───────────────────────────────────────

  "css-layout-flexbox-step-03": {
    "is-flex": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".header");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "flex";
    },
    "space-between": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("space-between")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".header");
      if (!el) return false;
      return (
        iframeWindow.getComputedStyle(el).justifyContent === "space-between"
      );
    },
    "align-center": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("center")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".header");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).alignItems === "center";
    },
  },

  // ── Step 4: Align Items ───────────────────────────────────────────

  "css-layout-flexbox-step-04": {
    "is-flex": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".page");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "flex";
    },
    "justify-center": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".page");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).justifyContent === "center";
    },
    "align-center": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".page");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).alignItems === "center";
    },
  },

  // ── Step 5: Flex Wrap ─────────────────────────────────────────────

  "css-layout-flexbox-step-05": {
    "is-flex": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".tags");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "flex";
    },
    "has-wrap": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("wrap")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".tags");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).flexWrap === "wrap";
    },
    "has-gap": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("8px")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".tags");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).gap === "8px";
    },
  },

  // ── Step 6: The Gap Property ──────────────────────────────────────

  "css-layout-flexbox-step-06": {
    "is-flex": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".button-group");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "flex";
    },
    "gap-12": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("12px")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".button-group");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).gap === "12px";
    },
    "has-bg": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".button-group");
      if (!el) return false;
      return (
        iframeWindow.getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)"
      );
    },
  },

  // ── Step 7: Flex Grow and Shrink ──────────────────────────────────

  "css-layout-flexbox-step-07": {
    "content-grows": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("1")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".content");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).flexGrow === "1";
    },
    "sidebar-width": (html, css): boolean => {
      return /\.sidebar\s*\{[^}]*width\s*:\s*200px/s.test(css);
    },
    "sidebar-no-grow": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".sidebar");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).flexGrow === "0";
    },
  },

  // ── Step 8: Flex Basis and Shorthand ──────────────────────────────

  "css-layout-flexbox-step-08": {
    "sidebar-flex": (html, css): boolean => {
      return /\.sidebar\s*\{[^}]*flex\s*:\s*0\s+0\s+180px/s.test(css);
    },
    "main-flex": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".main");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).flexGrow === "1";
    },
    "aside-flex": (html, css): boolean => {
      return /\.aside\s*\{[^}]*flex\s*:\s*0\s+0\s+150px/s.test(css);
    },
  },

  // ── Step 9: Align Self ────────────────────────────────────────────

  "css-layout-flexbox-step-09": {
    "uses-align-self": (html, css): boolean => {
      return css.includes("align-self");
    },
    "action-end": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".action");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).alignSelf === "flex-end";
    },
    "title-start": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".title");
      if (!el) return false;
      const self = iframeWindow.getComputedStyle(el).alignSelf;
      return self === "auto" || self === "flex-start";
    },
  },

  // ── Step 10: Layout Challenge ─────────────────────────────────────

  "css-layout-flexbox-step-10": {
    "topbar-space-between": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("space-between")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".topbar");
      if (!el) return false;
      return (
        iframeWindow.getComputedStyle(el).justifyContent === "space-between"
      );
    },
    "topbar-centered": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".topbar");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).alignItems === "center";
    },
    "cards-wrap": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("wrap")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".cards");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).flexWrap === "wrap";
    },
    "card-flex": (html, css): boolean => {
      return /\.card\s*\{[^}]*flex\s*:/s.test(css);
    },
  },
};
