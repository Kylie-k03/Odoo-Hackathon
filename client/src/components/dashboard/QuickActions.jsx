import { Link } from 'react-router-dom'
import { ArrowDownToLine, Truck, ArrowLeftRight, SlidersHorizontal, Zap } from 'lucide-react'

export function QuickActions({ className = '' }) {
  const actions = [
    {
      label: 'Receive Stock',
      shortLabel: '+ Receive',
      path: '/receipts',
      icon: ArrowDownToLine,
      color: 'text-teal-700',
      bgHover: 'hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-900',
    },
    {
      label: 'Deliver Stock',
      shortLabel: '↗ Deliver',
      path: '/delivery-orders',
      icon: Truck,
      color: 'text-slate-800',
      bgHover: 'hover:border-slate-300 hover:bg-slate-100/50 hover:text-slate-900',
    },
    {
      label: 'Transfer Stock',
      shortLabel: '⇄ Transfer',
      path: '/transfers',
      icon: ArrowLeftRight,
      color: 'text-indigo-600',
      bgHover: 'hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-900',
    },
    {
      label: 'Adjust Inventory',
      shortLabel: '± Adjust',
      path: '/adjustments',
      icon: SlidersHorizontal,
      color: 'text-cyan-700',
      bgHover: 'hover:border-cyan-300 hover:bg-cyan-50/50 hover:text-cyan-900',
    },
  ]

  return (
    <div className={`glass-card p-4 sm:p-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">
          <Zap className="h-3.5 w-3.5 text-teal-600" />
          <span>Quick Actions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
          {actions.map((act) => {
            const Icon = act.icon
            return (
              <Link
                key={act.path}
                to={act.path}
                className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 rounded-2xl sm:rounded-full border border-slate-100 bg-white px-4 py-3 sm:py-2.5 text-[13px] font-medium text-slate-700 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_-10px_rgba(0,0,0,0.15)] ${act.bgHover}`}
              >
                <div className={`p-2 rounded-full bg-slate-50/50 ${act.color}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="truncate">{act.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
