import React from 'react';
import { STATUS_OPTIONS } from '../constants/sqdeConfig';

/**
 * OK / NOT OK / NO PLAN toggle buttons for SQDE day status.
 */
function StatusButtons({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange?.(opt.value)}
          className={`min-w-[4rem] rounded border px-2 py-1 text-xs font-medium transition ${opt.className} ${
            value === opt.value ? 'ring-1 ring-offset-1 ring-slate-400' : 'hover:opacity-90'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default StatusButtons;
