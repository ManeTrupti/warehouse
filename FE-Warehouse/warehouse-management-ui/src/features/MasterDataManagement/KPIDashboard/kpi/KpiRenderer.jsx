import React from 'react';
import { CHART_TYPES, mapKpiToChartConfig } from '../utils/chartConfigMapper';
import { calculateKpiValue } from '../services/kpiCalculations';
import BarChart from '../charts/BarChart';
import ComboChart from '../charts/ComboChart';
import PieChart from '../charts/PieChart';
import DonutChart from '../charts/DonutChart';
import RadarChart from '../charts/RadarChart';
import KpiCard from './KpiCard';

const chartComponentByType = {
  [CHART_TYPES.BAR]: BarChart,
  [CHART_TYPES.COMBO]: ComboChart,
  [CHART_TYPES.PIE]: PieChart,
  [CHART_TYPES.DONUT]: DonutChart,
  [CHART_TYPES.RADAR]: RadarChart,
};

/**
 * Derive status from numeric value and thresholds (higher = better).
 * greenThreshold: value >= this => green
 * yellowThreshold: value >= this => yellow, else red
 */
const getThresholdStatus = (value, thresholds) => {
  if (!thresholds || typeof value !== 'number' || Number.isNaN(value)) return null;
  const { greenThreshold, yellowThreshold } = thresholds;
  const green = Number(greenThreshold);
  const yellow = Number(yellowThreshold);
  if (Number.isNaN(green) && Number.isNaN(yellow)) return null;
  if (!Number.isNaN(green) && value >= green) return 'green';
  if (!Number.isNaN(yellow) && value >= yellow) return 'yellow';
  return 'red';
};

/**
 * Renders a single KPI using its configuration:
 * - computes value using calculation engine
 * - chooses chart component by configured chartType
 * - passes through color configuration
 */
const KpiRenderer = ({ kpiConfig, rawData, onEdit, onDelete }) => {
  if (!kpiConfig) return null;

  const chartConfig = mapKpiToChartConfig(kpiConfig);
  const ChartComponent = chartComponentByType[chartConfig?.type];

  const kpiValue = calculateKpiValue(kpiConfig, rawData);
  const thresholdStatus = getThresholdStatus(kpiValue, kpiConfig.thresholds);

  // For charts we expect an array of data; if the rawData is not an array,
  // convert it to a single-element array for consistent consumption.
  const chartData = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];

  return (
    <KpiCard
      title={kpiConfig.name}
      description={kpiConfig.description}
      value={kpiValue}
      unit={kpiConfig.unit}
      thresholdStatus={thresholdStatus}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      {ChartComponent ? (
        <ChartComponent data={chartData} config={chartConfig} />
      ) : (
        <div className="text-xs text-slate-400 italic">
          No chart configured for this KPI.
        </div>
      )}
    </KpiCard>
  );
};

export default KpiRenderer;

