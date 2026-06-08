import React from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DonutChart = ({ data, config }) => {
  const {
    dataKey,
    categoryKey,
    colors,
    showLegend = true,
    showActualOnGraph = true,
    showTargetOnGraph = false,
    legendVerticalAlign = 'bottom',
    legendAlign = 'center',
  } = config;
  const segmentColors = colors?.segments || ['#22c55e', '#0ea5e9', '#f97316', '#6366f1', '#e11d48'];
  const valueKey = showActualOnGraph ? 'actual' : showTargetOnGraph ? 'target' : dataKey;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={categoryKey}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={entry[categoryKey] || index} fill={segmentColors[index % segmentColors.length]} />
            ))}
          </Pie>
          <Tooltip />
          {showLegend && <Legend verticalAlign={legendVerticalAlign} align={legendAlign} />}
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;

