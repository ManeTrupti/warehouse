export function CommonLoader({
  size = 'md',
  message,
  overlay = false,
  variant = 'spinner', // 'spinner' | 'dots'
  ...props
}) {
  const sizeClasses =
    size === 'sm'
      ? 'h-5 w-5 border-2'
      : size === 'lg'
        ? 'h-12 w-12 border-4'
        : 'h-8 w-8 border-2';

  const loaderElement =
    variant === 'dots' ? (
      <div
        className="flex items-center justify-center gap-1"
        role="status"
        aria-label="Loading"
      >
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-sky-500"
            style={{ animationDelay: `${(i - 1) * 0.15}s` }}
          />
        ))}
      </div>
    ) : (
      <div
        className={`inline-block rounded-full border-slate-200 border-t-sky-500 animate-spin ${sizeClasses}`}
        role="status"
        aria-label="Loading"
      />
    );

  const content = (
    <>
      {loaderElement}
      {message && (
        <p className="text-sm font-medium text-slate-700">{message}</p>
      )}
    </>
  );

  if (overlay) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm"
        {...props}
      >
        <div className="flex flex-col items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-lg">
        {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      {...props}
    >
      {content}
    </div>
  );
}

export default CommonLoader;
