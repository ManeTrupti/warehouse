import React, { useEffect, useMemo, useState } from 'react';
import KpiRenderer from './kpi/KpiRenderer';
import {
  filterAndAggregateKpiData,
  getYearOptions,
  hasAnyDateInRows,
  MONTH_OPTIONS,
} from './utils/overviewFilterUtils';
import { loadKpis, persistKpis } from './kpiDefaults';

// Temporary mock data; in a real app this would come from API calls
const MOCK_DATA_BY_SOURCE = {
  '/api/kpis/orders': [
    { label: 'Jan', amount: 120, completed: 100, total: 150 },
    { label: 'Feb', amount: 140, completed: 130, total: 160 },
    { label: 'Mar', amount: 160, completed: 150, total: 170 },
  ],
  '/api/kpis/quality': [
    { label: 'Line A', defects: 3, inspected: 120 },
    { label: 'Line B', defects: 5, inspected: 140 },
    { label: 'Line C', defects: 2, inspected: 110 },
  ],
};

function getChartDataForKpi(kpiId, kpiData, filteredKpiData) {
  const filtered = filteredKpiData[kpiId];
  const raw = kpiData[kpiId];
  if (filtered?.length) return filtered;
  if (hasAnyDateInRows(raw)) return [];
  return raw ?? [];
}

function KPIDashboard() {
  const [kpis, setKpis] = useState(() => loadKpis());
  const [filterYear, setFilterYear] = useState(() => new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(null);

  useEffect(() => {
    persistKpis(kpis);
  }, [kpis]);

  const kpiData = useMemo(
    () =>
      kpis.reduce((acc, kpi) => {
        const source = kpi.dataSource;
        acc[kpi.id] = MOCK_DATA_BY_SOURCE[source] || [];
        return acc;
      }, {}),
    [kpis],
  );

  const filteredKpiData = useMemo(
    () => filterAndAggregateKpiData(kpiData, filterYear, filterMonth),
    [kpiData, filterYear, filterMonth],
  );

  const yearOptions = getYearOptions();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">KPI Dashboard</h1>
          <p className="text-xs text-slate-500">
            Configure KPIs, their calculation formulas, and visualizations dynamically.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
          <span className="text-sm font-medium text-slate-700">Filter</span>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Month</label>
            <select
              value={filterMonth ?? ''}
              onChange={(e) =>
                setFilterMonth(e.target.value === '' ? null : Number(e.target.value))
              }
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All months (monthly)</option>
              {MONTH_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <p className="ml-1 text-xs text-slate-500">
            {filterMonth != null
              ? `Showing day-wise data for ${
                  MONTH_OPTIONS.find((m) => m.value === filterMonth)?.label
                } ${filterYear}`
              : `Showing monthly data for ${filterYear}`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <KpiRenderer
              key={kpi.id}
              kpiConfig={kpi}
              rawData={getChartDataForKpi(kpi.id, kpiData, filteredKpiData)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default KPIDashboard;

