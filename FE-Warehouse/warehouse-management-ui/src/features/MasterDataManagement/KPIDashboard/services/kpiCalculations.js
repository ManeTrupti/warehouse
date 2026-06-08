// Central KPI calculation engine. Formulas are configured per KPI and
// dispatched through this module so calculation logic stays separate from UI.

import { validateAndEvaluateFormula, extractVariables } from './formulaService';

const safeNumber = (value) => {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) {
    return 0;
  }
  return Number(value);
};

const safeArray = (values) => {
  if (!Array.isArray(values)) return [];
  return values.map(safeNumber).filter((v) => typeof v === 'number' && !Number.isNaN(v));
};

const calcSum = (values) => {
  const arr = safeArray(values);
  return arr.reduce((acc, v) => acc + v, 0);
};

const calcAverage = (values) => {
  const arr = safeArray(values);
  if (arr.length === 0) return 0;
  return calcSum(arr) / arr.length;
};

const calcPercentage = ({ numerator, denominator, scale = 100 }) => {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  if (den === 0) return 0;
  return (num / den) * scale;
};

const calcRatio = ({ numerator, denominator, precision = 2 }) => {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  if (den === 0) return 0;
  const result = num / den;
  const factor = 10 ** precision;
  return Math.round(result * factor) / factor;
};

const calcConditional = ({ condition, ifTrue, ifFalse }) => {
  // condition is a boolean or a function returning boolean
  const result = typeof condition === 'function' ? condition() : condition;
  return result ? safeNumber(ifTrue) : safeNumber(ifFalse);
};

const calcExpression = ({ expression, record }) => {
  if (!record) return 0;
  // Use pre-calculated "actual" from Add Data modal when present
  if (typeof record.actual === 'number' && !Number.isNaN(record.actual)) {
    return record.actual;
  }
  if (!expression) return 0;
  const vars = extractVariables(expression);
  const values = vars.reduce(
    (acc, name) => ({
      ...acc,
      [name]: record[name],
    }),
    {},
  );
  const result = validateAndEvaluateFormula(expression, values);
  return result.ok ? result.result : 0;
};

// Map of supported formula types -> implementation
const formulaHandlers = {
  SUM: ({ values }) => calcSum(values),
  AVERAGE: ({ values }) => calcAverage(values),
  PERCENTAGE: (payload) => calcPercentage(payload),
  RATIO: (payload) => calcRatio(payload),
  CONDITIONAL: (payload) => calcConditional(payload),
  EXPRESSION: (payload) => calcExpression(payload),
};

/**
 * Execute a KPI calculation based on its configuration.
 *
 * @param {Object} config - KPI configuration containing formula metadata.
 * @param {Object} data - Raw data resolved from KPI data source / API.
 * @returns {number} Calculated KPI value.
 */
export const calculateKpiValue = (config, data) => {
  if (!config || !config.calculation) return 0;

  const {
    type,
    field,
    numeratorField,
    denominatorField,
    customPayload,
    expression,
  } = config.calculation;
  const handler = formulaHandlers[type];

  if (!handler) {
    // Unknown type – safest fallback
    return 0;
  }

  // Extract basic data fields from raw data by convention.
  // Data is expected to be either an array of records or a single record.
  const resolveField = (fieldName) => {
    if (!fieldName) return undefined;
    if (Array.isArray(data)) {
      return data.map((item) => (item ? item[fieldName] : undefined));
    }
    return data ? data[fieldName] : undefined;
  };

  const payload = {
    values: resolveField(field),
    numerator: resolveField(numeratorField),
    denominator: resolveField(denominatorField),
    expression,
    // Use first record for expression-based KPIs for now
    record: Array.isArray(data) ? data[0] : data || {},
    ...(customPayload || {}),
  };

  try {
    return handler(payload);
  } catch (e) {
    // Never let a broken formula crash the UI
    // eslint-disable-next-line no-console
    console.error('KPI calculation error', e);
    return 0;
  }
};

/**
 * Helper to normalize raw API responses for KPI consumption.
 * For now it simply passes data through; later it can handle shaping.
 */
export const normalizeKpiData = (rawData) => rawData ?? [];

