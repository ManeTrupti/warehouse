import { CHART_TYPES } from './utils/chartConfigMapper';

export const DEFAULT_KPIS = [
  {
    id: 'orders-volume',
    name: 'Orders Volume',
    description: 'Total order amounts per month',
    dataSource: '/api/kpis/orders',
    calculation: {
      type: 'SUM',
      field: 'amount',
    },
    chartType: CHART_TYPES.BAR,
    colors: {
      bars: ['#0ea5e9', '#38bdf8'],
      line: '#6366f1',
      fill: 'rgba(14,165,233,0.2)',
      segments: ['#0ea5e9', '#6366f1', '#22c55e'],
    },
  },
  {
    id: 'order-fulfillment-rate',
    name: 'Order Fulfillment Rate',
    description: 'Completed vs total orders',
    dataSource: '/api/kpis/orders',
    calculation: {
      type: 'PERCENTAGE',
      numeratorField: 'completed',
      denominatorField: 'total',
    },
    chartType: CHART_TYPES.COMBO,
    colors: {
      bars: ['#22c55e'],
      line: '#0f766e',
      fill: 'rgba(34,197,94,0.2)',
      segments: ['#22c55e', '#e11d48'],
    },
  },
];

const KPI_STORAGE_KEY = 'kpi-dashboard-kpis';

export const loadKpis = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_KPIS;
  }

  try {
    const raw = window.localStorage.getItem(KPI_STORAGE_KEY);
    if (!raw) return DEFAULT_KPIS;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_KPIS;
    }

    return parsed;
  } catch {
    return DEFAULT_KPIS;
  }
};

export const persistKpis = (kpis) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(KPI_STORAGE_KEY, JSON.stringify(kpis));
  } catch {
    // ignore storage errors
  }
};

