/**
 * HTML Tables & Data — Exercise Validators
 * Steps for the html-tables-data tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const htmlTablesDataValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Basic Table Structure ─────────────────────────────────

  "html-tables-data-step-01": {
    "has-table-with-headers": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const ths = iframeWindow.document.querySelectorAll("table th");
      return ths.length === 3;
    },
    "has-two-data-rows": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const tds = iframeWindow.document.querySelectorAll("table td");
      return tds.length === 6; // 2 rows x 3 cells
    },
    "correct-header-text": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const ths = iframeWindow.document.querySelectorAll("table th");
      const texts = Array.from(ths).map((th) => th.textContent?.trim());
      return (
        texts.includes("Product") &&
        texts.includes("Price") &&
        texts.includes("Rating")
      );
    },
  },

  // ── Step 2: Semantic Table Sections ───────────────────────────────

  "html-tables-data-step-02": {
    "has-caption": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const caption = iframeWindow.document.querySelector("table caption");
      return (
        caption !== null && caption.textContent?.trim() === "Student Grades"
      );
    },
    "has-all-sections": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const thead = iframeWindow.document.querySelector("table thead");
      const tbody = iframeWindow.document.querySelector("table tbody");
      const tfoot = iframeWindow.document.querySelector("table tfoot");
      return thead !== null && tbody !== null && tfoot !== null;
    },
    "thead-uses-th": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const ths = iframeWindow.document.querySelectorAll("table thead th");
      return ths.length >= 2;
    },
  },

  // ── Step 3: Spanning Cells ────────────────────────────────────────

  "html-tables-data-step-03": {
    "has-colspan": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const cell = iframeWindow.document.querySelector("[colspan]");
      return cell !== null && cell.getAttribute("colspan") === "2";
    },
    "has-rowspan": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const cell = iframeWindow.document.querySelector("[rowspan]");
      return cell !== null && cell.getAttribute("rowspan") === "2";
    },
    "correct-row-count": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const rows = iframeWindow.document.querySelectorAll("table tr");
      return rows.length === 4;
    },
  },

  // ── Step 4: Accessible Headers ────────────────────────────────────

  "html-tables-data-step-04": {
    "has-scope-col": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const cols = iframeWindow.document.querySelectorAll('th[scope="col"]');
      return cols.length >= 3;
    },
    "has-scope-row": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const rows = iframeWindow.document.querySelectorAll('th[scope="row"]');
      return rows.length >= 2;
    },
    "has-caption": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const caption = iframeWindow.document.querySelector("table caption");
      return caption !== null && caption.textContent?.trim() === "Team Stats";
    },
  },

  // ── Step 5: Complex Header Relationships ──────────────────────────

  "html-tables-data-step-05": {
    "headers-have-ids": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const headersWithId = iframeWindow.document.querySelectorAll("th[id]");
      return headersWithId.length >= 4;
    },
    "cells-use-headers": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const cellsWithHeaders =
        iframeWindow.document.querySelectorAll("td[headers]");
      return cellsWithHeaders.length >= 2;
    },
    "has-colspan": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const cell = iframeWindow.document.querySelector("[colspan]");
      return cell !== null && cell.getAttribute("colspan") === "2";
    },
  },

  // ── Step 6: Styling Tables ────────────────────────────────────────

  "html-tables-data-step-06": {
    "has-thead-tbody": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const thead = iframeWindow.document.querySelector("table thead");
      const tbody = iframeWindow.document.querySelector("table tbody");
      return thead !== null && tbody !== null;
    },
    "has-border-collapse": (html): boolean => {
      return /border-collapse\s*:\s*collapse/i.test(html);
    },
    "has-cell-border": (html): boolean => {
      return /border\s*:/i.test(html) && /<style[\s\S]*?<\/style>/i.test(html);
    },
  },

  // ── Step 7: Responsive Tables ─────────────────────────────────────

  "html-tables-data-step-07": {
    "has-wrapper-div": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const wrapper = iframeWindow.document.querySelector("div.table-wrapper");
      return wrapper !== null;
    },
    "table-in-wrapper": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const table = iframeWindow.document.querySelector(
        "div.table-wrapper table"
      );
      return table !== null;
    },
    "has-overflow-auto": (html): boolean => {
      return /overflow-x\s*:\s*auto/i.test(html);
    },
  },

  // ── Step 8: Build a Data Dashboard ────────────────────────────────

  "html-tables-data-step-08": {
    "has-full-structure": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const caption = iframeWindow.document.querySelector("table caption");
      const thead = iframeWindow.document.querySelector("table thead");
      const tbody = iframeWindow.document.querySelector("table tbody");
      return (
        caption !== null &&
        caption.textContent?.trim() === "Quarterly Revenue" &&
        thead !== null &&
        tbody !== null
      );
    },
    "col-headers-scoped": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const cols = iframeWindow.document.querySelectorAll(
        'thead th[scope="col"]'
      );
      return cols.length >= 4;
    },
    "row-headers-scoped": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const rows = iframeWindow.document.querySelectorAll(
        'tbody th[scope="row"]'
      );
      return rows.length >= 2;
    },
    "has-border-collapse": (html): boolean => {
      return /border-collapse\s*:\s*collapse/i.test(html);
    },
  },
};
