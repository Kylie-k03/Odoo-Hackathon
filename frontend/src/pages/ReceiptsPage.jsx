import { useState } from 'react'
import { Plus, ArrowDownToLine, CheckCircle2, Check } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Table } from '../components/common/Table'
import { PageHeader } from '../components/layout/PageHeader'

const mockReceipts = [
  { id: 'WH/IN/0001', vendor: 'Tata Steel Mills', product: 'Steel Rods (RAW-STL-001)', destination: 'Main Warehouse / WH/Stock', qty: 100, uom: 'kg', date: '2026-09-26', status: 'done' },
  { id: 'WH/IN/0002', vendor: 'Global Fasteners Co', product: 'Industrial Bolts M10', destination: 'Main Warehouse / Rack B', qty: 500, uom: 'pcs', date: '2026-09-26', status: 'ready' },
  { id: 'WH/IN/0003', vendor: 'Alloy World Corp', product: 'Aluminum Sheets 4x8', destination: 'Main Warehouse / WH/Stock', qty: 50, uom: 'sheets', date: '2026-09-27', status: 'waiting' },
]

export function ReceiptsPage() {
  const [viewMode, setViewMode] = useState('list') // 'list' | 'kanban'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Receipts (Incoming Stock)"
        description="Receive items from vendors into designated warehouse locations. Validation auto-increments stock levels."
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Kanban
              </button>
            </div>
            <Button icon={Plus} size="sm" variant="primary">
              New Receipt
            </Button>
          </div>
        }
      />

      {/* Demo Callout */}
      <div className="rounded-lg border-l-4 border-l-teal-600 border border-slate-200 bg-teal-50/50 p-3.5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-slate-800">
          <ArrowDownToLine className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            <strong className="font-semibold text-slate-900">Demo Flow — Step 1:</strong> Receive 100 kg "Steel Rods" from vendor &rarr; Validate Receipt &rarr; Stock +100 logged to Ledger.
          </span>
        </div>
        <span className="text-[10px] font-semibold text-teal-800 uppercase tracking-wider bg-teal-100/70 border border-teal-200 px-2 py-0.5 rounded-sm">
          Core Step 1
        </span>
      </div>

      {viewMode === 'list' ? (
        <Card
          title="Incoming Shipments"
          subtitle="Vendor delivery receipts awaiting intake verification"
        >
          <Table
            headers={[
              { label: 'Receipt #' },
              { label: 'Vendor / Supplier' },
              { label: 'Product' },
              { label: 'Destination Location' },
              { label: 'Quantity', align: 'right' },
              { label: 'Date' },
              { label: 'Status' },
              { label: 'Actions', align: 'right' },
            ]}
          >
            {mockReceipts.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-mono text-xs font-semibold text-slate-900">{r.id}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-800 font-medium">{r.vendor}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-700">{r.product}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-600 font-mono">{r.destination}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right font-semibold text-xs tabular-nums text-teal-700">
                  +{r.qty} {r.uom}
                </td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-500">{r.date}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                  <Badge variant={r.status} size="sm" dot>{r.status.toUpperCase()}</Badge>
                </td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right">
                  {r.status !== 'done' ? (
                    <Button size="sm" variant="subtle" icon={Check}>
                      Validate
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {['Draft', 'Waiting', 'Ready', 'Done'].map((col) => {
            const items = mockReceipts.filter(r => r.status.toLowerCase() === col.toLowerCase())
            return (
              <div key={col} className="bg-slate-100/80 rounded-lg p-3 border border-slate-200 min-h-[320px] flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">{col}</span>
                  <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold tabular-nums">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2 flex-1">
                  {items.map(r => (
                    <div key={r.id} className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-semibold text-slate-900">{r.id}</span>
                        <span className="text-xs font-semibold tabular-nums text-teal-700">+{r.qty} {r.uom}</span>
                      </div>
                      <div className="text-xs text-slate-700 font-medium">{r.vendor}</div>
                      <div className="text-[11px] text-slate-500 truncate">{r.product}</div>
                      <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">{r.destination}</div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-xs text-slate-400 italic">
                      No documents
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
