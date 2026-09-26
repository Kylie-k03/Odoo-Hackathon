import { useState } from 'react'
import { Plus, Warehouse, MapPin } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Table } from '../components/common/Table'
import { PageHeader } from '../components/layout/PageHeader'

const mockWarehouses = [
  { id: 'WH1', name: 'Main Warehouse', code: 'WH-MAIN', address: 'Plot 42, Industrial Zone 1, Ahmedabad', locationsCount: 5, active: true },
  { id: 'WH2', name: 'Production Floor', code: 'WH-PROD', address: 'Assembly Facility Bay 4, Ahmedabad', locationsCount: 3, active: true },
  { id: 'WH3', name: 'Distribution Center 2', code: 'WH-DIST', address: 'Logistics Hub, Sanand', locationsCount: 8, active: true },
]

const mockLocations = [
  { id: 'LOC1', warehouse: 'Main Warehouse', name: 'WH/Stock (Bulk Receiving)', type: 'Internal', code: 'WH-STK-01' },
  { id: 'LOC2', warehouse: 'Main Warehouse', name: 'Rack A (Small Parts)', type: 'Internal', code: 'WH-RCK-A' },
  { id: 'LOC3', warehouse: 'Main Warehouse', name: 'Rack B (Fast Moving)', type: 'Internal', code: 'WH-RCK-B' },
  { id: 'LOC4', warehouse: 'Production Floor', name: 'Production Rack (WIP)', type: 'Internal', code: 'PROD-RCK' },
  { id: 'LOC5', warehouse: 'System', name: 'Customer Location (Out)', type: 'Customer', code: 'CUST-LOC' },
  { id: 'LOC6', warehouse: 'System', name: 'Scrap & Damage (Adjustment Loss)', type: 'Inventory Loss', code: 'SCRAP-01' },
]

export function SettingsWarehousePage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings & Warehouse Management"
        description="Configure physical warehouses, multi-level racks/locations, and global inventory policies."
        actions={
          <Button icon={Plus} size="sm" variant="primary">
            Add Warehouse
          </Button>
        }
      />

      <div className="space-y-5">
        {/* Warehouses Card */}
        <Card
          title="Configured Warehouses"
          subtitle="Physical sites managing stock operations"
          action={
            <Button size="sm" variant="outline" icon={Plus}>
              New Site
            </Button>
          }
        >
          <Table
            headers={[
              { label: 'Warehouse Code' },
              { label: 'Warehouse Name' },
              { label: 'Physical Address' },
              { label: 'Internal Storage', align: 'right' },
              { label: 'Status', align: 'right' },
            ]}
          >
            {mockWarehouses.map((wh) => (
              <tr key={wh.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-mono font-semibold text-xs text-slate-900">{wh.code}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-slate-800">{wh.name}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-500">{wh.address}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right text-xs tabular-nums text-slate-600">{wh.locationsCount} bins / racks</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right">
                  <Badge variant="done" size="sm" dot>Active</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        {/* Locations & Racks Card */}
        <Card
          title="Locations, Bins & Racks"
          subtitle="Granular storage hierarchy for picking, packing and transfers"
          action={
            <Button size="sm" variant="subtle" icon={MapPin}>
              Add Location
            </Button>
          }
        >
          <Table
            headers={[
              { label: 'Location Code' },
              { label: 'Parent Warehouse' },
              { label: 'Location Description' },
              { label: 'Location Type', align: 'right' },
            ]}
          >
            {mockLocations.map((loc) => (
              <tr key={loc.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-mono text-xs text-teal-700 font-semibold">{loc.code}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-700">{loc.warehouse}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-900 font-medium">{loc.name}</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-right">
                  <span className="text-[11px] font-medium bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-sm">
                    {loc.type}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  )
}
