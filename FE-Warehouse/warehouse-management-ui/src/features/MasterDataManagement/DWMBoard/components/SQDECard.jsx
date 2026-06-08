import React from 'react';
import {
  ShieldCheckIcon,
  ChartBarIcon,
  TruckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import StatusButtons from './StatusButtons';
import DayGrid from './DayGrid';

const ICON_MAP = {
  ShieldCheckIcon,
  ChartBarIcon,
  TruckIcon,
  GlobeAltIcon,
};

/**
 * Single SQDE category card: icon, title, status buttons, day grid.
 */
function SQDECard({
  category,
  selectedDay,
  onSelectDay,
  onDayClick,
  currentStatus,
  onStatusChange,
  dayStatus = {},
  daysInMonth,
}) {
  const Icon = ICON_MAP[category.icon] || ChartBarIcon;

  const handleDaySelect = (day) => {
    onSelectDay?.(day);
    onDayClick?.(day);
  };

  return (
    <div
      className={`rounded-xl border ${category.borderColor} ${category.bgColor} p-4 shadow-sm`}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-6 w-6 text-slate-600" aria-hidden />
        <h3 className="text-sm font-semibold text-slate-800">{category.label}</h3>
      </div>
      <div className="mb-3">
        <StatusButtons value={currentStatus} onChange={onStatusChange} />
      </div>
      <DayGrid
        daysInMonth={daysInMonth}
        selectedDay={selectedDay}
        onSelectDay={handleDaySelect}
        dayStatus={dayStatus}
      />
    </div>
  );
}

export default SQDECard;
