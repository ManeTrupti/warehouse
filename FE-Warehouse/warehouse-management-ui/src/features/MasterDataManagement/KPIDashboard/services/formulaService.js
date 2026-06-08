// Utility for parsing, validating and executing custom formula expressions.
// Formulas are simple JavaScript-like expressions that can reference variables
// by name, e.g. "slag / metal_input * 100".

const RESERVED_WORDS = new Set([
  'true',
  'false',
  'null',
  'undefined',
  'NaN',
  'Infinity',
  'Math',
]);

// Extract variable names from an expression by finding word-like tokens and
// filtering out reserved words and numeric literals.
export const extractVariables = (expression) => {
  if (!expression) return [];
  const tokens = expression.match(/[a-zA-Z_]\w*/g) || [];
  const unique = Array.from(new Set(tokens));
  return unique.filter((token) => !RESERVED_WORDS.has(token));
};

// Very small whitelist-based validator to avoid arbitrary code execution.
const isExpressionSafe = (expression, variables) => {
  if (!expression || typeof expression !== 'string') return false;

  // Only allow basic math operators, parentheses, dots, underscores, spaces,
  // commas, and word characters.
  const unsafeChars = expression.match(/[^0-9a-zA-Z_+\-*/%.(),\s]/g);
  if (unsafeChars) {
    return false;
  }

  // Disallow common dangerous substrings explicitly.
  const lower = expression.toLowerCase();
  if (lower.includes('constructor') || lower.includes('window') || lower.includes('document')) {
    return false;
  }

  // Ensure all identifiers in expression are either variables or allowed symbols.
  const identifiers = expression.match(/[a-zA-Z_]\w*/g) || [];
  const allowed = new Set([...variables, 'Math', 'NaN', 'Infinity']);

  return identifiers.every((id) => allowed.has(id));
};

/**
 * Validate and evaluate a formula expression with provided variable values.
 *
 * @param {string} expression
 * @param {Record<string, number>} values
 * @returns {{ ok: boolean, result?: number, error?: string }}
 */
export const validateAndEvaluateFormula = (expression, values = {}) => {
  const vars = extractVariables(expression);

  if (!expression || !expression.trim()) {
    return { ok: false, error: 'Formula is required.' };
  }

  if (!isExpressionSafe(expression, vars)) {
    return { ok: false, error: 'Formula contains invalid or unsupported syntax.' };
  }

  try {
    const argNames = vars;
    const argValues = vars.map((name) => {
      const raw = values[name];
      if (raw === null || raw === undefined || raw === '') return 0;
      const num = Number(raw);
      return Number.isNaN(num) ? 0 : num;
    });

    // eslint-disable-next-line no-new-func
    const fn = new Function(...argNames, `"use strict"; return (${expression});`);
    const result = fn(...argValues);

    if (result === Infinity || result === -Infinity) {
      return { ok: false, error: 'Division by zero detected.' };
    }
    if (Number.isNaN(result)) {
      return { ok: false, error: 'Result is not a valid number.' };
    }

    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: 'Invalid formula syntax.' };
  }
};

