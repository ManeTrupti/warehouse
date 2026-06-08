import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { movementTrendReport } from "@core/store/slices/Reports/reportsSlice";

const EmptyState = ({ message }) => (
  <div className="flex h-full min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 text-center text-sm font-medium text-slate-500">
    {message}
  </div>
);

const InventoryVisualTrendSection = ({ filters }) => {
  const dispatch = useDispatch();

  const { movementTrendReportData = {}, loading } = useSelector(
    (state) => state.reports
  );

  // API call with days param
  useEffect(() => {
    if (filters?.month || filters?.year) {
      dispatch(
        movementTrendReport({
          month: filters?.month || undefined,
          financialYear: filters?.year || undefined,
        }),
      );
      return;
    }

    dispatch(movementTrendReport({ days: 7 }));
  }, [dispatch, filters?.month, filters?.year]);

  //  data mapping
  const chartData = useMemo(() => {
    const trendData =
      movementTrendReportData?.trend ||
      movementTrendReportData?.data?.trend ||
      [];

    if (!trendData.length) {
      return [];
    }

    return trendData.map((item) => ({
      date: item.date,
      inward: Number(item.inward_qty || 0),
      issued: Number(item.issued_qty || 0),
      transfer: Number(item.transfer_qty || 0),
    }));
  }, [movementTrendReportData]);

  const hasTrendData = chartData.length > 0;
  const totals = useMemo(
    () =>
      chartData.reduce(
        (acc, item) => {
          acc.inward += item.inward;
          acc.issued += item.issued;
          acc.transfer += item.transfer;
          return acc;
        },
        { inward: 0, issued: 0, transfer: 0 },
      ),
    [chartData],
  );
  const totalQtyFromApi = Number(movementTrendReportData?.total_qty || 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-700">
          Inventory Movement Trend
        </h3>
        <div className="text-right">
          <p className="text-xs text-slate-500">
            Total Qty :
            <span className="ml-1 text-lg font-semibold text-sky-600">
              {totalQtyFromApi.toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 via-violet-50 to-emerald-50 p-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inward Qty</p>
          <p className="mt-1 text-2xl font-bold text-sky-700">{totals.inward.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Issued Qty</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">{totals.issued.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transfer Qty</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{totals.transfer.toLocaleString()}</p>
        </div>
      </div>

      <div className="h-[340px] overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/80 p-2">
        {hasTrendData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />

              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "0.875rem", color: "#64748b" }} />

              <Bar dataKey="inward" fill="#7DD3FC" name="Inward Qty" barSize={44} radius={[8, 8, 0, 0]} />
              <Bar dataKey="issued" fill="#FCA5A5" name="Issued Qty" barSize={44} radius={[8, 8, 0, 0]} />
              <Bar dataKey="transfer" fill="#86EFAC" name="Transfer Qty" barSize={44} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message={loading ? "Loading movement trend..." : "No data available for inventory movement trend."} />
        )}
      </div>
    </section>
  );
};

export default InventoryVisualTrendSection;
