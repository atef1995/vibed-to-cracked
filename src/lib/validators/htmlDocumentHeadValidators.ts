/**
 * HTML Document Head — Exercise Validators
 * Steps for the html-document-head tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const htmlDocumentHeadValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Head Basics ───────────────────────────────────────

  "html-head-step-01": {
    "has-charset": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const meta = iframeWindow.document.querySelector("meta[charset]");
        if (meta) return true;
      }
      return /meta\s[^>]*charset\s*=\s*["']?UTF-8["']?/i.test(html);
    },
    "has-viewport": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const meta = iframeWindow.document.querySelector(
          'meta[name="viewport"]'
        );
        if (meta && meta.getAttribute("content")) return true;
      }
      return /meta\s[^>]*name\s*=\s*["']viewport["']/i.test(html);
    },
    "has-title": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const title = iframeWindow.document.querySelector("title");
        if (title && title.textContent && title.textContent.trim().length > 0)
          return true;
      }
      return /<title>[^<]+<\/title>/i.test(html);
    },
  },

  // ── Step 2: SEO Meta Tags ────────────────────────────────────

  "html-head-step-02": {
    "has-description": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const meta = iframeWindow.document.querySelector(
          'meta[name="description"]'
        );
        if (meta && meta.getAttribute("content")) return true;
      }
      return /meta\s[^>]*name\s*=\s*["']description["']\s[^>]*content\s*=\s*["'][^"']+["']/i.test(
        html
      );
    },
    "has-robots": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const meta = iframeWindow.document.querySelector('meta[name="robots"]');
        if (meta && meta.getAttribute("content")) return true;
      }
      return /meta\s[^>]*name\s*=\s*["']robots["']/i.test(html);
    },
    "has-canonical": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const link = iframeWindow.document.querySelector(
          'link[rel="canonical"]'
        );
        if (link && link.getAttribute("href")) return true;
      }
      return /link\s[^>]*rel\s*=\s*["']canonical["']/i.test(html);
    },
  },

  // ── Step 3: Open Graph ────────────────────────────────────────

  "html-head-step-03": {
    "has-og-title": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const meta = iframeWindow.document.querySelector(
          'meta[property="og:title"]'
        );
        if (meta && meta.getAttribute("content")) return true;
      }
      return /meta\s[^>]*property\s*=\s*["']og:title["']/i.test(html);
    },
    "has-og-image": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const meta = iframeWindow.document.querySelector(
          'meta[property="og:image"]'
        );
        if (meta && meta.getAttribute("content")) return true;
      }
      return /meta\s[^>]*property\s*=\s*["']og:image["']/i.test(html);
    },
    "has-og-type": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const meta = iframeWindow.document.querySelector(
          'meta[property="og:type"]'
        );
        if (meta && meta.getAttribute("content")) return true;
      }
      return /meta\s[^>]*property\s*=\s*["']og:type["']/i.test(html);
    },
  },

  // ── Step 4: Twitter Cards ────────────────────────────────────

  "html-head-step-04": {
    "has-twitter-card": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const meta = iframeWindow.document.querySelector(
          'meta[name="twitter:card"]'
        );
        if (meta && meta.getAttribute("content")) return true;
      }
      return /meta\s[^>]*name\s*=\s*["']twitter:card["']/i.test(html);
    },
    "has-twitter-title": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const meta = iframeWindow.document.querySelector(
          'meta[name="twitter:title"]'
        );
        if (meta && meta.getAttribute("content")) return true;
      }
      return /meta\s[^>]*name\s*=\s*["']twitter:title["']/i.test(html);
    },
    "has-twitter-image": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const meta = iframeWindow.document.querySelector(
          'meta[name="twitter:image"]'
        );
        if (meta && meta.getAttribute("content")) return true;
      }
      return /meta\s[^>]*name\s*=\s*["']twitter:image["']/i.test(html);
    },
  },

  // ── Step 5: Favicons and Icons ───────────────────────────────

  "html-head-step-05": {
    "has-favicon": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const link = iframeWindow.document.querySelector('link[rel="icon"]');
        if (link && link.getAttribute("href")) return true;
      }
      return /link\s[^>]*rel\s*=\s*["']icon["']/i.test(html);
    },
    "has-apple-icon": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const link = iframeWindow.document.querySelector(
          'link[rel="apple-touch-icon"]'
        );
        if (link && link.getAttribute("href")) return true;
      }
      return /link\s[^>]*rel\s*=\s*["']apple-touch-icon["']/i.test(html);
    },
    "has-theme-color": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const meta = iframeWindow.document.querySelector(
          'meta[name="theme-color"]'
        );
        if (meta && meta.getAttribute("content")) return true;
      }
      return /meta\s[^>]*name\s*=\s*["']theme-color["']/i.test(html);
    },
  },

  // ── Step 6: Resource Hints and Script Loading ────────────────

  "html-head-step-06": {
    "has-preconnect": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const link = iframeWindow.document.querySelector(
          'link[rel="preconnect"]'
        );
        if (link && link.getAttribute("href")) return true;
      }
      return /link\s[^>]*rel\s*=\s*["']preconnect["']/i.test(html);
    },
    "has-preload": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const link = iframeWindow.document.querySelector('link[rel="preload"]');
        if (link && link.getAttribute("as")) return true;
      }
      return /link\s[^>]*rel\s*=\s*["']preload["'][^>]*as\s*=/i.test(html);
    },
    "has-defer-script": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const scripts = iframeWindow.document.querySelectorAll("script[defer]");
        for (const s of Array.from(scripts)) {
          if (s.getAttribute("src")) return true;
        }
      }
      return /<script\s[^>]*defer[^>]*src\s*=|<script\s[^>]*src\s*=[^>]*defer/i.test(
        html
      );
    },
  },

  // ── Step 7: Structured Data ──────────────────────────────────

  "html-head-step-07": {
    "has-ld-json": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const script = iframeWindow.document.querySelector(
          'script[type="application/ld+json"]'
        );
        if (script) return true;
      }
      return /script\s[^>]*type\s*=\s*["']application\/ld\+json["']/i.test(
        html
      );
    },
    "has-schema-context": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const script = iframeWindow.document.querySelector(
          'script[type="application/ld+json"]'
        );
        if (script?.textContent?.includes("schema.org")) return true;
      }
      return html.includes("schema.org");
    },
    "has-schema-type": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        const script = iframeWindow.document.querySelector(
          'script[type="application/ld+json"]'
        );
        if (script?.textContent) {
          try {
            const data = JSON.parse(script.textContent);
            return data["@type"] === "Article";
          } catch {
            return script.textContent.includes('"Article"');
          }
        }
      }
      return /"@type"\s*:\s*"Article"/.test(html);
    },
  },

  // ── Step 8: Head Section Challenge ───────────────────────────

  "html-head-step-08": {
    "has-charset-viewport": (html, _css, _js, iframeWindow): boolean => {
      const hasCharset = iframeWindow
        ? iframeWindow.document.querySelector("meta[charset]") !== null
        : /meta\s[^>]*charset/i.test(html);
      const hasViewport = iframeWindow
        ? iframeWindow.document.querySelector('meta[name="viewport"]') !== null
        : /meta\s[^>]*name\s*=\s*["']viewport["']/i.test(html);
      return hasCharset && hasViewport;
    },
    "has-title-desc": (html, _css, _js, iframeWindow): boolean => {
      const hasTitle = iframeWindow
        ? (iframeWindow.document.querySelector("title")?.textContent?.trim()
            .length ?? 0) > 0
        : /<title>[^<]+<\/title>/i.test(html);
      const hasDesc = iframeWindow
        ? iframeWindow.document.querySelector('meta[name="description"]') !==
          null
        : /meta\s[^>]*name\s*=\s*["']description["']/i.test(html);
      return hasTitle && hasDesc;
    },
    "has-og-tag": (html, _css, _js, iframeWindow): boolean => {
      if (iframeWindow) {
        return (
          iframeWindow.document.querySelector('meta[property^="og:"]') !== null
        );
      }
      return /meta\s[^>]*property\s*=\s*["']og:/i.test(html);
    },
    "has-icon-jsonld": (html, _css, _js, iframeWindow): boolean => {
      const hasFavicon = iframeWindow
        ? iframeWindow.document.querySelector('link[rel="icon"]') !== null
        : /link\s[^>]*rel\s*=\s*["']icon["']/i.test(html);
      const hasJsonLd = iframeWindow
        ? iframeWindow.document.querySelector(
            'script[type="application/ld+json"]'
          ) !== null
        : /script\s[^>]*type\s*=\s*["']application\/ld\+json["']/i.test(html);
      return hasFavicon && hasJsonLd;
    },
  },
};
