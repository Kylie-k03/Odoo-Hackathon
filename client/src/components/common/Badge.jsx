export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-teal-50 text-teal-800 border-teal-200/80',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    'low-stock': 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-sky-50 text-sky-800 border-sky-200/80',
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    waiting: 'bg-amber-50 text-amber-800 border-amber-200/80',
    ready: 'bg-sky-50 text-sky-800 border-sky-200/80',
    done: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    canceled: 'bg-rose-50 text-rose-700 border-rose-200/80',
  }

  const dotStyles = {
    default: 'bg-slate-400',
    primary: 'bg-teal-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    'low-stock': 'bg-rose-500',
    info: 'bg-sky-500',
    draft: 'bg-slate-400',
    waiting: 'bg-amber-500',
    ready: 'bg-sky-500',
    done: 'bg-emerald-500',
    canceled: 'bg-rose-500',
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-2',
  }

  const normalizedVariant = variantStyles[variant.toLowerCase()] ? variant.toLowerCase() : 'default'

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-medium tracking-tight ${variantStyles[normalizedVariant]} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotStyles[normalizedVariant] || 'bg-slate-400'}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  )
}
