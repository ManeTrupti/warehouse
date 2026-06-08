/**
 * SQDE (Safety, Quality, Delivery, Environment) category configuration.
 * Icon names match @heroicons/react/24/outline component names.
 */
export const SQDE_CATEGORIES = [
  {
    id: 'safety',
    label: 'S - Safety',
    shortLabel: 'Safety',
    letter: 'safety',
    icon: 'ShieldCheckIcon',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'quality',
    label: 'Q - Quality',
    shortLabel: 'Quality',
    letter: 'quality',
    icon: 'ChartBarIcon',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    id: 'delivery',
    label: 'D - Delivery',
    shortLabel: 'Delivery',
    letter: 'delivery',
    icon: 'TruckIcon',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  {
    id: 'environment',
    label: 'E - Environment',
    shortLabel: 'Environment',
    letter: 'environment',
    icon: 'GlobeAltIcon',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
];

export const STATUS_OPTIONS = [
  { value: 'ok', label: 'OK', className: 'bg-green-500 text-white border-green-500' },
  { value: 'not_ok', label: 'NOT OK', className: 'bg-white text-red-600 border-red-300' },
  { value: 'no_plan', label: 'NO PLAN', className: 'bg-white text-slate-500 border-slate-300' },
];
