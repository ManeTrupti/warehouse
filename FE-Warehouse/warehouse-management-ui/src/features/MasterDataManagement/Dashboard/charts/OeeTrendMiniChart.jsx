import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Small OEE trend chart, styled similar to other Recharts charts in the app
const OeeTrendMiniChart = ({ data = [] }) => {
  const chartData =
    Array.isArray(data) && data.length > 0
      ? data
      : [
          { label: "20", oee: 70 },
          { label: "21", oee: 72 },
          { label: "22", oee: 75 },
          { label: "23", oee: 77 },
          { label: "24", oee: 80 },
          { label: "25", oee: 78 },
          { label: "26", oee: 78.1 },
        ];

  return (
    <div className="mt-2 h-40 rounded-xl bg-sky-50/40">
      <div className="h-full px-4 pb-3 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 8, left: -12 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[60, 100]}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip />
            <ReferenceLine
              y={85}
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="oee"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 3, fill: "#0ea5e9" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OeeTrendMiniChart;

