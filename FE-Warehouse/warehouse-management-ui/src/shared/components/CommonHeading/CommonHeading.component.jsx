export function CommonHeading({ title, subtitle, rightContent }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-slate-100 bg-white px-5 py-4 shadow-sm">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="m-0 text-sm text-slate-600">{subtitle}</p>}
      </div>

      {rightContent && <div className="ml-auto flex flex-wrap items-center justify-end gap-2">{rightContent}</div>}
    </div>
  );
}

export default CommonHeading;
