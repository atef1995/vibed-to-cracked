/**
 * HTML Basics — Exercise Validators
 * Steps for the html-basics tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const htmlBasicsValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Document Structure ────────────────────────────────────
  // Note: ValidatedExercise wraps user HTML inside its own document,
  // so a full HTML skeleton gets nested inside <body>. We must check
  // the raw html string rather than the iframe DOM for this step.

  "html-basics-step-01": {
    "has-html-lang": (html): boolean => {
      return /<html\s[^>]*lang\s*=\s*["'][^"']+["']/i.test(html);
    },
    "has-meta-and-title": (html): boolean => {
      const hasMeta = /<meta\s[^>]*charset\s*=\s*["']?UTF-8["']?/i.test(html);
      const hasTitle = /<title>\s*My Page\s*<\/title>/i.test(html);
      return hasMeta && hasTitle;
    },
    "has-body": (html): boolean => {
      return /<body[\s>]/i.test(html) && /<\/body>/i.test(html);
    },
  },

  // ── Step 2: Headings and Hierarchy ────────────────────────────────

  "html-basics-step-02": {
    "has-h1": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const h1 = iframeWindow.document.querySelector("h1");
      return h1 !== null && h1.textContent?.trim() === "My Website";
    },
    "has-h2": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const h2 = iframeWindow.document.querySelector("h2");
      return h2 !== null && h2.textContent?.trim() === "About";
    },
    "has-h3": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const h3 = iframeWindow.document.querySelector("h3");
      return h3 !== null && h3.textContent?.trim() === "Skills";
    },
  },

  // ── Step 3: Text and Formatting ───────────────────────────────────

  "html-basics-step-03": {
    "has-paragraph": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("p") !== null;
    },
    "has-strong": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const strong = iframeWindow.document.querySelector("strong");
      return (
        strong !== null &&
        strong.textContent?.trim().toLowerCase() === "powerful"
      );
    },
    "has-em": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const em = iframeWindow.document.querySelector("em");
      return em !== null && em.textContent?.trim().toLowerCase() === "flexible";
    },
  },

  // ── Step 4: Lists ─────────────────────────────────────────────────

  "html-basics-step-04": {
    "has-ul": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("ul") !== null;
    },
    "has-three-items": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll("ul > li");
      return items.length === 3;
    },
    "correct-item-text": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll("ul > li");
      if (items.length !== 3) return false;
      const texts = Array.from(items).map((li) => li.textContent?.trim());
      return (
        texts.includes("HTML") &&
        texts.includes("CSS") &&
        texts.includes("JavaScript")
      );
    },
  },

  // ── Step 5: Links and Images ──────────────────────────────────────

  "html-basics-step-05": {
    "has-link": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector(
        'a[href="https://example.com"]'
      );
      return link !== null;
    },
    "link-text": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector(
        'a[href="https://example.com"]'
      );
      return link !== null && link.textContent?.trim() === "Visit Example";
    },
    "has-img": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const img = iframeWindow.document.querySelector('img[src="photo.jpg"]');
      return img !== null;
    },
    "img-alt": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const img = iframeWindow.document.querySelector('img[src="photo.jpg"]');
      return (
        img !== null && img.getAttribute("alt") === "A sunset over the ocean"
      );
    },
  },

  // ── Step 6: Semantic Elements ─────────────────────────────────────

  "html-basics-step-06": {
    "has-header-h1": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const h1 = iframeWindow.document.querySelector("header h1");
      return h1 !== null && h1.textContent?.trim() === "My Site";
    },
    "has-main": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const main = iframeWindow.document.querySelector("main");
      return main !== null && main.textContent?.trim().length > 0;
    },
    "has-footer": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const footer = iframeWindow.document.querySelector("footer");
      return footer !== null && footer.textContent?.trim().length > 0;
    },
  },

  // ── Step 7: HTML Attributes ───────────────────────────────────────

  "html-basics-step-07": {
    "has-div-attrs": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const div = iframeWindow.document.querySelector("div.container#main");
      return div !== null;
    },
    "has-data-attr": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const p = iframeWindow.document.querySelector('p[data-role="intro"]');
      return p !== null;
    },
    "p-text": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const p = iframeWindow.document.querySelector('p[data-role="intro"]');
      return p !== null && p.textContent?.trim() === "Hello world";
    },
  },

  // ── Step 8: Basic Forms ───────────────────────────────────────────

  "html-basics-step-08": {
    "has-form": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("form") !== null;
    },
    "label-connected": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const label = iframeWindow.document.querySelector('label[for="name"]');
      const input = iframeWindow.document.querySelector("input#name");
      return label !== null && input !== null;
    },
    "input-required": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.querySelector(
        "input#name"
      ) as HTMLInputElement | null;
      return input !== null && input.type === "text" && input.required;
    },
  },

  // ── Step 9: Build a Complete Page ─────────────────────────────────

  "html-basics-step-09": {
    "has-header-nav-link": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("header nav a") !== null;
    },
    "has-main-h1": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const h1 = iframeWindow.document.querySelector("main h1");
      return h1 !== null && h1.textContent?.trim() === "Welcome";
    },
    "has-footer-content": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const footer = iframeWindow.document.querySelector("footer");
      return footer !== null && footer.textContent?.trim().length > 0;
    },
    "link-href": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector("header nav a");
      return link !== null && link.getAttribute("href") === "#about";
    },
  },
};
