/**
 * Code Validator for Exercise Security
 * Detects and prevents XSS and dangerous patterns in HTML/CSS/JS submissions
 */

interface ValidationResult {
  safe: boolean;
  reason?: string;
  patterns?: string[];
}

/**
 * Dangerous patterns that could enable XSS attacks or code injection
 */
const DANGEROUS_PATTERNS = [
  // Script injection
  { pattern: /<script[^>]*>/gi, name: "script tag" },
  { pattern: /on\w+\s*=/gi, name: "event handler attribute (onclick, onerror, etc)" },
  
  // Function evaluation
  { pattern: /\beval\s*\(/gi, name: "eval function" },
  { pattern: /new\s+Function\s*\(/gi, name: "Function constructor" },
  { pattern: /setTimeout\s*\(\s*['"`]/gi, name: "setTimeout with string (code execution)" },
  { pattern: /setInterval\s*\(\s*['"`]/gi, name: "setInterval with string (code execution)" },
  
  // DOM manipulation with user input risk
  { pattern: /innerHTML\s*=\s*[^=]/gi, name: "innerHTML assignment" },
  { pattern: /document\.write/gi, name: "document.write" },
  
  // Dangerous data URIs and imports
  { pattern: /data:text\/html/gi, name: "data URI with HTML" },
  
  // Iframe creation (could load external content)
  { pattern: /<iframe[^>]*src\s*=/gi, name: "iframe with src attribute" },
  
  // Import suspicious modules (only in JS context)
  { pattern: /import.*from\s*['"`]worker_threads['"`]/gi, name: "worker_threads import" },
  { pattern: /import.*from\s*['"`]child_process['"`]/gi, name: "child_process import" },
  { pattern: /import.*from\s*['"`]fs['"`]/gi, name: "fs import" },
  { pattern: /require\s*\(\s*['"`]child_process['"`]/gi, name: "child_process require" },
  { pattern: /require\s*\(\s*['"`]fs['"`]/gi, name: "fs require" },
];

/**
 * Patterns that are generally safe and shouldn't trigger warnings
 * These are common in legitimate code
 */
const SAFE_PATTERNS = [
  // querySelector and similar safe DOM methods
  /querySelector/gi,
  /getElementById/gi,
  /getElementsByClassName/gi,
  /addEventListener/gi,
  /textContent/gi,
  /innerText/gi,
  /style\./gi,
  /classList/gi,
];

/**
 * Validate HTML code for XSS vulnerabilities
 */
export function validateHtmlSafety(html: string): ValidationResult {
  if (!html || typeof html !== "string") {
    return { safe: true };
  }

  const detectedPatterns: string[] = [];

  for (const { pattern, name } of DANGEROUS_PATTERNS) {
    // Skip certain patterns for HTML (e.g., Function constructor is JS-specific)
    if (
      name.includes("Function constructor") ||
      name.includes("eval") ||
      name.includes("setTimeout") ||
      name.includes("setInterval") ||
      name.includes("import") ||
      name.includes("require")
    ) {
      continue; // These are JS-specific
    }

    if (pattern.test(html)) {
      detectedPatterns.push(name);
      pattern.lastIndex = 0; // Reset regex state
    }
  }

  if (detectedPatterns.length > 0) {
    return {
      safe: false,
      reason: `Detected unsafe HTML patterns: ${detectedPatterns.join(", ")}`,
      patterns: detectedPatterns,
    };
  }

  return { safe: true };
}

/**
 * Validate CSS code (generally safer than HTML/JS)
 */
export function validateCssSafety(css: string): ValidationResult {
  if (!css || typeof css !== "string") {
    return { safe: true };
  }

  // CSS is generally safe, but check for data URIs with embedded scripts
  if (/data:text\/html/gi.test(css)) {
    return {
      safe: false,
      reason: "Detected data URI with HTML content",
      patterns: ["data URI with HTML"],
    };
  }

  // Check for expression() which was used in old IE for XSS
  if (/expression\s*\(/gi.test(css)) {
    return {
      safe: false,
      reason: "Detected CSS expression function",
      patterns: ["CSS expression"],
    };
  }

  return { safe: true };
}

/**
 * Validate JavaScript code for dangerous patterns
 */
export function validateJavaScriptSafety(js: string): ValidationResult {
  if (!js || typeof js !== "string") {
    return { safe: true };
  }

  const detectedPatterns: string[] = [];

  for (const { pattern, name } of DANGEROUS_PATTERNS) {
    if (pattern.test(js)) {
      detectedPatterns.push(name);
      pattern.lastIndex = 0; // Reset regex state
    }
  }

  if (detectedPatterns.length > 0) {
    return {
      safe: false,
      reason: `Detected unsafe JavaScript patterns: ${detectedPatterns.join(", ")}`,
      patterns: detectedPatterns,
    };
  }

  return { safe: true };
}

/**
 * Validate all exercise code (HTML, CSS, JS)
 * Returns details about what was detected
 */
export function validateExerciseCodeSafety(
  html?: string,
  css?: string,
  js?: string
): ValidationResult {
  const results: ValidationResult[] = [];

  if (html) {
    results.push(validateHtmlSafety(html));
  }

  if (css) {
    results.push(validateCssSafety(css));
  }

  if (js) {
    results.push(validateJavaScriptSafety(js));
  }

  // Find any unsafe results
  const unsafeResults = results.filter((r) => !r.safe);

  if (unsafeResults.length > 0) {
    const allPatterns = unsafeResults.flatMap((r) => r.patterns || []);
    const allReasons = unsafeResults.map((r) => r.reason).filter(Boolean);

    return {
      safe: false,
      reason: allReasons.join("; "),
      patterns: allPatterns,
    };
  }

  return { safe: true };
}

/**
 * Create a sanitized version of code by removing dangerous patterns
 * NOTE: This is NOT a recommended approach for production security
 * Better to reject unsafe code entirely
 */
export function getDetectedPatterns(
  html?: string,
  css?: string,
  js?: string
): string[] {
  const patterns = new Set<string>();

  if (html) {
    const result = validateHtmlSafety(html);
    result.patterns?.forEach((p) => patterns.add(p));
  }

  if (css) {
    const result = validateCssSafety(css);
    result.patterns?.forEach((p) => patterns.add(p));
  }

  if (js) {
    const result = validateJavaScriptSafety(js);
    result.patterns?.forEach((p) => patterns.add(p));
  }

  return Array.from(patterns);
}
