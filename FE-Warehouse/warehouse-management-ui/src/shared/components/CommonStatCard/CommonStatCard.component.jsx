import { ListChecks } from "lucide-react";

/** Distinct accent families for stat strips; cycle with `toneIndex` so neighbors never clash. */
export const STAT_CARD_TONE_PRESETS = [
  {
    border: "border-l-4 border-l-blue-500",
    iconWrap: "bg-blue-50 text-blue-600",
    value: "text-blue-700",
  },
  {
    border: "border-l-4 border-l-amber-500",
    iconWrap: "bg-amber-50 text-amber-600",
    value: "text-amber-700",
  },
  {
    border: "border-l-4 border-l-emerald-500",
    iconWrap: "bg-emerald-50 text-emerald-600",
    value: "text-emerald-700",
  },
  {
    border: "border-l-4 border-l-violet-500",
    iconWrap: "bg-violet-50 text-violet-600",
    value: "text-violet-700",
  },
  {
    border: "border-l-4 border-l-rose-500",
    iconWrap: "bg-rose-50 text-rose-600",
    value: "text-rose-700",
  },
  {
    border: "border-l-4 border-l-cyan-500",
    iconWrap: "bg-cyan-50 text-cyan-600",
    value: "text-cyan-700",
  },
];

const getToneFromAccent = (accent = "") => {
  const value = String(accent).toLowerCase();
  if (value.includes("orange") || value.includes("amber") || value.includes("yellow")) {
    return {
      border: "border-l-4 border-l-amber-500",
      iconWrap: "bg-amber-50 text-amber-600",
      value: "text-amber-700",
    };
  }
  if (value.includes("sky") || value.includes("blue") || value.includes("indigo")) {
    return {
      border: "border-l-4 border-l-blue-500",
      iconWrap: "bg-blue-50 text-blue-600",
      value: "text-blue-700",
    };
  }
  if (value.includes("red")) {
    return {
      border: "border-l-4 border-l-red-500",
      iconWrap: "bg-red-50 text-red-600",
      value: "text-red-700",
    };
  }
  if (value.includes("rose") || value.includes("pink")) {
    return {
      border: "border-l-4 border-l-pink-500",
      iconWrap: "bg-pink-50 text-pink-600",
      value: "text-pink-700",
    };
  }
  if (value.includes("green") || value.includes("emerald")) {
    return {
      border: "border-l-4 border-l-emerald-500",
      iconWrap: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-700",
    };
  }
  return {
    border: "border-l-4 border-l-indigo-500",
    iconWrap: "bg-indigo-50 text-indigo-600",
    value: "text-slate-900",
  };
};

export function CommonStatCard({
  title,
  value,
  accent,
  icon: Icon = ListChecks,
  /** When set, picks a distinct color from {@link STAT_CARD_TONE_PRESETS} (use 0,1,2,… along the strip). */
  toneIndex,
}) {
  const n = STAT_CARD_TONE_PRESETS.length;
  const tone =
    typeof toneIndex === "number" && Number.isFinite(toneIndex)
      ? STAT_CARD_TONE_PRESETS[((toneIndex % n) + n) % n]
      : getToneFromAccent(accent);
  const displayValue =
    value === null || value === undefined || value === "" || value === "undefined"
      ? "-"
      : value;

  return (
    <article className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${tone.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <p className={`mt-2 truncate text-3xl font-bold leading-none ${tone.value}`}>
            {displayValue}
          </p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${tone.iconWrap}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </article>
  );
}

export default CommonStatCard;
