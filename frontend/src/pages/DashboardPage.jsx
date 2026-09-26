import { 
  Package, 
  AlertTriangle, 
  ArrowDownToLine, 
  Truck,
  Building2,
  Clock
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { NewActionButton } from '../components/dashboard/NewActionButton'
import { QuickActions } from '../components/dashboard/QuickActions'
import { NeedsAttention } from '../components/dashboard/NeedsAttention'
import { StockMovementChart } from '../components/dashboard/StockMovementChart'
import { ActivityFeed } from '../components/dashboard/ActivityFeed'
import { InventorySnapshot } from '../components/dashboard/InventorySnapshot'

export function DashboardPage() {
  const primaryKpis = [
    {
      title: 'Total Stock',
      value: '1,280',
      unit: 'units',
      context: '+12% this week',
      icon: Package,
      isWarning: false,
    },
    {
      title: 'Low Stock',
      value: '5',
      unit: 'items',
      context: 'Requires reorder',
      icon: AlertTriangle,
      isWarning: true,
    },
    {
      title: 'Incoming',
      value: '8',
      unit: 'receipts',
      context: '650 units pending',
      icon: ArrowDownToLine,
      isWarning: false,
    },
    {
      title: 'Outgoing',
      value: '14',
      unit: 'orders',
      context: '220 units queued',
      icon: Truck,
      isWarning: false,
    },
  ]

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5">
      {/* 1. Header (order-0 on all screens) */}
      <div className="order-0 lg:col-span-12">
        <PageHeader
          title="Inventory Dashboard"
          description={
            <span className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <strong className="font-semibold text-slate-700">Main Warehouse (WH-MAIN)</strong>
              <span>·</span>
              <Clock className="h-3 w-3 text-slate-400 shrink-0" />
              <span>Updated just now</span>
            </span>
          }
          actions={<NewActionButton />}
        />
      </div>

      {/* 2. KPI Section (order-1 on all screens) */}
      <section
        aria-label="Key Performance Indicators"
        className="order-1 lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        {primaryKpis.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <div
              key={idx}
              className={`modern-card p-5 sm:p-6 flex flex-col justify-between ${
                kpi.isWarning
                  ? 'border-rose-100 ring-1 ring-rose-500/10 highlight-card-navy'
                  : 'bg-white/80 backdrop-blur-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider ${kpi.isWarning ? 'text-white/80' : 'text-slate-500'}`}>
                  {kpi.title}
                </span>
                <div
                  className={`p-2.5 rounded-2xl ${
                    kpi.isWarning ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-gradient-to-br from-indigo-50 to-cyan-50 text-indigo-600'
                  }`}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-3xl sm:text-4xl font-bold tabular-nums tracking-tight ${
                      kpi.isWarning ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {kpi.value}
                  </span>
                  <span className={`text-xs font-medium ${kpi.isWarning ? 'text-white/70' : 'text-slate-400'}`}>{kpi.unit}</span>
                </div>

                <div
                  className={`text-[11px] mt-2 font-medium ${
                    kpi.isWarning ? 'text-white/90 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {kpi.context}
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* 3. Needs Attention
          Mobile: order-2 (critical alert priority)
          Desktop: lg:order-4, right column (col-span-5) alongside Stock Movement
      */}
      <section
        aria-label="Attention Queue"
        className="order-2 lg:order-4 lg:col-span-5"
      >
        <NeedsAttention className="h-full" />
      </section>

      {/* 4. Quick Actions
          Mobile: order-3 (accessible direct actions)
          Desktop: lg:order-2, full width strip (col-span-12)
      */}
      <section
        aria-label="Quick Actions"
        className="order-3 lg:order-2 lg:col-span-12"
      >
        <QuickActions />
      </section>

      {/* 5. Stock Movement Chart
          Mobile: order-4
          Desktop: lg:order-3, left column (col-span-7) alongside Needs Attention
      */}
      <section
        aria-label="Stock Movement Analytics"
        className="order-4 lg:order-3 lg:col-span-7"
      >
        <StockMovementChart className="h-full" />
      </section>

      {/* 6. Recent Operations Activity Feed
          Mobile: order-5
          Desktop: lg:order-5, left column (col-span-7)
      */}
      <section
        aria-label="Recent Operational Activity"
        className="order-5 lg:order-5 lg:col-span-7"
      >
        <ActivityFeed className="h-full" />
      </section>

      {/* 7. Inventory Snapshot
          Mobile: order-6
          Desktop: lg:order-6, right column (col-span-5)
      */}
      <section
        aria-label="Inventory Snapshot"
        className="order-6 lg:order-6 lg:col-span-5"
      >
        <InventorySnapshot className="h-full" />
      </section>
    </div>
  )
}
