import React from 'react';
import { CommonButton } from '@shared/components/CommonButton';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const statusColorClass = {
  green: 'text-emerald-600',
  yellow: 'text-amber-600',
  red: 'text-red-600',
};

const KpiCard = ({ title, description, value, unit, thresholdStatus, children, onEdit, onDelete }) => {
  const valueColorClass = thresholdStatus ? statusColorClass[thresholdStatus] : 'text-slate-900';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-start gap-2">
          <div className="text-right">
            <p className={`text-xl font-semibold ${valueColorClass}`}>
              {value}
              {unit && <span className="font-normal opacity-90"> {unit}</span>}
            </p>
          </div>
        <div className="flex items-center gap-0.5">
          {onEdit && (
            <CommonButton
              type="button"
              variant="ghost"
              size="xs"
              onClick={onEdit}
              icon={PencilIcon}
              aria-label="Edit KPI"
            />
          )}
          {onDelete && (
            <CommonButton
              type="button"
              variant="ghost"
              size="xs"
              onClick={onDelete}
              icon={TrashIcon}
              aria-label="Delete KPI"
            />
          )}
        </div>
        </div>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
};

export default KpiCard;

