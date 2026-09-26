import { Link } from 'react-router-dom'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { ArrowDownToLine, Truck, ArrowLeftRight, SlidersHorizontal, ArrowUpRight } from 'lucide-react'

export const defaultRecentActivities = [
  {
    id: 'op-1',
    type: 'Receipt',
    docRef: 'WH/IN/0001',
    product: 'Steel Rods (RAW-STL-001)',
    partner: 'Tata Steel Mills',
    delta: '+100 kg',
    isPositive: true,
    time: '10 min ago',
    status: 'done',
    path: '/receipts',
    icon: ArrowDownToLine,
    color: 'text-teal-700 bg-teal-50 border-teal-200/80',
  },
  {
    id: 'op-2',
    type: 'Internal Transfer',
    docRef: 'WH/INT/0001',
    product: 'Steel Rods (RAW-STL-001)',
    partner: 'Main Store → Production Rack',
    delta: '100 kg moved',
    isNeutral: true,
    time: '25 min ago',
    status: 'done',
    path: '/transfers',
    icon: ArrowLeftRight,
    color: 'text-slate-700 bg-slate-100 border-slate-200',
  },
  {
    id: 'op-3',
    type: 'Delivery Order',
    docRef: 'WH/OUT/0001',
    product: 'Steel Frames (FIN-FRM-002)',
    partner: 'Apex Industrial Builders',
    delta: '-20 kg',
    isPositive: false,
    time: '45 min ago',
    status: 'ready',
    path: '/delivery-orders',
    icon: Truck,
    color: 'text-amber-700 bg-amber-50 border-amber-200/80',
  },
  {
    id: 'op-4',
    type: 'Stock Adjustment',
    docRef: 'WH/ADJ/0001',
    product: 'Steel Rods (Damaged items)',
    partner: 'Production Floor · Rack B',
    delta: '-3 kg',
    isPositive: false,
    time: '1 hr ago',
    status: 'done',
    path: '/adjustments',
    icon: SlidersHorizontal,
    color: 'text-rose-700 bg-rose-50 border-rose-200/80',
  },
  {
    id: 'op-5',
    type: 'Receipt',
    docRef: 'WH/IN/0002',
    product: 'Industrial Bolts M10',
    partner: 'Global Fasteners Co',
    delta: '+500 pcs',
    isPositive: true,
    time: '2 hrs ago',
    status: 'waiting',
    path: '/receipts',
    icon: ArrowDownToLine,
    color: 'text-teal-700 bg-teal-50 border-teal-200/80',
  },
]

export function ActivityFeed({ activities = defaultRecentActivities, className = '' }) {
  return (
    <Card
      className={className}
      title="Recent Operations"
      subtitle="Chronological feed of warehouse transactions"
      action={
        <Link
          to="/ledger"
          className="text-xs text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>Stock Ledger</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="divide-y divide-slate-100">
        {activities.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              to={item.path}
              className="flex items-center justify-between p-2.5 sm:px-3 sm:py-3 hover:bg-slate-50/80 rounded-md transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <div className={`p-2 rounded-md border shrink-0 ${item.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {item.docRef}
                    </span>
                    <span className="text-[11px] text-slate-400">·</span>
                    <span className="text-[11px] font-medium text-slate-600 truncate">{item.type}</span>
                  </div>

                  <div className="text-xs text-slate-700 truncate mt-0.5">
                    {item.product}
                  </div>

                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.partner}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div
                  className={`text-xs font-semibold tabular-nums ${
                    item.isNeutral
                      ? 'text-slate-700'
                      : item.isPositive
                      ? 'text-teal-700'
                      : 'text-rose-700'
                  }`}
                >
                  {item.delta}
                </div>

                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <Badge variant={item.status} size="sm" dot>
                    {item.status}
                  </Badge>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
