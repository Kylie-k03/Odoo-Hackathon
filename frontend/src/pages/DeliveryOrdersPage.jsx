import { useState } from 'react'
import { Plus, Truck, CheckCircle2, Check, PackageCheck } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Table } from '../components/common/Table'
import { PageHeader } from '../components/layout/PageHeader'

const mockDeliveries = [
  { id: 'WH/OUT/0001', customer: 'Apex Industrial Builders', orderRef: 'SO-2026-089', product: 'Steel Frames (FIN-FRM-002)', qty: 20, uom: 'kg', stage: 'Picked', status: 'ready' },
  { id: 'WH/OUT/0002', customer: 'Prime Structures Ltd', orderRef: 'SO-2026-092', product: 'Steel Rods (RAW-STL-001)', qty: 15, uom: 'kg', stage: 'Packed', status: 'waiting' },
  { id: 'WH/OUT/0003', customer: 'Urban Living Interiors', orderRef: 'SO-2026-081', product: 'Dining Chairs Solid Wood', qty: 10, uom: 'units', stage: 'Shipped', status: 'done' },
]

export function DeliveryOrdersPage() {
  const [viewMode, setViewMode] = useState('list')

  return (
    <div className="space-y-5">
      <PageHeader
        title="Delivery Orders (Outgoing Goods)"
        description="Pick, pack, and validate customer shipments. Validation automatically decrements stock levels."
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
              New Delivery Order
            </Button>
          </div>
        }
      />

      {/* Demo Callout */}
      <div className="rounded-lg border-l-4 border-l-amber-500 border border-slate-200 bg-amber-50/50 p-3.5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-slate-800">
          <Truck className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong className="font-semibold text-slate-900">Demo Flow — Step 3:</strong> Deliver 20 kg finished steel frames to customer &rarr; Pick &rarr; Pack &rarr; Validate &rarr; Stock -20.
          </span>
        </div>
        <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-sm">
          Core Step 3
        </span>
      </div>

      {viewMode === 'list' ? (
        <Card
          title="Active Customer Deliveries"
          subtitle="Orders queued for warehouse picking, packing and dispatch"
        >
          <Table
            headers={[
              { label: 'Delivery #' },
              { label: 'Customer' },
              { label: 'Order Ref' },
              { label: 'Product' },
              { label: 'Quantity', align: 'right' },
              { label: 'Fulfillment Stage' },
              { label: 'Status' },
              { label: 'Action', align: 'right' },
            ]}
          >
            {mockDeliveries.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-mono text-xs font-semibold text-slate-900">{d.id}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-800 font-medium">{d.customer}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-mono text-xs text-slate-600">{d.orderRef}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-700">{d.product}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right font-semibold text-xs tabular-nums text-rose-700">
                  -{d.qty} {d.uom}
                </td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                    <PackageCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{d.stage}</span>
                  </span>
                </td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                  <Badge variant={d.status} size="sm" dot>{d.status.toUpperCase()}</Badge>
                </td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right">
                  {d.status !== 'done' ? (
                    <Button size="sm" variant="primary" icon={Check}>
                      Validate & Ship
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {['Draft', 'Waiting', 'Ready', 'Done'].map((col) => {
            const items = mockDeliveries.filter(d => d.status.toLowerCase() === col.toLowerCase())
            return (
              <div key={col} className="bg-slate-100/80 rounded-lg p-3 border border-slate-200 min-h-[320px] flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">{col}</span>
                  <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold tabular-nums">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2 flex-1">
                  {items.map(d => (
                    <div key={d.id} className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-semibold text-slate-900">{d.id}</span>
                        <span className="text-xs font-semibold tabular-nums text-rose-700">-{d.qty} {d.uom}</span>
                      </div>
                      <div className="text-xs text-slate-700 font-medium">{d.customer}</div>
                      <div className="text-[11px] text-slate-500 truncate">{d.product}</div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-400 font-mono">{d.orderRef}</span>
                        <span className="text-teal-700 bg-teal-50 border border-teal-200/60 px-1.5 py-0.5 rounded-xs font-medium">
                          {d.stage}
                        </span>
                      </div>
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
