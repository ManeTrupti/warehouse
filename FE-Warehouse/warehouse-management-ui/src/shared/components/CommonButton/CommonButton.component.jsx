import { useMemo } from "react";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const ACTION_STYLES = {
  add: { variant: "primary", icon: PlusIcon },
  create: { variant: "primary", icon: PlusIcon },
  save: { variant: "primary"},
  update: { variant: "primary", icon: CheckIcon },
  edit: { variant: "warning", icon: PencilIcon },
  delete: { variant: "danger", icon: TrashIcon },
  remove: { variant: "danger", icon: TrashIcon },
  cancel: { variant: "secondary"},
  close: { variant: "secondary", icon: XMarkIcon },
  view: { variant: "outline", icon: EyeIcon },
  search: { variant: "outline", icon: MagnifyingGlassIcon },
  filter: { variant: "outline", icon: FunnelIcon },
  export: { variant: "secondary", icon: ArrowDownTrayIcon },
  import: { variant: "secondary", icon: ArrowUpTrayIcon },
  upload: { variant: "secondary", icon: ArrowUpTrayIcon },
  download: { variant: "secondary", icon: ArrowDownTrayIcon },
};

const inferActionFromChildren = (children) => {
  if (typeof children !== "string") return null;
  const normalized = children.trim().toLowerCase();
  return Object.keys(ACTION_STYLES).find(
    (actionKey) =>
      normalized === actionKey || normalized.startsWith(`${actionKey} `),
  );
};

export function CommonButton({
  children,
  onClick,
  variant = "primary",
  action,
  size = "md",
  disabled = false,
  isLoading = false,
  type = "button",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  ...props
}) {
  const resolvedAction = useMemo(
    () => action || inferActionFromChildren(children),
    [action, children],
  );
  const actionConfig = resolvedAction ? ACTION_STYLES[resolvedAction] : null;
  const resolvedVariant =
    variant === "primary" && actionConfig ? actionConfig.variant : variant;
  const ResolvedIcon = Icon || actionConfig?.icon;

  const sizeClasses = useMemo(
    () =>
      ({
        xs: "px-2 py-1 text-xs",
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-5 py-2.5 text-lg",
      })[size] || "px-4 py-2 text-base",
    [size],
  );

  const variantClasses = useMemo(
    () =>
      ({
        primary:
          "border border-indigo-500 bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 hover:border-indigo-600",
        secondary:
          "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-800",
        success:
          "border border-emerald-500 bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:border-emerald-600",
        danger:
          "border border-red-500 bg-red-500 text-white shadow-sm hover:bg-red-600 hover:border-red-600",
        warning:
          "border border-amber-500 bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:border-amber-600",
        outline:
          "border border-indigo-500 bg-white text-indigo-600 hover:bg-indigo-50",
        ghost:
          "border border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900",
      })[resolvedVariant] || "border border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600",
    [resolvedVariant],
  );

  const buttonClasses = [
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1",
    sizeClasses,
    variantClasses,
    fullWidth ? "w-full" : "w-auto",
    disabled || isLoading ? "cursor-not-allowed opacity-60 saturate-50" : "cursor-pointer",
  ].join(" ");

  const handleClick = (e) => {
    if (!disabled && !isLoading && onClick) {
      onClick(e);
    }
  };

  const renderContent = () => {
    const hasChildren = !!children;

    if (isLoading) {
      return (
        <>
          <span className={Icon ? "mr-2" : ""}>
            Loading...
          </span>
        </>
      );
    }

    if (ResolvedIcon) {
      if (iconPosition === "left") {
        return (
          <>
            <ResolvedIcon className={`h-4 w-4 ${hasChildren ? "mr-2" : ""}`} />
            {children}
          </>
        );
      } else {
        return (
          <>
            {children}
            <ResolvedIcon className={`h-4 w-4 ${hasChildren ? "ml-2" : ""}`} />
          </>
        );
      }
    }

    return children;
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {renderContent()}
    </button>
  );
}

export default CommonButton;

