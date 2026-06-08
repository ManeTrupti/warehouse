import React from 'react';
import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const RadarChart = ({ data, config }) => {
  const {
    dataKey,
    categoryKey,
    colors,
    showGridLines = true,
    showLegend = true,
    showActualOnGraph = true,
    showTargetOnGraph = false,
    legendVerticalAlign = 'bottom',
    legendAlign = 'center',
  } = config;
  const barColors = colors?.bars || ['#0ea5e9', '#6366f1'];
  const stroke = colors?.line || '#0ea5e9';
  const fill = colors?.fill || 'rgba(14,165,233,0.2)';
  const showActual = showActualOnGraph !== false;
  const showTarget = showTargetOnGraph === true;
  const useToggles = showActual || showTarget;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ReRadarChart data={data}>
          {showGridLines && <PolarGrid />}
          <PolarAngleAxis dataKey={categoryKey} />
          <PolarRadiusAxis />
          {useToggles && showActual && (
            <Radar name="Actual" dataKey="actual" stroke={barColors[0]} fill={barColors[0]} fillOpacity={0.4} />
          )}
          {useToggles && showTarget && (
            <Radar name="Target" dataKey="target" stroke={barColors[1] || stroke} fill={barColors[1] || fill} fillOpacity={0.2} />
          )}
          {!useToggles && (
            <Radar name={config.name} dataKey={dataKey} stroke={stroke} fill={fill} fillOpacity={0.6} />
          )}
          <Tooltip />
          {showLegend && <Legend verticalAlign={legendVerticalAlign} align={legendAlign} />}
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;

