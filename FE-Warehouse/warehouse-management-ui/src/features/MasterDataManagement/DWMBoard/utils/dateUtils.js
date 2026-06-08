/**
 * Get number of days in a month (1-31).
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Format as YYYY-MM for display (e.g. 2026-02).
 */
export function formatYearMonth(year, month) {
  const m = String(month).padStart(2, '0');
  return `${year}-${m}`;
}

/**
 * Get current year and month (1-12).
 */
export function getCurrentYearMonth() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}
