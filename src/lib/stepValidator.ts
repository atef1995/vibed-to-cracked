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

export interface PreAction {
  type: "click" | "input";
  selector: string;
  value?: string; // required for "input" actions
}

export interface DomCheck {
  selector: string;
  property: "textContent" | "exists" | "count" | "attribute";
  expected: string | number | boolean;
  attribute?: string; // required when property is "attribute"
  message: string;
}

export interface ValidationConfig {
  expectedOutput?: string;
  patterns?: PatternCheck[];
  hints?: string[];
  initialCode?: string;
  taskInstructions?: string;
  starterCode?: string; // JSX starter code pre-filled in the React editor
  domChecks?: DomCheck[];
  preActions?: PreAction[]; // interactions to simulate before capturing DOM snapshot
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

export interface DomCheckResult {
  selector: string;
  passed: boolean;
  message: string;
}

export interface ValidationResult {
  passed: boolean;
  feedback: string;
  outputMatch: boolean | null;
  patternResults: PatternResult[];
  domCheckResults?: DomCheckResult[];
}

/** Lightweight snapshot of DOM state sent from the client after react-live renders. */
export interface DomSnapshotEntry {
  selector: string;
  textContent?: string;
  exists: boolean;
  count: number;
  attributes?: Record<string, string>;
}

export function validateStepCode(
  validationType: string,
  validationConfig: ValidationConfig,
  userCode: string,
  capturedOutput: string,
  domSnapshot?: DomSnapshotEntry[]
): ValidationResult {
  // Exercise-type steps are validated client-side via iframe (ValidatedExercise).
  // The API call just records completion.
  if (validationType === "exercise") {
    return {
      passed: true,
      feedback: "Nice work! Your code passes all checks.",
      outputMatch: null,
      patternResults: [],
    };
  }

  const patternResults: PatternResult[] = [];
  const domCheckResults: DomCheckResult[] = [];
  let outputMatch: boolean | null = null;

  // Pattern matching (shared by pattern, both, and jsx types)
  if (
    (validationType === "pattern" ||
      validationType === "both" ||
      validationType === "jsx") &&
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

  // DOM checks (jsx validation type)
  if (validationType === "jsx" && validationConfig.domChecks && domSnapshot) {
    for (const check of validationConfig.domChecks) {
      const entry = domSnapshot.find((e) => e.selector === check.selector);

      let passed = false;
      if (entry) {
        switch (check.property) {
          case "exists":
            passed = entry.exists === Boolean(check.expected);
            break;
          case "textContent":
            passed =
              entry.textContent?.trim() === String(check.expected).trim();
            break;
          case "count":
            passed = entry.count === Number(check.expected);
            break;
          case "attribute":
            passed =
              check.attribute != null &&
              entry.attributes?.[check.attribute] === String(check.expected);
            break;
        }
      } else if (check.property === "exists" && check.expected === false) {
        // Element not found and we expected it to not exist
        passed = true;
      }

      domCheckResults.push({
        selector: check.selector,
        passed,
        message: check.message,
      });
    }
  }

  // Determine overall pass
  const allPatternsPassed =
    patternResults.length === 0 || patternResults.every((r) => r.passed);
  const allDomChecksPassed =
    domCheckResults.length === 0 || domCheckResults.every((r) => r.passed);
  const outputPassed = outputMatch === null || outputMatch;
  const passed = allPatternsPassed && allDomChecksPassed && outputPassed;

  // Build feedback
  let feedback: string;
  if (passed) {
    feedback = "Nice work! Your code passes all checks.";
  } else {
    const failedPatterns = patternResults.filter((r) => !r.passed);
    const failedDomChecks = domCheckResults.filter((r) => !r.passed);
    const messages: string[] = [];

    if (!outputPassed) {
      messages.push(
        `Expected output: "${validationConfig.expectedOutput?.trim()}" but got: "${capturedOutput.trim()}"`
      );
    }
    for (const fp of failedPatterns) {
      messages.push(fp.message);
    }
    for (const fd of failedDomChecks) {
      messages.push(fd.message);
    }

    feedback = messages.join("\n");

    // Append hint if available and user failed
    if (validationConfig.hints?.length) {
      feedback += `\n\nHint: ${validationConfig.hints[0]}`;
    }
  }

  return { passed, feedback, outputMatch, patternResults, domCheckResults };
}
