import React from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const BarChart = ({ data, config }) => {
  const {
    dataKey,
    categoryKey,
    colors,
    showGridLines = true,
    showLegend = true,
    showActualOnGraph = true,
    showTargetOnGraph = false,
    xAxisLabel,
    yAxisLabel,
    legendVerticalAlign = 'bottom',
    legendAlign = 'center',
  } = config;
  const barColors = colors?.bars || ['#0ea5e9'];
  const actualKey = 'actual';
  const targetKey = 'target';
  const showActual = showActualOnGraph !== false;
  const showTarget = showTargetOnGraph === true;
  const useToggles = showActual || showTarget;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
          {showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />}
          <XAxis dataKey={categoryKey} tick={{ fontSize: 12 }} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
          <YAxis tick={{ fontSize: 12 }} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
          <Tooltip />
          {showLegend && <Legend verticalAlign={legendVerticalAlign} align={legendAlign} />}
          {useToggles && showActual && <Bar dataKey={actualKey} name="Actual" fill={barColors[0]} radius={[4, 4, 0, 0]} />}
          {useToggles && showTarget && <Bar dataKey={targetKey} name="Target" fill={barColors[1] || barColors[0]} radius={[4, 4, 0, 0]} />}
          {!useToggles && <Bar dataKey={dataKey} name={config.name} fill={barColors[0]} radius={[4, 4, 0, 0]} />}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;

