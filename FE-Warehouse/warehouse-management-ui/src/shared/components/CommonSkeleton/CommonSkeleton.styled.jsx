export const getSkeletonBaseStyles = (theme, variant, width, height) => {
  const base = {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  };
  if (width) base.width = typeof width === 'number' ? `${width}px` : width;
  if (height) base.height = typeof height === 'number' ? `${height}px` : height;

  switch (variant) {
    case 'text':
      return {
        ...base,
        height: height || '1rem',
        borderRadius: theme.borderRadius.sm,
      };
    case 'circular':
      return {
        ...base,
        borderRadius: '50%',
        width: width || '2.5rem',
        height: height || '2.5rem',
        aspectRatio: '1',
      };
    case 'rectangular':
    default:
      return {
        ...base,
        height: height || '8rem',
      };
  }
};
