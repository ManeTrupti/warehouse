import React from 'react';
import { CheckIcon, XMarkIcon, MinusCircleIcon } from '@heroicons/react/24/outline';

/**
 * Grid of day numbers (1..daysInMonth). Selected day has blue border.
 * dayStatus: { [day: number]: 'ok' | 'not_ok' | 'no_plan' | undefined }
 * Color-wise: OK = green check, NOT OK = red X, NO PLAN = grey circle.
 */
function DayGrid({ daysInMonth, selectedDay, onSelectDay, dayStatus = {} }) {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-7 gap-0.5">
      {days.map((day) => {
        const isSelected = selectedDay === day;
        const status = dayStatus[day];
        const hasOk = status === 'ok';
        const hasNotOk = status === 'not_ok';
        const hasNoPlan = status === 'no_plan';
        const hasStatus = hasOk || hasNotOk || hasNoPlan;

        const statusBg =
          hasOk ? 'bg-green-100' : hasNotOk ? 'bg-red-100' : hasNoPlan ? 'bg-slate-100' : '';

        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDay?.(day)}
            className={`relative flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition ${
              isSelected
                ? 'border-2 border-blue-500 bg-blue-50 text-slate-800'
                : `border ${hasStatus ? 'border-solid' : 'border-dashed border-slate-300'} ${statusBg || 'bg-white'} text-slate-600 hover:border-slate-400`
            }`}
          >
            {day}
            {!isSelected && hasStatus && (
              <span className="absolute inset-0 flex items-center justify-center">
                {hasOk && <CheckIcon className="h-4 w-4 text-green-600" />}
                {hasNotOk && <XMarkIcon className="h-4 w-4 text-red-600" />}
                {hasNoPlan && <MinusCircleIcon className="h-4 w-4 text-slate-500" />}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default DayGrid;
