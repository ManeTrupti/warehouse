import { useMemo } from "react";

export function CommonSkeleton({
  variant = "text",
  width,
  height,
  count = 1,
  style: styleProp,
  ...props
}) {
  const resolvedWidth = typeof width === "number" ? `${width}px` : width;
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  const variantClass =
    variant === "circular"
      ? "rounded-full"
      : variant === "rectangular"
        ? "rounded-md"
        : "rounded-sm";

  const defaultHeight =
    variant === "circular" ? "2.5rem" : variant === "rectangular" ? "8rem" : "1rem";

  const defaultWidth = variant === "circular" ? "2.5rem" : variant === "text" ? "100%" : undefined;

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`common-skeleton-shimmer ${variantClass} overflow-hidden`}
      style={{
        width: count > 1 && variant === "text" && !resolvedWidth ? "100%" : (resolvedWidth || defaultWidth),
        height: resolvedHeight || defaultHeight,
        maxWidth: resolvedWidth || (variant === "text" ? "100%" : undefined),
      }}
      aria-hidden
    />
  ));

  return (
    <div
      className={`flex flex-col ${variant === "text" && count > 1 ? "gap-2" : ""}`}
      style={styleProp}
      {...props}
    >
      {items}
    </div>
  );
}

export default CommonSkeleton;
