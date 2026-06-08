import React from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

/**
 * Daily Production Trend - bar chart. Data: [{ day: 1, value: 120 }, ...]
 */
function DailyProductionTrendChart({ data = [] }) {
  const chartData = Array.isArray(data) && data.length > 0 ? data : [
    { day: 1, value: 120 },
    { day: 2, value: 70 },
    { day: 3, value: 95 },
    { day: 4, value: 85 },
    { day: 5, value: 100 },
    { day: 6, value: 85 },
    { day: 7, value: 75 },
  ];

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-semibold text-slate-800">Daily Production Trend</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 120]} tick={{ fontSize: 12 }} allowDataOverflow />
            <Tooltip />
            <Bar dataKey="value" name="Production" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DailyProductionTrendChart;
