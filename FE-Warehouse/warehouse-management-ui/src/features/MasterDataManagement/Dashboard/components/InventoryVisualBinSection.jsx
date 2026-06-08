import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { subinventoryReport, zoneReport, rackReport, binReport } from "@core/store/slices/Reports/reportsSlice";

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

const InventoryVisualBinSection = ({ filters }) => {
  const dispatch = useDispatch();
  const { binReportData = [], loading } = useSelector((state) => state.reports);

  useEffect(() => {
    const month = filters?.month || undefined;
    const financialYear = filters?.year || undefined;
    dispatch(subinventoryReport({ month, financialYear }));
    dispatch(zoneReport({ month, financialYear }));
    dispatch(rackReport({ month, financialYear }));
    dispatch(binReport({ month, financialYear }));
  }, [dispatch, filters?.month, filters?.year]);

  const flattenedRackData = useMemo(() => {
    const source = binReportData || [];
    const rows = [];
    source.forEach((zone) => {
      (zone?.bins || []).forEach((bin) => {
        rows.push({
          zone: zone.rack_code || zone.rack_name || "",
          rack: bin.bin_code || bin.bin_name || "",
          totalQty: Number(bin.total_qty || 0),
        });
      });
    });
    return rows;
  }, [binReportData]);

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

  const hasBinData = sortedRackRows.length > 0;
  const totalBinQty = useMemo(
    () => sortedRackRows.reduce((acc, item) => acc + item.totalQty, 0),
    [sortedRackRows],
  );
  const activeRackCount = rackColumnsByZone.length;
  const topRack = sortedRackRows[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-50 p-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Bin Quantity</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{totalBinQty.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Racks</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{activeRackCount.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top Bin</p>
          <p className="mt-1 text-lg font-bold text-slate-700">
            {topRack ? `${topRack.rack} (${topRack.totalQty.toLocaleString()})` : "N/A"}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-100">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-700">Quantity per Bin</h3>
          <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-700">
            Physical Layout
          </span>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="mb-3 text-sm font-medium text-slate-600">Bin Physical Layout</p>
          <div className="mb-3 grid gap-2 rounded-lg border border-slate-100 bg-white/90 p-3 text-xs text-slate-500 md:grid-cols-3">
            <span>
              Racks: <strong className="font-semibold text-slate-600">{rackColumnsByZone.length}</strong>
            </span>
            <span>
              Bins: <strong className="font-semibold text-slate-600">{sortedRackRows.length}</strong>
            </span>
            <span>
              Highest Qty:{" "}
              <strong className="font-semibold text-slate-600">{maxRackQty.toLocaleString()}</strong>
            </span>
          </div>

          {hasBinData ? (
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
            <EmptyState message={loading ? "Loading bin report..." : "No data available for bin report."} />
          )}
        </div>
      </section>
    </div>
  );
};

export default InventoryVisualBinSection;
