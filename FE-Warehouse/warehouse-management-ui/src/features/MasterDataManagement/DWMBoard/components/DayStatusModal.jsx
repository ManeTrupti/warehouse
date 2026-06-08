import React from 'react';
import { CommonModal } from '@shared/components/CommonModal';
import { CheckIcon, XMarkIcon, MinusCircleIcon } from '@heroicons/react/24/outline';

const STATUS_OPTIONS = [
  {
    value: 'ok',
    label: 'OK',
    Icon: CheckIcon,
    selectedClass: 'bg-green-500 border-green-500 text-white',
    unselectedClass: 'bg-white border-green-300 text-green-600 hover:bg-green-50',
  },
  {
    value: 'not_ok',
    label: 'NOT OK',
    Icon: XMarkIcon,
    selectedClass: 'bg-red-500 border-red-500 text-white',
    unselectedClass: 'bg-white border-red-300 text-red-600 hover:bg-red-50',
  },
  {
    value: 'no_plan',
    label: 'NO PLAN',
    Icon: MinusCircleIcon,
    selectedClass: 'bg-slate-400 border-slate-400 text-white',
    unselectedClass: 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50',
  },
];

/**
 * Modal opened when a date is clicked in an SQDE card.
 * Shows "Day X - S|Q|D|E" and three status options with color-wise selection.
 */
function DayStatusModal({
  isOpen,
  onClose,
  day,
  categoryLetter,
  currentStatus,
  onSelectStatus,
}) {
  const handleSelect = (value) => {
    onSelectStatus?.(value);
    onClose?.();
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={day != null && categoryLetter ? `Day ${day} - ${categoryLetter}` : null}
      size="sm"
      showCloseButton
      closeOnBackdropClick
    >
      <p className="mb-4 text-sm font-medium text-slate-600">Select Status</p>
      <div className="flex flex-col gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = currentStatus === opt.value;
          const Icon = opt.Icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left font-medium transition ${
                isSelected ? opt.selectedClass : opt.unselectedClass
              }`}
            >
              <Icon className="h-6 w-6 shrink-0" aria-hidden />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </CommonModal>
  );
}

export default DayStatusModal;
