/**
 * HTML Responsive Basics — Exercise Validators
 * Steps for the html-responsive-basics tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const htmlResponsiveBasicsValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Viewport Meta Tag ─────────────────────────────────

  "html-responsive-step-01": {
    "has-viewport": (html): boolean =>
      /meta\s[^>]*name\s*=\s*["']viewport["']/i.test(html),

    "has-device-width": (html): boolean =>
      /width\s*=\s*device-width/i.test(html),

    "has-container": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const el = iframeWindow.document.querySelector(".container");
        if (el) return true;
      }
      return /class\s*=\s*["'][^"']*\bcontainer\b/i.test(html);
    },

    "has-h1-and-p": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const container = iframeWindow.document.querySelector(".container");
        if (container) {
          const h1 = container.querySelector("h1");
          const p = container.querySelector("p");
          return h1 !== null && p !== null;
        }
      }
      // Fallback: check that both h1 and p exist somewhere
      return /<h1[\s>]/i.test(html) && /<p[\s>]/i.test(html);
    },
  },

  // ── Step 2: Mobile-First Media Queries ────────────────────────

  "html-responsive-step-02": {
    "has-base-padding": (_html, css): boolean =>
      /\.card\s*\{[^}]*padding\s*:\s*1rem/i.test(css),

    "has-base-bg": (_html, css): boolean =>
      /\.card\s*\{[^}]*background\s*:\s*#f0f0f0/i.test(css),

    "has-media-query": (_html, css): boolean =>
      /@media\s*\(\s*min-width\s*:\s*768px\s*\)/i.test(css),

    "has-mq-padding": (_html, css): boolean => {
      const mqMatch = css.match(
        /@media\s*\(\s*min-width\s*:\s*768px\s*\)\s*\{([\s\S]*)\}/
      );
      if (!mqMatch) return false;
      return /padding\s*:\s*2rem/i.test(mqMatch[1]);
    },
  },

  // ── Step 3: Flexible Layouts with Flexbox ─────────────────────

  "html-responsive-step-03": {
    "has-display-flex": (_html, css): boolean =>
      /\.cards\s*\{[^}]*display\s*:\s*flex/i.test(css),

    "has-flex-column": (_html, css): boolean =>
      /\.cards\s*\{[^}]*flex-direction\s*:\s*column/i.test(css),

    "has-gap": (_html, css): boolean =>
      /\.cards\s*\{[^}]*gap\s*:\s*1rem/i.test(css),

    "has-flex-row-mq": (_html, css): boolean => {
      const mqMatch = css.match(
        /@media\s*\(\s*min-width\s*:\s*768px\s*\)\s*\{([\s\S]*)\}/
      );
      if (!mqMatch) return false;
      return /flex-direction\s*:\s*row/i.test(mqMatch[1]);
    },
  },

  // ── Step 4: Responsive Grid Layouts ───────────────────────────

  "html-responsive-step-04": {
    "has-display-grid": (_html, css): boolean =>
      /\.layout\s*\{[^}]*display\s*:\s*grid/i.test(css),

    "has-grid-areas": (_html, css): boolean =>
      /grid-template-areas\s*:/i.test(css),

    "has-grid-area-assignments": (_html, css): boolean => {
      const hasHeader = /grid-area\s*:\s*header/i.test(css);
      const hasMain = /grid-area\s*:\s*main/i.test(css);
      const hasSidebar = /grid-area\s*:\s*sidebar/i.test(css);
      const hasFooter = /grid-area\s*:\s*footer/i.test(css);
      return hasHeader && hasMain && hasSidebar && hasFooter;
    },

    "has-grid-columns-mq": (_html, css): boolean => {
      const mqMatch = css.match(
        /@media\s*\(\s*min-width\s*:\s*768px\s*\)\s*\{([\s\S]*)\}/
      );
      if (!mqMatch) return false;
      return /grid-template-columns\s*:/i.test(mqMatch[1]);
    },
  },

  // ── Step 5: Responsive Images ─────────────────────────────────

  "html-responsive-step-05": {
    "has-picture": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const pic = iframeWindow.document.querySelector("picture");
        if (pic) return true;
      }
      return /<picture[\s>]/i.test(html);
    },

    "has-source-media": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const source = iframeWindow.document.querySelector(
          "picture source[media]"
        );
        if (source && source.getAttribute("srcset")) return true;
      }
      return /<source\s[^>]*media\s*=\s*["'][^"']+["'][^>]*srcset/i.test(html);
    },

    "has-img-alt": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const img = iframeWindow.document.querySelector("picture img[alt]");
        if (img && img.getAttribute("alt")) return true;
      }
      return /<picture[\s\S]*?<img\s[^>]*alt\s*=\s*["'][^"']+["']/i.test(html);
    },

    "has-img-srcset": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const img = iframeWindow.document.querySelector("picture img[srcset]");
        if (img) return true;
      }
      return /<img\s[^>]*srcset\s*=\s*["'][^"']+["']/i.test(html);
    },
  },

  // ── Step 6: Responsive Typography ─────────────────────────────

  "html-responsive-step-06": {
    "has-h1-clamp": (_html, css): boolean =>
      /h1\s*\{[^}]*font-size\s*:\s*clamp\s*\(/i.test(css),

    "has-p-clamp": (_html, css): boolean =>
      /p\s*\{[^}]*font-size\s*:\s*clamp\s*\(/i.test(css),

    "has-max-width-ch": (_html, css): boolean =>
      /p\s*\{[^}]*max-width\s*:\s*65ch/i.test(css),

    "has-line-height": (_html, css): boolean =>
      /p\s*\{[^}]*line-height\s*:/i.test(css),
  },

  // ── Step 7: Touch-Friendly Design ─────────────────────────────

  "html-responsive-step-07": {
    "has-input-font-size": (_html, css): boolean =>
      /input\s*\{[^}]*font-size\s*:\s*16px/i.test(css),

    "has-input-min-height": (_html, css): boolean =>
      /input\s*\{[^}]*min-height\s*:\s*44px/i.test(css),

    "has-input-padding": (_html, css): boolean =>
      /input\s*\{[^}]*padding\s*:/i.test(css),

    "has-btn-min-height": (_html, css): boolean =>
      /\.btn\s*\{[^}]*min-height\s*:\s*44px/i.test(css),
  },

  // ── Step 8: Responsive Design Challenge ───────────────────────

  "html-responsive-step-08": {
    "has-viewport-meta": (html): boolean =>
      /meta\s[^>]*name\s*=\s*["']viewport["'][^>]*content\s*=\s*["'][^"']*device-width/i.test(
        html
      ),

    "has-page-flex": (_html, css): boolean =>
      /\.page\s*\{[^}]*display\s*:\s*flex/i.test(css) &&
      /\.page\s*\{[^}]*flex-direction\s*:\s*column/i.test(css),

    "has-responsive-image": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const pic = iframeWindow.document.querySelector("picture");
        if (pic) {
          const source = pic.querySelector("source[media]");
          const img = pic.querySelector("img");
          return source !== null && img !== null;
        }
      }
      return (
        /<picture[\s>]/i.test(html) &&
        /<source\s[^>]*media/i.test(html) &&
        /<img\s[^>]*src/i.test(html)
      );
    },

    "has-layout-mq": (_html, css): boolean => {
      const mqMatch = css.match(
        /@media\s*\(\s*min-width\s*:\s*768px\s*\)\s*\{([\s\S]*)\}/
      );
      if (!mqMatch) return false;
      return /flex-direction\s*:\s*row/i.test(mqMatch[1]);
    },

    "has-touch-input": (_html, css): boolean =>
      /input\s*\{[^}]*font-size\s*:\s*16px/i.test(css) &&
      /input\s*\{[^}]*min-height\s*:\s*44px/i.test(css),
  },
};
