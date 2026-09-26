import { Link } from 'react-router-dom'
import { Card } from '../common/Card'
import { ArrowUpRight, AlertTriangle, Layers } from 'lucide-react'

const topStocked = [
  { name: 'Steel Rods', sku: 'RAW-STL-001', category: 'Raw Materials', qty: 100, max: 120, uom: 'kg', location: 'Main Store' },
  { name: 'Aluminum Sheets 4x8', sku: 'RAW-ALM-004', category: 'Raw Materials', qty: 60, max: 120, uom: 'sheets', location: 'Bay 3' },
  { name: 'Steel Frames', sku: 'FIN-FRM-002', category: 'Finished Goods', qty: 45, max: 120, uom: 'units', location: 'Production Floor' },
]

const thresholdRisk = [
  { name: 'Industrial Bolts M10', sku: 'HRD-BLT-010', current: 8, min: 50, uom: 'pcs', percent: 16, isCritical: true },
  { name: 'Steel Frames', sku: 'FIN-FRM-002', current: 45, min: 10, uom: 'units', percent: 100, isCritical: false },
  { name: 'Aluminum Sheets', sku: 'RAW-ALM-004', current: 60, min: 15, uom: 'sheets', percent: 100, isCritical: false },
  { name: 'Steel Rods', sku: 'RAW-STL-001', current: 100, min: 25, uom: 'kg', percent: 100, isCritical: false },
]

export function InventorySnapshot({ className = '' }) {
  return (
    <Card
      className={className}
      title="Inventory Snapshot"
      subtitle="Stock volume distribution & reorder safety thresholds"
      action={
        <Link
          to="/products"
          className="text-xs text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>All Products</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Section 1: Highest Volume Stock */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-slate-500" /> Top Stocked Assets
            </span>
            <span>Capacity</span>
          </div>

          <div className="space-y-2.5">
            {topStocked.map((item) => {
              const fillPct = Math.min(Math.round((item.qty / item.max) * 100), 100)
              return (
                <div key={item.sku} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="tabular-nums font-semibold text-slate-900">
                      {item.qty} <span className="font-normal text-slate-500 text-[11px]">{item.uom}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600 transition-all duration-300"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 w-16 text-right">
                      {item.location}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-rose-500" /> Reorder Safety Proximity
            </span>
            <span>Min Target</span>
          </div>

          <div className="space-y-2.5">
            {thresholdRisk.map((item) => (
              <div key={item.sku} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-800 flex items-center gap-1.5 font-medium">
                    {item.name}
                    {item.isCritical && (
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-1 py-0.2 rounded-xs uppercase">
                        Stockout Risk
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums text-xs">
                    <strong className={item.isCritical ? 'text-rose-700 font-bold' : 'text-slate-900 font-semibold'}>
                      {item.current}
                    </strong>
                    <span className="text-slate-400 font-normal"> / {item.min} {item.uom}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.isCritical ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
