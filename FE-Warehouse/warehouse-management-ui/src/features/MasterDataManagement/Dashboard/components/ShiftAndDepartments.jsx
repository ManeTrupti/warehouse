import React from "react";
import {
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const shifts = [
  {
    name: "Shift 1",
    time: "06:00 - 14:00",
    planned: 280,
    actual: 265,
    efficiency: "94.6%",
    color: "bg-emerald-500",
  },
  {
    name: "Shift 2",
    time: "14:00 - 22:00",
    planned: 295,
    actual: 180,
    efficiency: "61%",
    color: "bg-red-500",
  },
  {
    name: "Shift 3",
    time: "22:00 - 06:00",
    planned: 275,
    actual: 0,
    efficiency: "-",
    color: "bg-slate-300",
  },
];

const departments = [
  { name: "Piston Hard", code: "PST", complete: 96, pending: 36 },
  { name: "Housing", code: "HSG", complete: 95, pending: 33 },
  { name: "Section Shaft", code: "SFT", complete: 72, pending: 39 },
  { name: "Hydraulic Centering", code: "HYD", complete: 93, pending: 42 },
];

const recentActivity = [
  {
    time: "14:05",
    title: "Shift 1 production data submitted",
    tag: "Piston Hard",
  },
  {
    time: "13:45",
    title: "Valve bush shortage detected for 8046",
    tag: "Hydraulic Centering",
  },
  {
    time: "13:30",
    title: "Assembly plan updated for tomorrow",
    tag: "Assembly",
  },
  {
    time: "13:15",
    title: "Shift 1 production data submitted",
    tag: "Housing",
  },
];

const ShiftAndDepartments = () => {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)]">
    

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-sky-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                Department Status
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">Today</span>
          </div>
          <div className="space-y-2">
            {departments.map((dept) => (
              <div
                key={dept.code}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-600">
                    ✓
                  </span>
                  <div>
                    <div className="font-medium text-slate-700">
                      {dept.name}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      {dept.code}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 rounded-full bg-slate-200">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500"
                      style={{ width: `${dept.complete}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-semibold text-slate-700">
                      {dept.complete}%
                    </div>
                    <div className="text-[10px] text-emerald-600">
                      {dept.pending} pending
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                Recent Activity
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">Last 2 hours</span>
          </div>
          <div className="space-y-2 text-xs">
            {recentActivity.map((item) => (
              <div
                key={`${item.time}-${item.title}`}
                className="flex items-start justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <div>
                    <div className="text-[11px] font-medium text-slate-700">
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      {item.tag}
                    </div>
                  </div>
                </div>
                <span className="mt-0.5 text-[10px] text-slate-400">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-full">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-sky-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Shift Summary
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">
            Today · 06:00 - 06:00
          </span>
        </div>

        {shifts.map((shift) => (
          <div
            key={shift.name}
            className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-slate-50">
                  {shift.name}
                </span>
                <span>{shift.time}</span>
              </div>
              <span className="font-semibold text-slate-700">
                {shift.planned} planned · {shift.actual} actual
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                <div className={`h-full w-4/5 rounded-full ${shift.color}`} />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {shift.efficiency}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShiftAndDepartments;

