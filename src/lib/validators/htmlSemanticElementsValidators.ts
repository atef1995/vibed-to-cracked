/**
 * HTML Semantic Elements — Exercise Validators
 * Steps for the html-semantic-elements tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const htmlSemanticElementsValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Semantic vs Generic Divs ──────────────────────────────

  "html-semantic-elements-step-01": {
    "has-header": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("header") !== null;
    },
    "has-main": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("main") !== null;
    },
    "has-footer": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("footer") !== null;
    },
  },

  // ── Step 2: The Header Element ────────────────────────────────────

  "html-semantic-elements-step-02": {
    "has-page-header": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const header = iframeWindow.document.querySelector("header");
      if (!header) return false;
      const h1 = header.querySelector("h1");
      const nav = header.querySelector("nav");
      return (
        h1 !== null && h1.textContent?.trim() === "Tech Blog" && nav !== null
      );
    },
    "has-nav-links": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nav = iframeWindow.document.querySelector("header nav");
      if (!nav) return false;
      const links = nav.querySelectorAll("a");
      if (links.length < 2) return false;
      const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
      return hrefs.includes("/") && hrefs.includes("/articles");
    },
    "has-article-header": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const article = iframeWindow.document.querySelector("article");
      if (!article) return false;
      const articleHeader = article.querySelector("header");
      if (!articleHeader) return false;
      const h2 = articleHeader.querySelector("h2");
      const p = articleHeader.querySelector("p");
      return (
        h2 !== null &&
        h2.textContent?.trim() === "First Post" &&
        p !== null &&
        (p.textContent || "").toLowerCase().includes("alex")
      );
    },
  },

  // ── Step 3: Navigation with Nav ───────────────────────────────────

  "html-semantic-elements-step-03": {
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
    "has-three-nav-links": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const links = iframeWindow.document.querySelectorAll("nav a");
      if (links.length < 3) return false;
      const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
      return (
        hrefs.includes("/") &&
        hrefs.includes("/about") &&
        hrefs.includes("/contact")
      );
    },
  },

  // ── Step 4: Main and Footer ───────────────────────────────────────

  "html-semantic-elements-step-04": {
    "has-main-with-h1": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const main = iframeWindow.document.querySelector("main");
      if (!main) return false;
      const h1 = main.querySelector("h1");
      return h1 !== null && h1.textContent?.trim() === "Welcome";
    },
    "has-footer": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const footer = iframeWindow.document.querySelector("footer");
      if (!footer) return false;
      return (footer.textContent || "").includes("Copyright 2024");
    },
    "has-address-in-footer": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const footer = iframeWindow.document.querySelector("footer");
      if (!footer) return false;
      const address = footer.querySelector("address");
      return (
        address !== null &&
        (address.textContent || "").includes("contact@example.com")
      );
    },
    "main-footer-siblings": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const main = iframeWindow.document.querySelector("main");
      const footer = iframeWindow.document.querySelector("footer");
      if (!main || !footer) return false;
      // Footer should not be inside main
      return main.querySelector("footer") === null;
    },
  },

  // ── Step 5: Grouping with Section ─────────────────────────────────

  "html-semantic-elements-step-05": {
    "has-two-sections": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const main = iframeWindow.document.querySelector("main");
      if (!main) return false;
      const sections = main.querySelectorAll("section");
      return sections.length >= 2;
    },
    "first-section-heading": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const sections = iframeWindow.document.querySelectorAll("main section");
      if (sections.length < 1) return false;
      const h2 = sections[0].querySelector("h2");
      return h2 !== null && h2.textContent?.trim() === "About Us";
    },
    "second-section-list": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const sections = iframeWindow.document.querySelectorAll("main section");
      if (sections.length < 2) return false;
      const h2 = sections[1].querySelector("h2");
      const list = sections[1].querySelector("ul");
      if (!h2 || !list) return false;
      const items = list.querySelectorAll("li");
      return h2.textContent?.trim() === "Our Services" && items.length >= 2;
    },
  },

  // ── Step 6: Self-Contained Articles ───────────────────────────────

  "html-semantic-elements-step-06": {
    "has-article": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("article") !== null;
    },
    "article-has-header": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const article = iframeWindow.document.querySelector("article");
      if (!article) return false;
      const header = article.querySelector("header");
      if (!header) return false;
      const h2 = header.querySelector("h2");
      const p = header.querySelector("p");
      return (
        h2 !== null &&
        h2.textContent?.trim() === "My First Post" &&
        p !== null &&
        (p.textContent || "").toLowerCase().includes("alex")
      );
    },
    "article-has-footer": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const article = iframeWindow.document.querySelector("article");
      if (!article) return false;
      const footer = article.querySelector("footer");
      if (!footer) return false;
      return (
        (footer.textContent || "").includes("Tags") &&
        (footer.textContent || "").includes("HTML") &&
        (footer.textContent || "").includes("CSS")
      );
    },
  },

  // ── Step 7: Supplementary Aside ───────────────────────────────────

  "html-semantic-elements-step-07": {
    "has-aside-in-article": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("article aside") !== null;
    },
    "aside-has-heading": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const aside = iframeWindow.document.querySelector("article aside");
      if (!aside) return false;
      const h3 = aside.querySelector("h3");
      return h3 !== null && h3.textContent?.trim() === "Related Links";
    },
    "aside-has-links": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const aside = iframeWindow.document.querySelector("article aside");
      if (!aside) return false;
      const links = aside.querySelectorAll("a");
      return links.length >= 2;
    },
  },

  // ── Step 8: Time and Address Elements ─────────────────────────────

  "html-semantic-elements-step-08": {
    "has-time-element": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const time = iframeWindow.document.querySelector("time");
      return time !== null && time.hasAttribute("datetime");
    },
    "time-has-datetime": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const time = iframeWindow.document.querySelector("time");
      if (!time) return false;
      const dt = time.getAttribute("datetime");
      return dt !== null && dt.includes("2024-06-20");
    },
    "has-address-with-link": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const address = iframeWindow.document.querySelector("address");
      if (!address) return false;
      const link = address.querySelector("a");
      if (!link) return false;
      const href = link.getAttribute("href") || "";
      return href.startsWith("mailto:");
    },
  },

  // ── Step 9: Common Semantic Mistakes ──────────────────────────────

  "html-semantic-elements-step-09": {
    "div-replaced-with-nav": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nav = iframeWindow.document.querySelector("header nav");
      if (!nav) return false;
      // Should not have a div with class "nav" anymore
      const divNav = iframeWindow.document.querySelector("div.nav");
      return divNav === null;
    },
    "section-has-h2": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const section = iframeWindow.document.querySelector("section");
      if (!section) return false;
      return section.querySelector("h2") !== null;
    },
    "correct-heading-hierarchy": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const h1 = iframeWindow.document.querySelector("h1");
      const h2 = iframeWindow.document.querySelector("section h2");
      const h3 = iframeWindow.document.querySelector("section h3");
      // Should not have h4 anymore
      const h4 = iframeWindow.document.querySelector("h4");
      return h1 !== null && h2 !== null && h3 !== null && h4 === null;
    },
  },

  // ── Step 10: Build a Semantic Page ────────────────────────────────

  "html-semantic-elements-step-10": {
    "has-page-structure": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const doc = iframeWindow.document;
      const header = doc.querySelector("header");
      if (!header) return false;
      const h1 = header.querySelector("h1");
      if (!h1 || h1.textContent?.trim() !== "My Blog") return false;
      const nav = header.querySelector("nav");
      if (!nav) return false;
      const ariaLabel = nav.getAttribute("aria-label");
      return ariaLabel !== null && ariaLabel.trim().length > 0;
    },
    "has-article-structure": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const article = iframeWindow.document.querySelector("main article");
      if (!article) return false;
      const articleHeader = article.querySelector("header");
      if (!articleHeader) return false;
      const h2 = articleHeader.querySelector("h2");
      const time = article.querySelector("time");
      const section = article.querySelector("section");
      const footer = article.querySelector("footer");
      return (
        h2 !== null &&
        h2.textContent?.trim() === "Learning Semantic HTML" &&
        time !== null &&
        time.hasAttribute("datetime") &&
        section !== null &&
        section.querySelector("h3") !== null &&
        footer !== null
      );
    },
    "has-sidebar-aside": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const main = iframeWindow.document.querySelector("main");
      if (!main) return false;
      const aside = main.querySelector("aside");
      if (!aside) return false;
      const h2 = aside.querySelector("h2");
      return h2 !== null && h2.textContent?.trim() === "About the Author";
    },
    "has-page-footer": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const doc = iframeWindow.document;
      // Find a footer that is NOT inside main (page-level footer)
      const allFooters = doc.querySelectorAll("footer");
      for (const footer of Array.from(allFooters)) {
        const isInsideMain = footer.closest("main") !== null;
        const isInsideArticle = footer.closest("article") !== null;
        if (!isInsideMain && !isInsideArticle) {
          return (footer.textContent || "").includes("Copyright 2024");
        }
      }
      return false;
    },
  },
};
