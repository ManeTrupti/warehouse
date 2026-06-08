/**
 * Utilities for KPI Overview year/month filter and day-wise vs monthly aggregation.
 * - When month is selected: show data day-wise (one point per day in that month).
 * - When only year is selected: show data monthly (one point per month in that year).
 */

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Get a sortable date string (YYYY-MM-DD) from a data row.
 * Uses row.date if present, else tries to parse row.label as ISO date.
 * @returns {string|null} e.g. "2025-02-19" or null
 */
export function getDateFromRow(row) {
  if (!row) return null;
  if (row.date && /^\d{4}-\d{2}-\d{2}$/.test(String(row.date))) return String(row.date);
  const label = row.label;
  if (label && /^\d{4}-\d{2}-\d{2}$/.test(String(label))) return String(label);
  return null;
}

/**
 * Filter and optionally aggregate KPI data by year and month.
 * @param {Record<string, Array>} kpiData - { kpiId: rows }
 * @param {number} year - e.g. 2025
 * @param {number|null} month - 1-12 or null for "all months" (monthly view)
 * @returns {Record<string, Array>} filtered (and aggregated when month is null) data per KPI
 */
export function filterAndAggregateKpiData(kpiData, year, month) {
  const result = {};
  const yearStr = String(year);
  const monthStr = month != null ? String(month).padStart(2, '0') : null;

  Object.keys(kpiData || {}).forEach((kpiId) => {
    const rows = Array.isArray(kpiData[kpiId]) ? kpiData[kpiId] : [];
    const withDate = rows
      .map((row) => ({ row, date: getDateFromRow(row) }))
      .filter(({ date }) => date != null && date.startsWith(yearStr));

    if (monthStr != null) {
      // Month selected → day-wise: only rows in that month
      const inMonth = withDate.filter(({ date }) => date.slice(0, 7) === `${yearStr}-${monthStr}`);
      const sorted = inMonth.sort((a, b) => a.date.localeCompare(b.date));
      result[kpiId] = sorted.map(({ row }) => ({ ...row }));
    } else {
      // No month → monthly: one point per month (last day with data in that month)
      const byMonth = {};
      withDate.forEach(({ row, date }) => {
        const ym = date.slice(0, 7); // YYYY-MM
        if (!byMonth[ym] || date > byMonth[ym].date) {
          byMonth[ym] = { row, date };
        }
      });
      const monthlyRows = Object.keys(byMonth)
        .sort()
        .map((ym) => {
          const { row } = byMonth[ym];
          const monthNum = parseInt(ym.slice(5), 10);
          return {
            ...row,
            label: `${MONTH_LABELS[monthNum - 1]} ${yearStr}`,
            date: byMonth[ym].date,
          };
        });
      result[kpiId] = monthlyRows;
    }
  });

  return result;
}

export const MONTH_OPTIONS = MONTH_LABELS.map((label, i) => ({
  value: i + 1,
  label,
}));

/**
 * Get list of years for the filter (current year and a few before/after).
 */
export function getYearOptions() {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = current - 2; y <= current + 1; y++) years.push(y);
  return years;
}

/**
 * Check if any row in the array has a parseable date (for fallback when no filtered result).
 */
export function hasAnyDateInRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  return rows.some((row) => getDateFromRow(row) != null);
}
