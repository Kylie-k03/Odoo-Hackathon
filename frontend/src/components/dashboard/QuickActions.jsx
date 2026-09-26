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
      bgHover: 'hover:border-teal-300 hover:bg-teal-50/40',
    },
    {
      label: 'Deliver Stock',
      shortLabel: '↗ Deliver',
      path: '/delivery-orders',
      icon: Truck,
      color: 'text-amber-700',
      bgHover: 'hover:border-amber-300 hover:bg-amber-50/40',
    },
    {
      label: 'Transfer Stock',
      shortLabel: '⇄ Transfer',
      path: '/transfers',
      icon: ArrowLeftRight,
      color: 'text-slate-700',
      bgHover: 'hover:border-slate-400 hover:bg-slate-100/60',
    },
    {
      label: 'Adjust Inventory',
      shortLabel: '± Adjust',
      path: '/adjustments',
      icon: SlidersHorizontal,
      color: 'text-rose-700',
      bgHover: 'hover:border-rose-300 hover:bg-rose-50/40',
    },
  ]

  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs ${className}`}>
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
                className={`flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 ${act.bgHover}`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${act.color}`} />
                <span className="truncate">{act.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
