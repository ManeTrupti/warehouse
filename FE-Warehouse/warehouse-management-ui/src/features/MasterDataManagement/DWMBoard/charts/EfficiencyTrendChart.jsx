import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const TARGET_Y = 90;

/**
 * Efficiency Trend - line chart with horizontal target line at 90.
 * Data: [{ day: 1, value: 65 }, ...]
 */
function EfficiencyTrendChart({ data = [], target = TARGET_Y }) {
  const chartData = Array.isArray(data) && data.length > 0 ? data : [
    { day: 1, value: 65 },
    { day: 2, value: 85 },
    { day: 3, value: 85 },
    { day: 4, value: 90 },
    { day: 5, value: 95 },
    { day: 6, value: 90 },
    { day: 7, value: 80 },
  ];

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-semibold text-slate-800">Efficiency Trend</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 120]} tick={{ fontSize: 12 }} allowDataOverflow />
            <Tooltip />
            <ReferenceLine y={target} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="value"
              name="Efficiency"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EfficiencyTrendChart;
