import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  subinventoryReport,
  zoneReport,
  rackReport,
} from "@core/store/slices/Reports/reportsSlice";

/** Soft pastel fills — readable on white without heavy saturation */
const PIE_COLORS = [
  "#93C5FD",
  "#86EFAC",
  "#FCD34D",
  "#C4B5FD",
  "#FCA5A5",
  "#67E8F9",
  "#7DD3FC",
  "#FDBA74",
  "#BEF264",
];

const getRackShadeClassName = (ratio) => {
  if (ratio >= 0.75) return "bg-sky-400";
  if (ratio >= 0.5) return "bg-sky-300";
  if (ratio >= 0.25) return "bg-sky-200";
  return "bg-sky-100";
};

const EmptyState = ({ message }) => (
  <div className="flex h-full min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 text-center text-sm font-medium text-slate-500">
    {message}
  </div>
);

const InventoryVisualSection = ({ filters }) => {
  const dispatch = useDispatch();
  const {
    subinventoryData = [],
    zoneReportData = [],
    rackReportData = [],
    loading,
  } = useSelector((state) => state.reports);

  useEffect(() => {
    const month = filters?.month || undefined;
    const financialYear = filters?.year || undefined;
    dispatch(subinventoryReport({ month, financialYear }));
    dispatch(zoneReport({ month, financialYear }));
    dispatch(rackReport({ month, financialYear }));
  }, [dispatch, filters?.month, filters?.year]);

  const chartSubinventoryData = useMemo(
    () =>
      (subinventoryData || []).map((item, index) => ({
        name:
          item?.sub_inventory_code ||
          item?.sub_inventory_name ||
          `Sub-${index + 1}`,
        qty: Number(item?.total_qty || 0),
        color: PIE_COLORS[index % PIE_COLORS.length],
      })),
    [subinventoryData],
  );

  const sortedSubinventoryData = useMemo(
    () => [...chartSubinventoryData].sort((a, b) => b.qty - a.qty),
    [chartSubinventoryData],
  );

  const chartZoneData = useMemo(
    () =>
      (zoneReportData?.data || zoneReportData || []).map((item, index) => ({
        zone:
          item?.zone_code ||
          item?.zone_name ||
          item?.name ||
          `Zone ${index + 1}`,
        qty: Number(item?.total_qty || item?.qty || 0),
        color: PIE_COLORS[index % PIE_COLORS.length],
      })),
    [zoneReportData],
  );

  const sortedZoneData = useMemo(
    () => [...chartZoneData].sort((a, b) => b.qty - a.qty),
    [chartZoneData],
  );

  const flattenedRackData = useMemo(() => {
    const source = rackReportData || [];
    const rows = [];
    source.forEach((zone) => {
      (zone?.racks || []).forEach((rack) => {
        rows.push({
          zone: zone.zone_code || zone.zone_name || "",
          rack: rack.rack_code || rack.rack_name || "",
          totalQty: Number(rack.total_qty || 0),
        });
      });
    });
    return rows;
  }, [rackReportData]);

  const sortedRackRows = useMemo(
    () => [...flattenedRackData].sort((a, b) => b.totalQty - a.totalQty),
    [flattenedRackData],
  );

  const rackColumnsByZone = useMemo(() => {
    const grouped = new Map();
    flattenedRackData.forEach((item) => {
      const key = item.zone || "Unknown";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    });
    return Array.from(grouped.entries()).map(([zone, racks]) => ({
      zone,
      racks,
    }));
  }, [flattenedRackData]);

  const maxRackQty = useMemo(
    () => sortedRackRows.reduce((max, r) => Math.max(max, r.totalQty || 0), 0),
    [sortedRackRows],
  );

  const rackVisualConfig = useMemo(() => {
    const count = sortedRackRows.length;
    if (count <= 6) {
      return {
        rackGapClass: "gap-6",
        zoneGapClass: "gap-10",
        cellClass: "h-4 w-7",
      };
    }
    if (count <= 14) {
      return {
        rackGapClass: "gap-4",
        zoneGapClass: "gap-7",
        cellClass: "h-3.5 w-6",
      };
    }
    return {
      rackGapClass: "gap-3",
      zoneGapClass: "gap-6",
      cellClass: "h-3 w-5",
    };
  }, [sortedRackRows.length]);

  const totalSubinventoryQty = useMemo(
    () => sortedSubinventoryData.reduce((acc, item) => acc + item.qty, 0),
    [sortedSubinventoryData],
  );
  const totalZoneQty = useMemo(
    () => sortedZoneData.reduce((acc, item) => acc + item.qty, 0),
    [sortedZoneData],
  );
  const hasSubinventoryData = sortedSubinventoryData.length > 0;
  const hasZoneData = sortedZoneData.length > 0;
  const hasRackData = sortedRackRows.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 p-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Subinventory Qty</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{totalSubinventoryQty.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Zone Qty</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{totalZoneQty.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Rack Qty</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{sortedRackRows.reduce((acc, item) => acc + item.totalQty, 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-100">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-700">
              Quantity per Subinventory
            </h3>
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
              {sortedSubinventoryData.length} Records
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr]">
            <div className="h-[220px] rounded-xl border border-slate-100 bg-slate-50 p-2">
              {hasSubinventoryData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sortedSubinventoryData}
                      dataKey="qty"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={78}
                      innerRadius={24}
                      paddingAngle={2}
                    >
                      {sortedSubinventoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message={loading ? "Loading subinventory quantities..." : "No data available for subinventory report."} />
              )}
            </div>

            <div className="h-[220px] space-y-2 overflow-y-auto pr-1">
              {hasSubinventoryData ? (
                sortedSubinventoryData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">
                    {item.qty.toLocaleString()}
                  </span>
                </div>
                ))
              ) : (
                <EmptyState message={loading ? "Loading breakdown..." : "No data available to list subinventories."} />
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-100">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-700">
              Quantity per Zone
            </h3>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              {sortedZoneData.length} Zones
            </span>
          </div>
          <div className="h-[260px] rounded-xl border border-slate-100 bg-slate-50 p-2">
            {hasZoneData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedZoneData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="zone" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="qty" radius={[10, 10, 0, 0]} maxBarSize={62}>
                    {sortedZoneData.map((entry) => (
                      <Cell key={entry.zone} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message={loading ? "Loading zone quantities..." : "No data available for zone report."} />
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-100">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-700">Quantity per Rack</h3>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Layout View
          </span>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="mb-3 text-sm font-medium text-slate-600">Rack Physical Layout</p>
          <div className="mb-3 grid gap-2 rounded-lg border border-slate-100 bg-white/90 p-3 text-xs text-slate-500 md:grid-cols-3">
            <span>
              Zones: <strong className="font-semibold text-slate-600">{rackColumnsByZone.length}</strong>
            </span>
            <span>
              Racks: <strong className="font-semibold text-slate-600">{sortedRackRows.length}</strong>
            </span>
            <span>
              Highest Qty:{" "}
              <strong className="font-semibold text-slate-600">{maxRackQty.toLocaleString()}</strong>
            </span>
          </div>

          {hasRackData ? (
            <>
              <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3">
                <div className="mb-2 inline-block rounded-md border border-slate-100 bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  Rear cross aisle
                </div>

                <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-100 bg-white/90 p-4">
                  <div
                    className={`mx-auto flex min-w-max items-start justify-center py-2 ${rackVisualConfig.zoneGapClass}`}
                  >
                    {rackColumnsByZone.map(({ zone, racks }) => (
                    <div
                      key={zone}
                      className="flex flex-col items-center gap-3 rounded-xl border border-slate-100 bg-white/95 px-4 py-3 shadow-sm"
                    >
                      <span className="text-xs font-medium text-slate-600">{zone}</span>
                      <div className={`flex ${rackVisualConfig.rackGapClass}`}>
                        {racks.map((rack) => {
                          const ratio =
                            maxRackQty > 0 ? (rack.totalQty || 0) / maxRackQty : 0;
                          const shadeClass = getRackShadeClassName(ratio);
                          return (
                            <div
                              key={`${zone}-${rack.rack}`}
                              className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2 py-2 shadow-sm"
                            >
                              <span className="text-[11px] font-medium text-slate-600">
                                {rack.rack}
                              </span>
                              <div className="grid grid-rows-10 gap-0.5 rounded-md border border-slate-100 bg-white p-1">
                                {Array.from({ length: 10 }).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`${rackVisualConfig.cellClass} rounded-sm ${
                                      idx < Math.round(ratio * 10)
                                        ? shadeClass
                                        : "bg-slate-50"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] font-medium text-slate-600">
                                {rack.totalQty.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>

                <div className="mt-2 inline-block rounded-md border border-slate-100 bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  Front cross aisle
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                <div className="max-h-[320px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Rack</th>
                      <th className="px-4 py-2 text-left font-medium">Zone</th>
                      <th className="px-4 py-2 text-right font-medium">Total Qty</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {sortedRackRows.map((rack) => (
                      <tr key={`row-${rack.zone}-${rack.rack}`} className="border-t border-slate-50">
                        <td className="px-4 py-2 text-slate-600">{rack.rack}</td>
                        <td className="px-4 py-2 text-slate-600">{rack.zone}</td>
                        <td className="px-4 py-2 text-right font-medium text-slate-600">
                          {rack.totalQty.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </>
          ) : (
            <EmptyState message={loading ? "Loading rack layout..." : "No data available for rack report."} />
          )}
        </div>
      </section>
    </div>
  );
};

export default InventoryVisualSection;
