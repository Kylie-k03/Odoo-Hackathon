import { useState } from 'react'
import { Plus, SlidersHorizontal, CheckCircle2 } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Table } from '../components/common/Table'
import { PageHeader } from '../components/layout/PageHeader'

const mockAdjustments = [
  { id: 'WH/ADJ/0001', product: 'Steel Rods (RAW-STL-001)', location: 'Production Floor (Rack B)', recordedQty: 100, physicalCount: 97, delta: -3, uom: 'kg', reason: 'Damaged materials write-off', date: '2026-09-26', status: 'done' },
  { id: 'WH/ADJ/0002', product: 'Industrial Bolts M10', location: 'Main Store (Rack B)', recordedQty: 10, physicalCount: 8, delta: -2, uom: 'pcs', reason: 'Physical cycle count adjustment', date: '2026-09-26', status: 'ready' },
  { id: 'WH/ADJ/0003', product: 'Aluminum Sheets 4x8', location: 'Main Store (WH/Stock)', recordedQty: 58, physicalCount: 60, delta: 2, uom: 'sheets', reason: 'Found unrecorded stock in Bay 3', date: '2026-09-25', status: 'done' },
]

export function InventoryAdjustmentsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory Adjustments"
        description="Reconcile recorded stock levels against physical shelf counts. Differences are automatically calculated and logged as ledger deltas."
        actions={
          <Button icon={Plus} size="sm" variant="primary">
            Start Physical Audit
          </Button>
        }
      />

      {/* Demo Callout */}
      <div className="rounded-lg border-l-4 border-l-rose-500 border border-slate-200 bg-rose-50/50 p-3.5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-rose-700 shrink-0" />
          <span>
            <strong className="font-semibold text-slate-900">Demo Flow — Step 4:</strong> Adjust damaged items &rarr; Recorded: 100 kg, Counted: 97 kg &rarr; Delta: -3 kg damaged steel written off.
          </span>
        </div>
        <span className="text-[10px] font-semibold text-rose-800 uppercase tracking-wider bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-sm">
          Core Step 4
        </span>
      </div>

      <Card
        title="Audit & Reconciliation Records"
        subtitle="Physical inventory audits vs live system balances"
      >
        <Table
          headers={[
            { label: 'Adjustment #' },
            { label: 'Product' },
            { label: 'Location' },
            { label: 'Recorded', align: 'right' },
            { label: 'Counted', align: 'right' },
            { label: 'Delta Difference', align: 'right' },
            { label: 'Audit Reason' },
            { label: 'Status' },
            { label: 'Action', align: 'right' },
          ]}
        >
          {mockAdjustments.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-mono text-xs font-semibold text-slate-900">{a.id}</td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-800 font-medium">{a.product}</td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-600 font-mono">{a.location}</td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right text-xs tabular-nums text-slate-500">
                {a.recordedQty} {a.uom}
              </td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right font-semibold text-xs tabular-nums text-slate-900">
                {a.physicalCount} {a.uom}
              </td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right font-semibold text-xs tabular-nums">
                <span className={`inline-block px-2 py-0.5 rounded-sm border ${
                  a.delta < 0
                    ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                }`}>
                  {a.delta > 0 ? `+${a.delta}` : a.delta} {a.uom}
                </span>
              </td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-600">{a.reason}</td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                <Badge variant={a.status} size="sm" dot>{a.status.toUpperCase()}</Badge>
              </td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right">
                {a.status !== 'done' ? (
                  <Button size="sm" variant="primary">
                    Apply Delta
                  </Button>
                ) : (
                  <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
