export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 ease-in-out cursor-pointer select-none focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-md'

  const variantStyles = {
    primary: 'bg-teal-600 text-white border border-teal-600 hover:bg-teal-700 hover:border-teal-700 active:bg-teal-800 focus:ring-2 focus:ring-teal-500/30 focus:ring-offset-1 shadow-xs',
    secondary: 'bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 hover:border-slate-800 active:bg-slate-950 focus:ring-2 focus:ring-slate-900/20 shadow-xs',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 active:bg-slate-100 focus:ring-2 focus:ring-slate-400/20 shadow-xs',
    subtle: 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 hover:border-teal-300 active:bg-teal-200/60 focus:ring-2 focus:ring-teal-500/20',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/70 focus:ring-2 focus:ring-slate-300',
    danger: 'bg-rose-600 text-white border border-rose-600 hover:bg-rose-700 hover:border-rose-700 active:bg-rose-800 focus:ring-2 focus:ring-rose-500/20 shadow-xs',
  }

  const sizeStyles = {
    sm: 'h-8 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-3.5 text-xs sm:text-sm gap-2',
    lg: 'h-10 px-4 text-sm gap-2.5',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0'} />}
      <span>{children}</span>
    </button>
  )
}
