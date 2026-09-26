import { ShieldCheck, Download, ArrowRight } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Table } from '../components/common/Table'
import { PageHeader } from '../components/layout/PageHeader'

const mockLedgerEntries = [
  {
    id: 'LEDGER-0004',
    timestamp: '2026-09-26 11:50:00',
    docRef: 'WH/ADJ/0001',
    docType: 'Stock Adjustment',
    product: 'Steel Rods (RAW-STL-001)',
    source: 'Production Floor (Rack B)',
    destination: 'Inventory Scrap / Loss',
    quantityChange: -3,
    runningBalance: 97,
    uom: 'kg',
    user: 'Warehouse Staff (Auditor)',
  },
  {
    id: 'LEDGER-0003',
    timestamp: '2026-09-26 11:20:00',
    docRef: 'WH/OUT/0001',
    docType: 'Delivery Order',
    product: 'Steel Frames (FIN-FRM-002)',
    source: 'Production Floor (Rack B)',
    destination: 'Customer (Apex Builders)',
    quantityChange: -20,
    runningBalance: 25,
    uom: 'kg',
    user: 'Warehouse Staff',
  },
  {
    id: 'LEDGER-0002',
    timestamp: '2026-09-26 10:45:00',
    docRef: 'WH/INT/0001',
    docType: 'Internal Transfer',
    product: 'Steel Rods (RAW-STL-001)',
    source: 'Main Store (WH/Stock)',
    destination: 'Production Floor (Rack B)',
    quantityChange: 0,
    runningBalance: 100,
    uom: 'kg',
    user: 'Warehouse Staff',
  },
  {
    id: 'LEDGER-0001',
    timestamp: '2026-09-26 10:15:00',
    docRef: 'WH/IN/0001',
    docType: 'Receipt (Vendor)',
    product: 'Steel Rods (RAW-STL-001)',
    source: 'Vendor (Tata Steel Mills)',
    destination: 'Main Store (WH/Stock)',
    quantityChange: 100,
    runningBalance: 100,
    uom: 'kg',
    user: 'Inventory Manager',
  },
]

export function StockLedgerPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Stock Ledger & Move History"
        description="Immutable single source of truth. Every receipt, delivery, transfer, and count adjustment is permanently recorded."
        actions={
          <Button icon={Download} variant="outline" size="sm">
            Export CSV / Audit Log
          </Button>
        }
      />

      {/* Audit Guarantee Badge */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-teal-50 border border-teal-200/80 text-teal-700 shrink-0">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900">Immutable Ledger Architecture</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Current stock is always a computed sum of ledger entries. Direct arbitrary database edits are forbidden by design.
            </div>
          </div>
        </div>
        <div className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md shrink-0">
          Audited Transactions: <strong className="font-semibold text-slate-900">{mockLedgerEntries.length}</strong>
        </div>
      </div>

      <Card
        title="Complete Movement Audit Trail"
        subtitle="Chronological sequence of all warehouse stock transitions"
      >
        <Table
          headers={[
            { label: 'Ledger ID' },
            { label: 'Timestamp' },
            { label: 'Doc Ref' },
            { label: 'Movement Type' },
            { label: 'Product' },
            { label: 'Origin → Destination' },
            { label: 'Delta', align: 'right' },
            { label: 'Balance After', align: 'right' },
            { label: 'User', align: 'right' },
          ]}
        >
          {mockLedgerEntries.map((entry) => {
            const isPositive = entry.quantityChange > 0
            const isZero = entry.quantityChange === 0
            return (
              <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-mono text-xs font-semibold text-slate-900">{entry.id}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-500 font-mono whitespace-nowrap">{entry.timestamp}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-mono text-xs font-medium text-teal-700">{entry.docRef}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-700">{entry.docType}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-900 font-medium">{entry.product}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-xs border border-slate-200/60">{entry.source}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-semibold text-slate-800 bg-teal-50/60 text-teal-900 px-1.5 py-0.5 rounded-xs border border-teal-200/60">{entry.destination}</span>
                  </div>
                </td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right font-semibold text-xs tabular-nums">
                  {isZero ? (
                    <span className="text-slate-400 font-normal">0 (Move)</span>
                  ) : (
                    <span className={isPositive ? 'text-teal-700' : 'text-rose-700'}>
                      {isPositive ? `+${entry.quantityChange}` : entry.quantityChange} {entry.uom}
                    </span>
                  )}
                </td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right font-bold text-xs tabular-nums text-slate-900">
                  {entry.runningBalance} <span className="font-normal text-slate-500">{entry.uom}</span>
                </td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right text-xs text-slate-500 whitespace-nowrap">{entry.user}</td>
              </tr>
            )
          })}
        </Table>
      </Card>
    </div>
  )
}
