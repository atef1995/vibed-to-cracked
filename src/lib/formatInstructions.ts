/**
 * Formats instruction text by styling inline code references:
 * - HTML tags like `<div>` get orange code badges
 * - Single-quoted values like 'hello' get violet code badges
 * - Backtick-wrapped code like `useState` gets standard code badges
 *
 * Returns an HTML string safe for dangerouslySetInnerHTML.
 */
export function formatInstructions(text: string): string {
  return text
    .replace(
      /`([^`]+)`/g,
      (_m, code) =>
        `<code class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-slate-100 text-violet-700 dark:bg-slate-800/80 dark:text-violet-300 border border-slate-200/60 dark:border-slate-700/50">${escapeHtml(code)}</code>`
    )
    .replace(
      /&lt;(\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^&]*?)?)\s*&gt;|<(\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*?)?)\s*>/g,
      (_m, escaped, raw) => {
        const tag = escaped || raw;
        return `<code class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200/60 dark:border-orange-700/50">&lt;${escapeHtml(tag)}&gt;</code>`;
      }
    )
    .replace(
      /&#39;([^&#]+?)&#39;|'([^']+?)'/g,
      (_m, escaped, raw) => {
        const val = escaped || raw;
        return `<code class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200/60 dark:border-violet-700/50">${escapeHtml(val)}</code>`;
      }
    );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
