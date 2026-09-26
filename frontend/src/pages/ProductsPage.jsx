import { useState } from 'react'
import { Plus, Search, AlertCircle } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Table } from '../components/common/Table'
import { PageHeader } from '../components/layout/PageHeader'

const mockProducts = [
  { id: 1, name: 'Steel Rods', sku: 'RAW-STL-001', category: 'Raw Materials', uom: 'kg', onHand: 100, minStock: 25, location: 'Main Warehouse' },
  { id: 2, name: 'Steel Frames', sku: 'FIN-FRM-002', category: 'Finished Goods', uom: 'units', onHand: 45, minStock: 10, location: 'Production Floor' },
  { id: 3, name: 'Industrial Bolts M10', sku: 'HRD-BLT-010', category: 'Hardware', uom: 'pcs', onHand: 8, minStock: 50, location: 'Rack B' },
  { id: 4, name: 'Aluminum Sheets 4x8', sku: 'RAW-ALM-004', category: 'Raw Materials', uom: 'sheets', onHand: 60, minStock: 15, location: 'Main Warehouse' },
]

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products & Inventory Items"
        description="Manage product definitions, SKUs, categories, units of measure, and reordering rules."
        actions={
          <Button icon={Plus} size="sm" variant="primary">
            Add Product
          </Button>
        }
      />

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name, SKU, or category..."
              className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 hover:border-slate-300 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select className="h-8 rounded-md border border-slate-200 bg-slate-50 hover:border-slate-300 px-2.5 text-xs font-medium text-slate-700 transition-colors focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 cursor-pointer">
              <option value="all">All Categories</option>
              <option value="raw">Raw Materials</option>
              <option value="finished">Finished Goods</option>
              <option value="hardware">Hardware</option>
            </select>
          </div>
        </div>
      </div>

      <Card
        title="Active Product Master"
        subtitle="Catalog of items tracked across all warehouse storage nodes"
      >
        <Table
          headers={[
            { label: 'Product Name' },
            { label: 'SKU / Code' },
            { label: 'Category' },
            { label: 'Unit' },
            { label: 'Current Stock', align: 'right' },
            { label: 'Reorder Min', align: 'right' },
            { label: 'Location' },
            { label: 'Status' },
          ]}
        >
          {mockProducts.map((p) => {
            const isLow = p.onHand <= p.minStock
            return (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-semibold text-xs text-slate-900">{p.name}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-mono text-xs text-slate-600">{p.sku}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-600">{p.category}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-500">{p.uom}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right font-semibold text-xs tabular-nums text-slate-900">
                  {p.onHand} <span className="font-normal text-slate-500">{p.uom}</span>
                </td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right text-xs tabular-nums text-slate-500">
                  {p.minStock} {p.uom}
                </td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-600">{p.location}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                  {isLow ? (
                    <Badge variant="low-stock" size="sm" dot>
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="done" size="sm" dot>
                      Normal
                    </Badge>
                  )}
                </td>
              </tr>
            )
          })}
        </Table>
      </Card>
    </div>
  )
}
