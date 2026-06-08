import React from "react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Grouped bar chart for "Today's Production vs Plan"
const defaultData = [
  { model: "8046", planned: 100, actual: 430 },
  { model: "8043", planned: 140, actual: 660 },
  { model: "8033", planned: 80, actual: 440 },
];

const ProductionVsPlanChart = ({ data = defaultData }) => {
  const chartData =
    Array.isArray(data) && data.length > 0 ? data : defaultData;

  return (
    <div className="mt-2 h-56 rounded-xl bg-slate-50 px-2 pb-4 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart
          data={chartData}
          margin={{ top: 8, right: 12, bottom: 4, left: -16 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="model"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: 11 }}
          />
          <Bar
            dataKey="planned"
            name="Planned"
            fill="#0ea5e9"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="actual"
            name="Actual"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductionVsPlanChart;

