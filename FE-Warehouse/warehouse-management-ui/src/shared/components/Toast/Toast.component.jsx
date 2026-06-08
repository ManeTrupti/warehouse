import { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

const Toast = ({ message, type = TOAST_TYPES.INFO, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const baseClasses =
    'flex min-w-[300px] max-w-[500px] items-center gap-3 rounded-md border px-4 py-3 shadow-lg transition-all duration-300';

  const visibilityClasses = isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';

  const typeClasses =
    type === TOAST_TYPES.SUCCESS
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : type === TOAST_TYPES.ERROR
        ? 'border-red-200 bg-red-50 text-red-700'
        : type === TOAST_TYPES.WARNING
          ? 'border-amber-200 bg-amber-50 text-amber-700'
          : 'border-blue-200 bg-blue-50 text-blue-700';

  const getIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircleIcon className="h-5 w-5 shrink-0" />;
      case TOAST_TYPES.ERROR:
        return <ExclamationCircleIcon className="h-5 w-5 shrink-0" />;
      case TOAST_TYPES.WARNING:
        return <ExclamationCircleIcon className="h-5 w-5 shrink-0" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 shrink-0" />;
    }
  };

  return (
    <div className={`${baseClasses} ${visibilityClasses} ${typeClasses}`}>
      {getIcon()}
      <div className="flex-1 text-sm">
        {message}
      </div>
      <button
        onClick={handleClose}
        className="flex items-center p-1 text-inherit opacity-70 hover:opacity-100"
        aria-label="Close toast"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="pointer-events-none fixed right-5 top-5 z-[10000] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export { TOAST_TYPES };
export default Toast;

