export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  noPadding = false,
}) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-150 flex items-center justify-between gap-4 bg-white">
          <div className="min-w-0">
            {title && <h3 className="font-semibold text-slate-900 text-sm tracking-tight truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 sm:p-5'}>{children}</div>
    </div>
  )
}
