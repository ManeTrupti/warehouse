import React from "react";
import { Cog6ToothIcon, BoltIcon } from "@heroicons/react/24/outline";

const FeasibilityRow = ({ model, planned, feasible, shortage, color }) => {
  const pct = Math.min(100, Math.round((feasible / planned) * 100));
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">{model}</span>
        <span>
          {feasible} / {planned} ready
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">{pct}%</span>
        {shortage > 0 && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
            -{shortage} short
          </span>
        )}
      </div>
    </div>
  );
};

const ReallocationCard = ({ from, to, reason, amount }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-sky-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex h-7 w-10 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-slate-50">
            {from}
          </span>
          <span className="text-slate-400">→</span>
          <span className="inline-flex h-7 w-10 items-center justify-center rounded-lg bg-sky-600 text-xs font-semibold text-sky-50">
            {to}
          </span>
          <span className="ml-2 text-xs font-medium text-slate-600">
            {reason}
          </span>
        </div>
        <span className="text-xs font-semibold text-sky-700">
          +{amount} units
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-slate-500">
        Auto re-allocation to maximize high-demand model throughput while using
        idle capacity.
      </p>
    </div>
  );
};

const FeasibilityAndReallocation = () => {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cog6ToothIcon className="h-5 w-5 text-sky-500" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Assembly Feasibility
              </h2>
              <p className="text-[11px] text-slate-500">
                Ready models based on child-part availability
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            67% ready
          </span>
        </div>

        <div className="space-y-3">
          <FeasibilityRow
            model="8043"
            planned={150}
            feasible={103}
            shortage={47}
            color="bg-red-500"
          />
          <FeasibilityRow
            model="8046"
            planned={100}
            feasible={100}
            shortage={0}
            color="bg-emerald-500"
          />
          <FeasibilityRow
            model="8033"
            planned={90}
            feasible={24}
            shortage={66}
            color="bg-red-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-sky-500" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Auto-Reallocation System
              </h2>
              <p className="text-[11px] text-slate-500">
                Parts moved automatically to maximize output
              </p>
            </div>
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            3 Active
          </span>
        </div>

        <ReallocationCard
          from="8033"
          to="8043"
          reason="Hydraulic Centering capacity"
          amount={8}
        />
        <ReallocationCard
          from="8033"
          to="8046"
          reason="Section Shaft capacity"
          amount={1}
        />
        <ReallocationCard
          from="8049"
          to="8043"
          reason="Valve Bush capacity"
          amount={4}
        />
      </div>
    </section>
  );
};

export default FeasibilityAndReallocation;

