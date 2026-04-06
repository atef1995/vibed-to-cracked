/**
 * HTML Lists & Organization — Exercise Validators
 * Steps for the html-lists-organization tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const htmlListsOrganizationValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Unordered Lists ───────────────────────────────────

  "html-lists-step-01": {
    "has-ul": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("ul") !== null;
    },
    "has-four-items": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll("ul > li");
      return items.length === 4;
    },
    "correct-item-text": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll("ul > li");
      if (items.length < 4) return false;
      const texts = Array.from(items).map((li) =>
        li.textContent?.trim().toLowerCase()
      );
      return (
        texts.includes("html") &&
        texts.includes("css") &&
        texts.includes("javascript") &&
        texts.includes("python")
      );
    },
  },

  // ── Step 2: Ordered Lists ─────────────────────────────────────

  "html-lists-step-02": {
    "has-ol": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("ol") !== null;
    },
    "has-start-and-type": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const ol = iframeWindow.document.querySelector("ol");
      if (!ol) return false;
      return (
        ol.getAttribute("start") === "5" && ol.getAttribute("type") === "A"
      );
    },
    "has-three-items": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll("ol > li");
      if (items.length !== 3) return false;
      const texts = Array.from(items).map((li) =>
        li.textContent?.trim().toLowerCase()
      );
      return (
        texts.includes("design mockups") &&
        texts.includes("write html") &&
        texts.includes("add styling")
      );
    },
  },

  // ── Step 3: Definition Lists ──────────────────────────────────

  "html-lists-step-03": {
    "has-dl": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("dl") !== null;
    },
    "has-three-terms": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const terms = iframeWindow.document.querySelectorAll("dl > dt");
      return terms.length === 3;
    },
    "has-matching-dds": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const dds = iframeWindow.document.querySelectorAll("dl > dd");
      if (dds.length < 3) return false;
      const terms = iframeWindow.document.querySelectorAll("dl > dt");
      if (terms.length < 3) return false;
      const termTexts = Array.from(terms).map((dt) =>
        dt.textContent?.trim().toLowerCase()
      );
      return (
        termTexts.includes("git") &&
        termTexts.includes("repository") &&
        termTexts.includes("commit")
      );
    },
  },

  // ── Step 4: Nested Lists ──────────────────────────────────────

  "html-lists-step-04": {
    "has-top-level-ul": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const allUls = iframeWindow.document.querySelectorAll("ul");
      for (const ul of Array.from(allUls)) {
        if (!ul.parentElement?.closest("ul")) {
          const directLis = Array.from(ul.children).filter(
            (c) => c.tagName === "LI"
          );
          if (directLis.length === 2) return true;
        }
      }
      return false;
    },
    "has-nested-uls": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const topLis = iframeWindow.document.querySelectorAll("ul > li");
      let parentItems = 0;
      for (const li of Array.from(topLis)) {
        if (li.querySelector("ul")) {
          parentItems++;
        }
      }
      return parentItems >= 2;
    },
    "nested-items-correct": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nestedUls = iframeWindow.document.querySelectorAll("ul ul");
      if (nestedUls.length < 2) return false;
      const allNestedText = Array.from(nestedUls).flatMap((ul) =>
        Array.from(ul.querySelectorAll("li")).map((li) =>
          li.textContent?.trim().toLowerCase()
        )
      );
      return (
        allNestedText.includes("apple") &&
        allNestedText.includes("banana") &&
        allNestedText.includes("carrot") &&
        allNestedText.includes("spinach")
      );
    },
  },

  // ── Step 5: Styling Lists with CSS ────────────────────────────

  "html-lists-step-05": {
    "has-three-items": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll("ul li");
      return items.length === 3;
    },
    "bullets-removed": (_html, css, _js, _iframeWindow): boolean => {
      return /list-style\s*:\s*none/.test(css);
    },
    "has-before-pseudo": (_html, css, _js, _iframeWindow): boolean => {
      return /::before/.test(css) && /content\s*:/.test(css);
    },
  },

  // ── Step 6: Navigation with Lists ─────────────────────────────

  "html-lists-step-06": {
    "has-nav-with-label": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nav = iframeWindow.document.querySelector("nav");
      if (!nav) return false;
      const label = nav.getAttribute("aria-label");
      return label !== null && label.trim().length > 0;
    },
    "has-ul-in-nav": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("nav ul") !== null;
    },
    "has-four-nav-links": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const links = iframeWindow.document.querySelectorAll("nav ul a");
      if (links.length !== 4) return false;
      const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
      return (
        hrefs.includes("/") &&
        hrefs.includes("/blog") &&
        hrefs.includes("/projects") &&
        hrefs.includes("/contact")
      );
    },
  },

  // ── Step 7: Accessible Lists ──────────────────────────────────

  "html-lists-step-07": {
    "has-heading-id": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const h3 = iframeWindow.document.querySelector("h3#skills-heading");
      if (!h3) return false;
      return (
        h3.textContent?.trim().toLowerCase().includes("core skills") ?? false
      );
    },
    "has-aria-labelledby": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const ul = iframeWindow.document.querySelector(
        'ul[aria-labelledby="skills-heading"]'
      );
      return ul !== null;
    },
    "correct-skill-items": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const ul = iframeWindow.document.querySelector(
        'ul[aria-labelledby="skills-heading"]'
      );
      if (!ul) return false;
      const items = ul.querySelectorAll("li");
      if (items.length !== 3) return false;
      const texts = Array.from(items).map((li) =>
        li.textContent?.trim().toLowerCase()
      );
      return (
        texts.includes("semantic html") &&
        texts.includes("accessible forms") &&
        texts.includes("keyboard navigation")
      );
    },
  },

  // ── Step 8: Lists Challenge ───────────────────────────────────

  "html-lists-step-08": {
    "has-spec-dl": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const dl = iframeWindow.document.querySelector("dl");
      if (!dl) return false;
      const dts = dl.querySelectorAll("dt");
      const dds = dl.querySelectorAll("dd");
      if (dts.length < 2 || dds.length < 2) return false;
      const termTexts = Array.from(dts).map((dt) =>
        dt.textContent?.trim().toLowerCase()
      );
      return termTexts.includes("version") && termTexts.includes("license");
    },
    "has-feature-ul": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const uls = iframeWindow.document.querySelectorAll("ul");
      for (const ul of Array.from(uls)) {
        const items = ul.querySelectorAll("li");
        const texts = Array.from(items).map((li) =>
          li.textContent?.trim().toLowerCase()
        );
        if (
          texts.includes("offline support") &&
          texts.includes("dark mode") &&
          texts.includes("keyboard shortcuts")
        ) {
          return true;
        }
      }
      return false;
    },
    "has-steps-ol": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const ols = iframeWindow.document.querySelectorAll("ol");
      for (const ol of Array.from(ols)) {
        const items = ol.querySelectorAll("li");
        const texts = Array.from(items).map((li) =>
          li.textContent?.trim().toLowerCase()
        );
        if (
          texts.includes("clone the repository") &&
          texts.includes("install dependencies") &&
          texts.includes("run the dev server")
        ) {
          return true;
        }
      }
      return false;
    },
    "has-three-headings": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const headings = iframeWindow.document.querySelectorAll("h3");
      if (headings.length < 3) return false;
      const texts = Array.from(headings).map((h) =>
        h.textContent?.trim().toLowerCase()
      );
      return (
        texts.includes("specifications") &&
        texts.includes("features") &&
        texts.includes("getting started")
      );
    },
  },
};
