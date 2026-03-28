/**
 * Step code validator — runs server-side pattern matching and output comparison.
 *
 * Flow:
 * 1. Client executes code in WebContainer, captures stdout
 * 2. Client sends { code, output } to /api/tutorials/[slug]/steps/[stepSlug]/validate
 * 3. This validator checks:
 *    - Output matching: compare captured stdout to expectedOutput
 *    - Pattern matching: regex checks against the code text
 * 4. Returns pass/fail with feedback
 */

export interface ValidationConfig {
  expectedOutput?: string;
  patterns?: PatternCheck[];
  hints?: string[];
}

export interface PatternCheck {
  regex: string;
  flags?: string;
  message: string; // shown on failure, e.g. "You need to use the `let` keyword"
  shouldMatch: boolean; // true = code must match, false = code must NOT match
}

export interface PatternResult {
  pattern: string;
  passed: boolean;
  message: string;
}

export interface ValidationResult {
  passed: boolean;
  feedback: string;
  outputMatch: boolean | null;
  patternResults: PatternResult[];
}

export function validateStepCode(
  validationType: string,
  validationConfig: ValidationConfig,
  userCode: string,
  capturedOutput: string
): ValidationResult {
  const patternResults: PatternResult[] = [];
  let outputMatch: boolean | null = null;

  // Pattern matching
  if (
    (validationType === "pattern" || validationType === "both") &&
    validationConfig.patterns
  ) {
    for (const check of validationConfig.patterns) {
      const regex = new RegExp(check.regex, check.flags ?? "");
      const matches = regex.test(userCode);
      const passed = check.shouldMatch ? matches : !matches;

      patternResults.push({
        pattern: check.regex,
        passed,
        message: check.message,
      });
    }
  }

  // Output matching
  if (
    (validationType === "output" || validationType === "both") &&
    validationConfig.expectedOutput != null
  ) {
    const expected = validationConfig.expectedOutput.trim();
    const actual = capturedOutput.trim();
    outputMatch = actual === expected;
  }

  // Determine overall pass
  const allPatternsPassed =
    patternResults.length === 0 || patternResults.every((r) => r.passed);
  const outputPassed = outputMatch === null || outputMatch;
  const passed = allPatternsPassed && outputPassed;

  // Build feedback
  let feedback: string;
  if (passed) {
    feedback = "Nice work! Your code passes all checks.";
  } else {
    const failedPatterns = patternResults.filter((r) => !r.passed);
    const messages: string[] = [];

    if (!outputPassed) {
      messages.push(
        `Expected output: "${validationConfig.expectedOutput?.trim()}" but got: "${capturedOutput.trim()}"`
      );
    }
    for (const fp of failedPatterns) {
      messages.push(fp.message);
    }

    feedback = messages.join("\n");

    // Append hint if available and user failed
    if (validationConfig.hints?.length) {
      feedback += `\n\nHint: ${validationConfig.hints[0]}`;
    }
  }

  return { passed, feedback, outputMatch, patternResults };
}
