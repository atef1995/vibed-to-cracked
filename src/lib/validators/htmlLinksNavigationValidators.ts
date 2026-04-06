/**
 * HTML Links & Navigation — Exercise Validators
 * Steps for the html-links-navigation tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const htmlLinksNavigationValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Basic Link Syntax ─────────────────────────────────────

  "html-links-nav-step-01": {
    "has-three-links": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const links = iframeWindow.document.querySelectorAll("a[href]");
      return links.length >= 3;
    },
    "correct-hrefs": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const links = iframeWindow.document.querySelectorAll("a[href]");
      const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
      return (
        hrefs.includes("about.html") &&
        hrefs.includes("/products") &&
        hrefs.includes("../index.html")
      );
    },
    "correct-text": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const links = iframeWindow.document.querySelectorAll("a[href]");
      const texts = Array.from(links).map((a) =>
        a.textContent?.trim().toLowerCase()
      );
      return (
        texts.some((t) => t?.includes("about")) &&
        texts.some((t) => t?.includes("product")) &&
        texts.some((t) => t?.includes("home"))
      );
    },
  },

  // ── Step 2: External Links ────────────────────────────────────────

  "html-links-nav-step-02": {
    "has-blank-targets": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const blanks =
        iframeWindow.document.querySelectorAll('a[target="_blank"]');
      return blanks.length >= 2;
    },
    "has-rel-noopener": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const links =
        iframeWindow.document.querySelectorAll('a[target="_blank"]');
      return Array.from(links).every((a) => {
        const rel = a.getAttribute("rel") || "";
        return rel.includes("noopener") && rel.includes("noreferrer");
      });
    },
    "correct-external-urls": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const links = iframeWindow.document.querySelectorAll("a[href]");
      const hrefs = Array.from(links).map((a) => a.getAttribute("href") || "");
      return (
        hrefs.some((h) => h.includes("github.com")) &&
        hrefs.some((h) => h.includes("developer.mozilla.org"))
      );
    },
  },

  // ── Step 3: Section Links ─────────────────────────────────────────

  "html-links-nav-step-03": {
    "has-fragment-links": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const links = iframeWindow.document.querySelectorAll('a[href^="#"]');
      if (links.length < 3) return false;
      const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
      return (
        hrefs.includes("#about") &&
        hrefs.includes("#services") &&
        hrefs.includes("#contact")
      );
    },
    "has-matching-sections": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const about = iframeWindow.document.querySelector("section#about");
      const services = iframeWindow.document.querySelector("section#services");
      const contact = iframeWindow.document.querySelector("section#contact");
      return about !== null && services !== null && contact !== null;
    },
    "sections-have-headings": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const sections = iframeWindow.document.querySelectorAll(
        "section#about, section#services, section#contact"
      );
      return Array.from(sections).every((s) => s.querySelector("h2") !== null);
    },
  },

  // ── Step 4: Special Protocol Links ────────────────────────────────

  "html-links-nav-step-04": {
    "has-mailto-link": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector('a[href^="mailto:"]');
      if (!link) return false;
      const href = link.getAttribute("href") || "";
      return href.includes("help@example.com");
    },
    "has-tel-link": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector('a[href^="tel:"]');
      if (!link) return false;
      const href = link.getAttribute("href") || "";
      return href.includes("+18005550100");
    },
    "has-download-link": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector("a[download]");
      if (!link) return false;
      const dlValue = link.getAttribute("download");
      return dlValue === "annual-report.pdf";
    },
  },

  // ── Step 5: Link Attributes ───────────────────────────────────────

  "html-links-nav-step-05": {
    "has-title-and-rel": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector('a[href="docs.html"]');
      if (!link) return false;
      return link.hasAttribute("title") && link.getAttribute("rel") === "help";
    },
    "has-hreflang": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector('a[hreflang="fr"]');
      return link !== null;
    },
    "has-download-attr": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector('a[href="archive.zip"]');
      if (!link) return false;
      return link.hasAttribute("download");
    },
  },

  // ── Step 6: Navigation Patterns ───────────────────────────────────

  "html-links-nav-step-06": {
    "has-labeled-nav": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nav = iframeWindow.document.querySelector("nav[aria-label]");
      return nav !== null;
    },
    "has-nav-list": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll("nav ul li a");
      return items.length >= 4;
    },
    "has-current-page": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const current = iframeWindow.document.querySelector(
        'nav a[aria-current="page"]'
      );
      return current !== null;
    },
  },

  // ── Step 7: Breadcrumbs and Pagination ────────────────────────────

  "html-links-nav-step-07": {
    "has-breadcrumb-nav": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nav = iframeWindow.document.querySelector(
        'nav[aria-label="Breadcrumb"]'
      );
      return nav !== null;
    },
    "has-ordered-list": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll("nav ol li");
      return items.length >= 4;
    },
    "last-item-current": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll("nav ol li");
      if (items.length === 0) return false;
      const last = items[items.length - 1];
      const hasCurrent = last.getAttribute("aria-current") === "page";
      const hasNoLink = last.querySelector("a") === null;
      return hasCurrent && hasNoLink;
    },
  },

  // ── Step 8: Skip Navigation Links ────────────────────────────────

  "html-links-nav-step-08": {
    "has-skip-link": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const firstLink = iframeWindow.document.querySelector("a");
      if (!firstLink) return false;
      return firstLink.getAttribute("href") === "#main-content";
    },
    "has-nav-with-links": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const navLinks = iframeWindow.document.querySelectorAll("nav a");
      return navLinks.length >= 2;
    },
    "has-main-target": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const main = iframeWindow.document.querySelector("main#main-content");
      if (!main) return false;
      return main.querySelector("h1") !== null;
    },
  },

  // ── Step 9: Accessible Link Text ──────────────────────────────────

  "html-links-nav-step-09": {
    "has-descriptive-text": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector('a[href="/pricing"]');
      if (!link) return false;
      const text = (link.textContent || "").trim().toLowerCase();
      return (
        text.length > 5 &&
        !text.includes("click here") &&
        !text.includes("here")
      );
    },
    "has-aria-label": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector('a[href="/docs/api"]');
      if (!link) return false;
      return (
        link.hasAttribute("aria-label") &&
        (link.getAttribute("aria-label") || "").length > 5
      );
    },
    "all-hrefs-correct": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const links = iframeWindow.document.querySelectorAll("a[href]");
      const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
      return (
        hrefs.includes("/pricing") &&
        hrefs.includes("/docs/api") &&
        hrefs.includes("/blog/css-grid")
      );
    },
  },

  // ── Step 10: Build a Complete Navigation ──────────────────────────

  "html-links-nav-step-10": {
    "has-skip-to-content": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const skip = iframeWindow.document.querySelector('a[href="#content"]');
      if (!skip) return false;
      const main = iframeWindow.document.querySelector("main#content");
      return main !== null && main.querySelector("h1") !== null;
    },
    "has-main-nav-structure": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nav = iframeWindow.document.querySelector('nav[aria-label="Main"]');
      if (!nav) return false;
      const items = nav.querySelectorAll("ul li a");
      if (items.length < 3) return false;
      const blogLink = nav.querySelector('a[href="/blog"]');
      return (
        blogLink !== null && blogLink.getAttribute("aria-current") === "page"
      );
    },
    "has-breadcrumb-structure": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nav = iframeWindow.document.querySelector(
        'nav[aria-label="Breadcrumb"]'
      );
      if (!nav) return false;
      const items = nav.querySelectorAll("ol li");
      if (items.length < 3) return false;
      const last = items[items.length - 1];
      return (
        last.getAttribute("aria-current") === "page" &&
        last.querySelector("a") === null
      );
    },
    "has-safe-external-link": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const ghLink = iframeWindow.document.querySelector(
        'a[href="https://github.com"]'
      );
      if (!ghLink) return false;
      const rel = ghLink.getAttribute("rel") || "";
      return (
        ghLink.getAttribute("target") === "_blank" &&
        rel.includes("noopener") &&
        rel.includes("noreferrer")
      );
    },
  },
};
