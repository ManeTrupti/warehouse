import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";

export function CommonModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  ...props
}) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const sizeClass =
    ({
      sm: "max-w-sm",
      md: "max-w-xl",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      "2xl": "max-w-5xl",
      full: "max-w-[90vw] w-[90vw]",
    })[size] || "max-w-lg";

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 150);
  };

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-900/35 p-4 backdrop-blur-sm transition-opacity duration-150 md:p-6 ${isClosing ? "opacity-0" : "opacity-100"}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full ${sizeClass} max-h-[90vh] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl transition-transform duration-150 ${isClosing ? "scale-95" : "scale-100"}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <div className="flex h-full max-h-[90vh] flex-col">
          {title && (
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 pb-4 pt-5">
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
              {showCloseButton && (
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-slate-500 transition-all hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                  onClick={handleClose}
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto bg-white p-5">{children}</div>
          {footer && <div className="common-modal-footer flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 pb-5 pt-4">{footer}</div>}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
}

export default CommonModal;

