/**
 * CSS Advanced Selectors — Exercise Validators
 * Steps for the css-advanced-selectors tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const cssAdvancedSelectorsValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Specificity & the Cascade ─────────────────────────────

  "css-advanced-selectors-step-01": {
    "has-class-selector": (_html, css): boolean => {
      return /\.intro\s*\{/i.test(css);
    },
    "has-id-selector": (_html, css): boolean => {
      return /#lead\s*\{/i.test(css);
    },
    "id-sets-steelblue": (_html, css): boolean => {
      return /#lead\s*\{[^}]*color\s*:\s*steelblue/is.test(css);
    },
  },

  // ── Step 2: Structural Pseudo-Classes ─────────────────────────────

  "css-advanced-selectors-step-02": {
    "has-first-child": (_html, css): boolean => {
      return /:first-child\s*\{[^}]*background\s*:/is.test(css);
    },
    "has-last-child": (_html, css): boolean => {
      return /:last-child\s*\{[^}]*background\s*:/is.test(css);
    },
    "has-nth-even": (_html, css): boolean => {
      return /:nth-child\s*\(\s*even\s*\)\s*\{[^}]*border-left\s*:/is.test(css);
    },
  },

  // ── Step 3: Dynamic Pseudo-Classes ────────────────────────────────

  "css-advanced-selectors-step-03": {
    "has-hover": (_html, css): boolean => {
      return /\.link:hover\s*\{/i.test(css);
    },
    "hover-underline": (_html, css): boolean => {
      return /\.link:hover\s*\{[^}]*text-decoration\s*:\s*underline/is.test(
        css
      );
    },
    "has-focus-outline": (_html, css): boolean => {
      return /\.link:focus\s*\{[^}]*outline\s*:/is.test(css);
    },
  },

  // ── Step 4: Pseudo-Elements ───────────────────────────────────────

  "css-advanced-selectors-step-04": {
    "has-before-content": (_html, css): boolean => {
      return /\.badge\s*::before\s*\{[^}]*content\s*:/is.test(css);
    },
    "before-gold": (_html, css): boolean => {
      return /\.badge\s*::before\s*\{[^}]*color\s*:\s*gold/is.test(css);
    },
    "has-after-content": (_html, css): boolean => {
      return /\.badge\s*::after\s*\{[^}]*content\s*:/is.test(css);
    },
  },

  // ── Step 5: Attribute Selectors ───────────────────────────────────

  "css-advanced-selectors-step-05": {
    "has-href-starts-https": (_html, css): boolean => {
      return /a\s*\[\s*href\s*\^=\s*['"]https/i.test(css);
    },
    "has-href-starts-mailto": (_html, css): boolean => {
      return /a\s*\[\s*href\s*\^=\s*['"]mailto/i.test(css);
    },
    "has-type-search": (_html, css): boolean => {
      return /input\s*\[\s*type\s*=\s*['"]search['"]\s*\]\s*\{[^}]*border-radius/is.test(
        css
      );
    },
  },

  // ── Step 6: Descendant & Child Combinators ────────────────────────

  "css-advanced-selectors-step-06": {
    "has-descendant-a": (_html, css): boolean => {
      return /\.menu\s+a\s*\{[^}]*color\s*:/is.test(css);
    },
    "has-child-li": (_html, css): boolean => {
      return /\.menu\s*>\s*li\s*\{[^}]*border-bottom\s*:/is.test(css);
    },
    "has-nested-ul-padding": (_html, css): boolean => {
      return /\.menu\s+ul\s*\{[^}]*padding-left\s*:/is.test(css);
    },
  },

  // ── Step 7: Sibling Combinators ───────────────────────────────────

  "css-advanced-selectors-step-07": {
    "has-adjacent-h3-p": (_html, css): boolean => {
      return /h3\s*\+\s*p\s*\{/i.test(css);
    },
    "has-general-highlight-p": (_html, css): boolean => {
      return /\.highlight\s*~\s*p\s*\{/i.test(css);
    },
    "general-has-border": (_html, css): boolean => {
      return /\.highlight\s*~\s*p\s*\{[^}]*border-left\s*:/is.test(css);
    },
  },

  // ── Step 8: Negation & Matching ───────────────────────────────────

  "css-advanced-selectors-step-08": {
    "has-not-muted": (_html, css): boolean => {
      return /\.tag:not\(\s*\.muted\s*\)\s*\{[^}]*background\s*:/is.test(css);
    },
    "has-is-headings": (_html, css): boolean => {
      return /:is\s*\([^)]*h2[^)]*h3[^)]*\)\s*\{[^}]*color\s*:/is.test(css);
    },
    "has-where-italic": (_html, css): boolean => {
      return /:where\s*\([^)]*\)\s*\{[^}]*font-style\s*:\s*italic/is.test(css);
    },
  },

  // ── Step 9: The :has() Relational Selector ────────────────────────

  "css-advanced-selectors-step-09": {
    "has-has-img": (_html, css): boolean => {
      return /\.item:has\s*\(\s*img\s*\)\s*\{[^}]*background\s*:/is.test(css);
    },
    "has-has-badge": (_html, css): boolean => {
      return /\.item:has\s*\(\s*\.badge\s*\)\s*\{[^}]*border\s*:/is.test(css);
    },
    "has-has-h4": (_html, css): boolean => {
      return /\.item:has\s*\(\s*h4\s*\)\s*\{[^}]*padding\s*:/is.test(css);
    },
  },

  // ── Step 10: Selectors Challenge ──────────────────────────────────

  "css-advanced-selectors-step-10": {
    "has-not-disabled": (_html, css): boolean => {
      return /\.item:not\(\s*\.disabled\s*\)\s*\{[^}]*cursor\s*:\s*pointer/is.test(
        css
      );
    },
    "has-attr-https": (_html, css): boolean => {
      return /a\s*\[\s*href\s*\^=\s*['"]https['"]\s*\]\s*\{[^}]*color\s*:\s*#22c55e/is.test(
        css
      );
    },
    "has-first-child-bold": (_html, css): boolean => {
      return /\.list\s*>\s*li:first-child\s*\{[^}]*font-weight\s*:\s*bold/is.test(
        css
      );
    },
    "has-has-badge-border": (_html, css): boolean => {
      return /\.card:has\s*\(\s*\.badge\s*\)\s*\{[^}]*border\s*:/is.test(css);
    },
  },
};
