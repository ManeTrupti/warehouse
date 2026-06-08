// Utility for mapping KPI configuration to concrete Recharts props.

export const CHART_TYPES = {
  BAR: 'BAR',
  COMBO: 'COMBO',
  PIE: 'PIE',
  DONUT: 'DONUT',
  RADAR: 'RADAR',
};

/**
 * Map KPI configuration to a reusable chart config object
 * consumed by chart components.
 */
export const mapKpiToChartConfig = (kpiConfig) => {
  if (!kpiConfig) return null;

  const {
    id,
    name,
    description,
    chartType,
    colors = {},
    dataKey = 'value',
    categoryKey = 'label',
    showGridLines = true,
    showLegend = true,
    showActualOnGraph = true,
    showTargetOnGraph = false,
    xAxisLabel,
    yAxisLabel,
    legendPosition = 'bottom',
  } = kpiConfig;

  const pos = (legendPosition || 'bottom').split('-');
  const verticalAlign = pos[0] === 'top' || pos[0] === 'bottom' ? pos[0] : 'bottom';
  const legendAlign = pos[1] && ['left', 'center', 'right'].includes(pos[1]) ? pos[1] : (pos[0] === 'left' || pos[0] === 'right' ? pos[0] : 'center');

  return {
    id,
    name,
    description,
    type: chartType,
    dataKey,
    categoryKey,
    colors,
    showGridLines,
    showLegend,
    showActualOnGraph,
    showTargetOnGraph,
    xAxisLabel,
    yAxisLabel,
    legendVerticalAlign: verticalAlign,
    legendAlign: legendAlign,
  };
};

