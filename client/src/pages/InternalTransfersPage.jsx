import { useState } from 'react'
import { Plus, ArrowLeftRight, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Table } from '../components/common/Table'
import { PageHeader } from '../components/layout/PageHeader'

const mockTransfers = [
  { id: 'WH/INT/0001', product: 'Steel Rods (RAW-STL-001)', fromLocation: 'Main Store (WH/Stock)', toLocation: 'Production Floor (Rack B)', qty: 100, uom: 'kg', date: '2026-09-26', status: 'done' },
  { id: 'WH/INT/0002', product: 'Industrial Bolts M10', fromLocation: 'Main Store (WH/Stock)', toLocation: 'Assembly Line 1', qty: 150, uom: 'pcs', date: '2026-09-26', status: 'ready' },
  { id: 'WH/INT/0003', product: 'Aluminum Sheets 4x8', fromLocation: 'Warehouse 1 (Bay A)', toLocation: 'Warehouse 2 (Staging)', qty: 25, uom: 'sheets', date: '2026-09-27', status: 'draft' },
]

export function InternalTransfersPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Internal Transfers"
        description="Move items between warehouses, racks, and shop floors. Total company stock remains unchanged; per-location stock updates."
        actions={
          <Button icon={Plus} size="sm" variant="primary">
            Create Internal Transfer
          </Button>
        }
      />

      {/* Demo Callout */}
      <div className="rounded-lg border-l-4 border-l-teal-600 border border-slate-200 bg-teal-50/50 p-3.5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-slate-800">
          <ArrowLeftRight className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            <strong className="font-semibold text-slate-900">Demo Flow — Step 2:</strong> Internal transfer: Main Store &rarr; Production Rack (100 kg Steel Rods). Total stock unchanged; location updated; logged in ledger.
          </span>
        </div>
        <span className="text-[10px] font-semibold text-teal-800 uppercase tracking-wider bg-teal-100/70 border border-teal-200 px-2 py-0.5 rounded-sm">
          Core Step 2
        </span>
      </div>

      <Card
        title="Internal Relocations"
        subtitle="Active transfers between warehouse bays, racks, and workstations"
      >
        <Table
          headers={[
            { label: 'Transfer #' },
            { label: 'Product' },
            { label: 'Routing (Origin → Destination)' },
            { label: 'Quantity', align: 'right' },
            { label: 'Date' },
            { label: 'Status' },
            { label: 'Action', align: 'right' },
          ]}
        >
          {mockTransfers.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-mono text-xs font-semibold text-slate-900">{t.id}</td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-800 font-medium">{t.product}</td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-xs border border-slate-200/60">{t.fromLocation}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="font-semibold text-slate-800 bg-teal-50/60 text-teal-900 px-1.5 py-0.5 rounded-xs border border-teal-200/60">{t.toLocation}</span>
                </div>
              </td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right font-semibold text-xs tabular-nums text-slate-900">
                {t.qty} <span className="font-normal text-slate-500">{t.uom}</span>
              </td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-500">{t.date}</td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                <Badge variant={t.status} size="sm" dot>{t.status.toUpperCase()}</Badge>
              </td>
              <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right">
                {t.status !== 'done' ? (
                  <Button size="sm" variant="subtle">
                    Execute Transfer
                  </Button>
                ) : (
                  <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
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
