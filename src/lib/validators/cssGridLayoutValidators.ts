/**
 * CSS Grid Layout — Exercise Validators
 * Steps for the css-grid-layout tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const cssGridLayoutValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Creating a Grid ───────────────────────────────────────

  "css-grid-layout-step-01": {
    "is-grid": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("grid")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".gallery");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "grid";
    },
    "two-columns": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("200px")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".gallery");
      if (!el) return false;
      const cols = iframeWindow.getComputedStyle(el).gridTemplateColumns;
      // Should have exactly two tracks
      return cols.split(" ").length === 2;
    },
    "has-gap": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("12px")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".gallery");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).gap === "12px";
    },
  },

  // ── Step 2: The fr Unit and repeat() ──────────────────────────────

  "css-grid-layout-step-02": {
    "is-grid": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".container");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "grid";
    },
    "uses-repeat": (html, css): boolean => {
      return css.includes("repeat") && css.includes("1fr");
    },
    "has-gap": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("16px")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".container");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).gap === "16px";
    },
  },

  // ── Step 3: Grid Gap and Spacing ──────────────────────────────────

  "css-grid-layout-step-03": {
    "is-grid": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".board");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "grid";
    },
    "row-gap": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("20px")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".board");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).rowGap === "20px";
    },
    "col-gap": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("40px")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".board");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).columnGap === "40px";
    },
  },

  // ── Step 4: Placing Items with Grid Lines ─────────────────────────

  "css-grid-layout-step-04": {
    "header-full": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("-1")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".header");
      if (!el) return false;
      const col = iframeWindow.getComputedStyle(el).gridColumnEnd;
      // -1 resolves to the last line; for a 3-col grid that's line 4
      return col === "-1" || col === "4";
    },
    "feature-span": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("span")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".feature");
      if (!el) return false;
      const cols = iframeWindow.getComputedStyle(el).gridColumnEnd;
      return cols === "span 2" || cols === "3";
    },
    "uses-grid-column": (html, css): boolean => {
      const headerMatch = /\.header\s*\{[^}]*grid-column\s*:/s.test(css);
      const featureMatch = /\.feature\s*\{[^}]*grid-column\s*:/s.test(css);
      return headerMatch && featureMatch;
    },
  },

  // ── Step 5: Grid Template Areas ───────────────────────────────────

  "css-grid-layout-step-05": {
    "has-areas": (html, css): boolean => {
      return css.includes("grid-template-areas");
    },
    "banner-spans": (html, css): boolean => {
      // banner should appear twice in one row string
      return /["']banner\s+banner["']/.test(css);
    },
    "areas-assigned": (html, css): boolean => {
      const hasBanner = /\.banner\s*\{[^}]*grid-area\s*:\s*banner/s.test(css);
      const hasSidebar = /\.sidebar\s*\{[^}]*grid-area\s*:\s*sidebar/s.test(
        css
      );
      const hasContent = /\.content\s*\{[^}]*grid-area\s*:\s*content/s.test(
        css
      );
      const hasFooter = /\.footer\s*\{[^}]*grid-area\s*:\s*footer/s.test(css);
      return hasBanner && hasSidebar && hasContent && hasFooter;
    },
  },

  // ── Step 6: Responsive Grids with auto-fit ────────────────────────

  "css-grid-layout-step-06": {
    "is-grid": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".products");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "grid";
    },
    "auto-fit-minmax": (html, css): boolean => {
      return (
        css.includes("auto-fit") &&
        css.includes("minmax") &&
        css.includes("180px")
      );
    },
    "has-gap": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("20px")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".products");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).gap === "20px";
    },
  },

  // ── Step 7: Grid Alignment ────────────────────────────────────────

  "css-grid-layout-step-07": {
    "is-grid": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".grid");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "grid";
    },
    "justify-center": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("justify-items")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".grid");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).justifyItems === "center";
    },
    "align-center": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("align-items")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".grid");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).alignItems === "center";
    },
  },

  // ── Step 8: Overlapping Grid Items ────────────────────────────────

  "css-grid-layout-step-08": {
    "image-spans": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".image");
      if (!el) return false;
      const s = iframeWindow.getComputedStyle(el);
      // Should span at least 2 columns and 2 rows
      const colStart = parseInt(s.gridColumnStart, 10);
      const colEnd = parseInt(s.gridColumnEnd, 10);
      const rowStart = parseInt(s.gridRowStart, 10);
      const rowEnd = parseInt(s.gridRowEnd, 10);
      return colEnd - colStart >= 2 && rowEnd - rowStart >= 2;
    },
    "caption-overlap": (html, css): boolean => {
      // Caption should share column range with image
      return (
        /\.caption\s*\{[^}]*grid-column\s*:/s.test(css) &&
        /\.caption\s*\{[^}]*grid-row\s*:/s.test(css)
      );
    },
    "caption-z": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("z-index")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".caption");
      if (!el) return false;
      return parseInt(iframeWindow.getComputedStyle(el).zIndex, 10) >= 2;
    },
  },

  // ── Step 9: Nested Grids ──────────────────────────────────────────

  "css-grid-layout-step-09": {
    "main-is-grid": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("grid")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".main");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "grid";
    },
    "two-cols": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".main");
      if (!el) return false;
      const cols = iframeWindow.getComputedStyle(el).gridTemplateColumns;
      return cols.split(" ").length === 2;
    },
    "inner-gap": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".main");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).gap === "12px";
    },
  },

  // ── Step 10: Grid Layout Challenge ────────────────────────────────

  "css-grid-layout-step-10": {
    "has-areas": (html, css): boolean => {
      return css.includes("grid-template-areas");
    },
    "articles-grid": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".articles");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "grid";
    },
    "articles-autofit": (html, css): boolean => {
      return (
        css.includes("auto-fit") &&
        css.includes("minmax") &&
        css.includes("150px")
      );
    },
    "areas-assigned": (html, css): boolean => {
      const hasHeader = /\.header\s*\{[^}]*grid-area\s*:\s*header/s.test(css);
      const hasAside = /\.aside\s*\{[^}]*grid-area\s*:\s*aside/s.test(css);
      const hasArticles = /\.articles\s*\{[^}]*grid-area\s*:\s*articles/s.test(
        css
      );
      const hasFooter = /\.footer\s*\{[^}]*grid-area\s*:\s*footer/s.test(css);
      return hasHeader && hasAside && hasArticles && hasFooter;
    },
  },
};
