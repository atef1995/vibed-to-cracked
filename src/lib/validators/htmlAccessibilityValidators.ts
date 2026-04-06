/**
 * HTML Accessibility — Exercise Validators
 * Steps for the html-accessibility tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const htmlAccessibilityValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Semantic Landmarks ────────────────────────────────────

  "html-accessibility-step-01": {
    "has-header-nav": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nav = iframeWindow.document.querySelector("header nav");
      if (!nav) return false;
      return nav.hasAttribute("aria-label");
    },
    "has-nav-links": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const links = iframeWindow.document.querySelectorAll("header nav a");
      return links.length >= 2;
    },
    "has-main-h1": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const main = iframeWindow.document.querySelector("main");
      if (!main) return false;
      return main.querySelector("h1") !== null;
    },
    "has-footer-p": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const footer = iframeWindow.document.querySelector("footer");
      if (!footer) return false;
      return footer.querySelector("p") !== null;
    },
  },

  // ── Step 2: Heading Hierarchy ─────────────────────────────────────

  "html-accessibility-step-02": {
    "has-h1": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const h1 = iframeWindow.document.querySelector("h1");
      return (
        h1 !== null &&
        (h1.textContent || "")
          .trim()
          .toLowerCase()
          .includes("web development guide")
      );
    },
    "has-two-h2": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const h2s = iframeWindow.document.querySelectorAll("h2");
      if (h2s.length < 2) return false;
      const texts = Array.from(h2s).map((el) =>
        (el.textContent || "").trim().toLowerCase()
      );
      return (
        texts.some((t) => t.includes("html basics")) &&
        texts.some((t) => t.includes("css fundamentals"))
      );
    },
    "has-two-h3": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const h3s = iframeWindow.document.querySelectorAll("h3");
      if (h3s.length < 2) return false;
      const texts = Array.from(h3s).map((el) =>
        (el.textContent || "").trim().toLowerCase()
      );
      return (
        texts.some((t) => t.includes("document structure")) &&
        texts.some((t) => t.includes("selectors"))
      );
    },
  },

  // ── Step 3: Image Alt Text ────────────────────────────────────────

  "html-accessibility-step-03": {
    "has-descriptive-alt": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const images = iframeWindow.document.querySelectorAll("img");
      return Array.from(images).some((img) => {
        const alt = img.getAttribute("alt");
        return alt !== null && alt.length > 10;
      });
    },
    "has-empty-alt": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const images = iframeWindow.document.querySelectorAll("img");
      return Array.from(images).some((img) => {
        return img.hasAttribute("alt") && img.getAttribute("alt") === "";
      });
    },
    "has-linked-img-alt": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const linkedImgs = iframeWindow.document.querySelectorAll("a img");
      return Array.from(linkedImgs).some((img) => {
        const alt = img.getAttribute("alt");
        return alt !== null && alt.trim().length > 0;
      });
    },
  },

  // ── Step 4: Accessible Forms ──────────────────────────────────────

  "html-accessibility-step-04": {
    "has-fieldset-legend": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const legend = iframeWindow.document.querySelector("fieldset > legend");
      return (
        legend !== null &&
        (legend.textContent || "").trim().toLowerCase().includes("sign up")
      );
    },
    "has-email-label": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const emailInput = iframeWindow.document.querySelector(
        'input[type="email"]'
      );
      if (!emailInput) return false;
      const id = emailInput.getAttribute("id");
      if (!id) return false;
      const label = iframeWindow.document.querySelector(`label[for="${id}"]`);
      return label !== null && emailInput.hasAttribute("required");
    },
    "has-pw-describedby": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const pwInput = iframeWindow.document.querySelector(
        'input[type="password"]'
      );
      if (!pwInput) return false;
      const describedBy = pwInput.getAttribute("aria-describedby");
      if (!describedBy) return false;
      const helpEl = iframeWindow.document.getElementById(describedBy);
      return helpEl !== null && (helpEl.textContent || "").trim().length > 0;
    },
    "has-submit-button": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const btn = iframeWindow.document.querySelector('button[type="submit"]');
      return btn !== null && (btn.textContent || "").trim().length > 0;
    },
  },

  // ── Step 5: ARIA Essentials ───────────────────────────────────────

  "html-accessibility-step-05": {
    "has-aria-label-button": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const btn = iframeWindow.document.querySelector("button[aria-label]");
      if (!btn) return false;
      const label = btn.getAttribute("aria-label");
      return label !== null && label.toLowerCase().includes("close");
    },
    "has-aria-labelledby": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const form = iframeWindow.document.querySelector("form[aria-labelledby]");
      if (!form) return false;
      const refId = form.getAttribute("aria-labelledby");
      if (!refId) return false;
      const target = iframeWindow.document.getElementById(refId);
      return target !== null && target.tagName === "H2";
    },
    "has-aria-describedby": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.querySelector(
        "input[aria-describedby]"
      );
      if (!input) return false;
      const refId = input.getAttribute("aria-describedby");
      if (!refId) return false;
      const helper = iframeWindow.document.getElementById(refId);
      return helper !== null && (helper.textContent || "").trim().length > 0;
    },
  },

  // ── Step 6: ARIA Interactive Patterns ─────────────────────────────

  "html-accessibility-step-06": {
    "has-tablist": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const tablist = iframeWindow.document.querySelector('[role="tablist"]');
      if (!tablist) return false;
      const tabs = tablist.querySelectorAll('[role="tab"]');
      return tabs.length >= 2;
    },
    "has-selected-tab": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const tabs = iframeWindow.document.querySelectorAll('[role="tab"]');
      const selected = Array.from(tabs).find(
        (t) => t.getAttribute("aria-selected") === "true"
      );
      if (!selected) return false;
      const controls = selected.getAttribute("aria-controls");
      return controls !== null && controls.length > 0;
    },
    "has-tabpanels": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const panels =
        iframeWindow.document.querySelectorAll('[role="tabpanel"]');
      if (panels.length < 2) return false;
      return Array.from(panels).every((panel) => {
        const labelledBy = panel.getAttribute("aria-labelledby");
        if (!labelledBy) return false;
        const tab = iframeWindow.document.getElementById(labelledBy);
        return tab !== null && tab.getAttribute("role") === "tab";
      });
    },
  },

  // ── Step 7: Keyboard Navigation ───────────────────────────────────

  "html-accessibility-step-07": {
    "has-skip-link": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const link = iframeWindow.document.querySelector('a[href="#main"]');
      if (!link) return false;
      return (
        link.classList.contains("skip-link") &&
        (link.textContent || "").toLowerCase().includes("skip")
      );
    },
    "has-nav-with-links": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const navLinks = iframeWindow.document.querySelectorAll("nav a");
      return navLinks.length >= 2;
    },
    "has-main-target": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const main = iframeWindow.document.querySelector("main#main");
      if (!main) return false;
      return main.querySelector("h1") !== null;
    },
    "has-real-button": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const button = iframeWindow.document.querySelector("button");
      return button !== null && (button.textContent || "").trim().length > 0;
    },
  },

  // ── Step 8: Color and Contrast ────────────────────────────────────

  "html-accessibility-step-08": {
    "has-status-spans": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const spans = iframeWindow.document.querySelectorAll("span");
      const withClass = Array.from(spans).filter(
        (s) =>
          s.classList.contains("success") ||
          s.classList.contains("error") ||
          s.classList.contains("warning")
      );
      return withClass.length >= 3;
    },
    "has-text-indicators": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const spans = iframeWindow.document.querySelectorAll(
        "span.success, span.error, span.warning"
      );
      return Array.from(spans).every((s) => {
        const text = (s.textContent || "").trim();
        return text.length > 1;
      });
    },
    "has-contrast-styles": (html): boolean => {
      // Check for style block with contrast-safe color values
      const hasStyle = /<style[\s>]/i.test(html);
      if (!hasStyle) return false;
      // Check for the required classes with color declarations
      const hasSuccess = /\.success\s*\{[^}]*color\s*:/i.test(html);
      const hasError = /\.error\s*\{[^}]*color\s*:/i.test(html);
      const hasWarning = /\.warning\s*\{[^}]*color\s*:/i.test(html);
      return hasSuccess && hasError && hasWarning;
    },
  },

  // ── Step 9: Accessible Contact Form ───────────────────────────────

  "html-accessibility-step-09": {
    "has-full-landmarks": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const doc = iframeWindow.document;
      const header = doc.querySelector("header");
      const nav = doc.querySelector("header nav[aria-label]");
      const main = doc.querySelector("main");
      const footer = doc.querySelector("footer");
      return (
        header !== null && nav !== null && main !== null && footer !== null
      );
    },
    "has-labeled-form": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const doc = iframeWindow.document;
      const legend = doc.querySelector("fieldset > legend");
      if (!legend) return false;
      // Check that inputs have matching labels
      const inputs = doc.querySelectorAll("fieldset input, fieldset textarea");
      if (inputs.length < 3) return false;
      return Array.from(inputs).every((input) => {
        const id = input.getAttribute("id");
        if (!id) return false;
        return doc.querySelector(`label[for="${id}"]`) !== null;
      });
    },
    "has-email-describedby": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const email = iframeWindow.document.querySelector('input[type="email"]');
      if (!email) return false;
      const dbId = email.getAttribute("aria-describedby");
      if (!dbId) return false;
      const helper = iframeWindow.document.getElementById(dbId);
      return helper !== null && (helper.textContent || "").trim().length > 0;
    },
    "has-required-fields": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const doc = iframeWindow.document;
      const nameInput = doc.querySelector('input[id="name"]');
      const emailInput = doc.querySelector('input[id="email"]');
      const messageInput = doc.querySelector('textarea[id="message"]');
      return (
        nameInput !== null &&
        nameInput.hasAttribute("required") &&
        emailInput !== null &&
        emailInput.hasAttribute("required") &&
        messageInput !== null &&
        messageInput.hasAttribute("required")
      );
    },
  },
};
