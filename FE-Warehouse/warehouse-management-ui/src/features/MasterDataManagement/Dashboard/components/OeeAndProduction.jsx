import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import OeeTrendMiniChart from "../charts/OeeTrendMiniChart";
import ProductionVsPlanChart from "../charts/ProductionVsPlanChart";

const OeeBadge = ({ label, value, color, muted }) => {
  return (
    <div
      className={`flex flex-1 flex-col justify-center rounded-xl border px-4 py-3 text-center ${
        muted
          ? "border-slate-200 bg-slate-50"
          : "border-amber-300 bg-amber-50 shadow-[0_0_0_1px_rgba(250,204,21,0.1)]"
      }`}
    >
      <span
        className={`text-lg font-semibold ${
          color || "text-amber-600"
        } leading-tight`}
      >
        {value}
      </span>
      <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
};

const OeeAndProduction = () => {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-sky-500" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                OEE Dashboard
              </h2>
              <p className="text-[11px] text-slate-500">
                Consolidated OEE, availability, performance and quality
              </p>
            </div>
          </div>
          <select className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
            <option>All Departments</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OeeBadge label="OEE" value="78.1%" />
          <OeeBadge
            label="Availability"
            value="79.2%"
            color="text-sky-600"
            muted
          />
          <OeeBadge
            label="Performance"
            value="100%"
            color="text-fuchsia-600"
            muted
          />
          <OeeBadge
            label="Quality"
            value="98.6%"
            color="text-emerald-600"
            muted
          />
        </div>

        <OeeTrendMiniChart />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Today&apos;s Production vs Plan
            </h2>
            <p className="text-[11px] text-slate-500">
              Model-wise plan vs actual units
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm bg-sky-500" />
              Planned
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm bg-emerald-500" />
              Actual
            </span>
          </div>
        </div>

        <ProductionVsPlanChart />
      </div>
    </section>
  );
};

export default OeeAndProduction;

