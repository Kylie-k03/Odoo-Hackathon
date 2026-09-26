import { Link } from 'react-router-dom'
import { AlertCircle, AlertTriangle, Clock, ArrowRight, CheckCircle2 } from 'lucide-react'

export const defaultAttentionItems = [
  {
    id: 'att-1',
    severity: 'critical',
    severityLabel: 'Critical Low Stock',
    title: 'Industrial Bolts M10',
    subtitle: 'Below reorder point (8 on hand / 50 min threshold)',
    location: 'Main Store · Rack B',
    actionText: 'View',
    actionPath: '/products',
  },
  {
    id: 'att-2',
    severity: 'warning',
    severityLabel: 'Receipt Pending',
    title: 'WH/IN/0002 — Global Fasteners Co',
    subtitle: '500 pcs received at dock; awaiting intake validation',
    location: 'Main Warehouse · Receiving Dock 2',
    actionText: 'Review',
    actionPath: '/receipts',
  },
  {
    id: 'att-3',
    severity: 'warning',
    severityLabel: 'Ready for Dispatch',
    title: 'WH/OUT/0001 — Apex Builders',
    subtitle: '20 kg Steel Frames picked & packed; ready to ship',
    location: 'Production Floor · Staging Bay 1',
    actionText: 'Review',
    actionPath: '/delivery-orders',
  },
  {
    id: 'att-4',
    severity: 'info',
    severityLabel: 'Count Audit Review',
    title: 'WH/ADJ/0002 — Physical Cycle Count',
    subtitle: 'Delta mismatch (-2 pcs) recorded; requires sign-off',
    location: 'Main Store · Rack B',
    actionText: 'Review',
    actionPath: '/adjustments',
  },
]

export function NeedsAttention({ items = defaultAttentionItems, className = '' }) {
  const count = items.length

  return (
    <div className={`rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Needs Attention
          </h2>
        </div>
        <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-200/80 px-2 py-0.5 text-[11px] font-semibold text-rose-700 tabular-nums">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Operational Queue */}
      <div className="divide-y divide-slate-100 flex-1">
        {count === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-xs font-semibold text-slate-800">No inventory alerts right now</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Everything is within its reorder thresholds and pending documents are reconciled.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isCritical = item.severity === 'critical'
            const isWarning = item.severity === 'warning'

            return (
              <div
                key={item.id}
                className="p-3.5 sm:px-5 sm:py-3.5 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {/* Status Indicator Dot */}
                  <span
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      isCritical
                        ? 'bg-rose-500 ring-2 ring-rose-100'
                        : isWarning
                        ? 'bg-amber-500 ring-2 ring-amber-100'
                        : 'bg-teal-500 ring-2 ring-teal-100'
                    }`}
                    aria-hidden="true"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {item.title}
                      </span>
                      {/* Textual accessibility badge so color is never the sole indicator */}
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded-xs border ${
                          isCritical
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isWarning
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.severityLabel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                      {item.subtitle}
                    </p>

                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      {item.location}
                    </div>
                  </div>
                </div>

                {/* Compact Action Link */}
                <Link
                  to={item.actionPath}
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 px-2.5 py-1 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
