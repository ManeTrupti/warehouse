import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ComboChart = ({ data, config }) => {
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
  const barColors = colors?.bars || ['#6366f1'];
  const lineColor = colors?.line || '#f97316';
  const showActual = showActualOnGraph !== false;
  const showTarget = showTargetOnGraph === true;
  const useToggles = showActual || showTarget;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
          {showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />}
          <XAxis dataKey={categoryKey} tick={{ fontSize: 12 }} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
          <YAxis tick={{ fontSize: 12 }} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
          <Tooltip />
          {showLegend && <Legend verticalAlign={legendVerticalAlign} align={legendAlign} />}
          {useToggles && showActual && <Bar dataKey="actual" barSize={24} name="Actual" fill={barColors[0]} radius={[4, 4, 0, 0]} />}
          {useToggles && showTarget && <Line type="monotone" dataKey="target" name="Target" stroke={lineColor} strokeWidth={2} dot={{ r: 3 }} />}
          {!useToggles && (
            <>
              <Bar dataKey={dataKey} barSize={24} name={config.name} fill={barColors[0]} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey={dataKey} name={`${config.name} Trend`} stroke={lineColor} strokeWidth={2} dot={false} />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComboChart;

