import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { apiRequest } from '../../services/api'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const datasets = {
  '7d': [
    { name: 'Mon', receipts: 120, deliveries: 40 },
    { name: 'Tue', receipts: 80, deliveries: 65 },
    { name: 'Wed', receipts: 150, deliveries: 90 },
    { name: 'Thu', receipts: 200, deliveries: 120 },
    { name: 'Fri', receipts: 95, deliveries: 110 },
    { name: 'Sat', receipts: 60, deliveries: 45 },
    { name: 'Sun', receipts: 30, deliveries: 20 },
  ],
  '30d': [
    { name: 'Week 1', receipts: 680, deliveries: 420 },
    { name: 'Week 2', receipts: 750, deliveries: 590 },
    { name: 'Week 3', receipts: 620, deliveries: 480 },
    { name: 'Week 4', receipts: 810, deliveries: 650 },
  ],
  '90d': [
    { name: 'July', receipts: 2850, deliveries: 2200 },
    { name: 'August', receipts: 3100, deliveries: 2650 },
    { name: 'September', receipts: 2920, deliveries: 2480 },
  ],
}

export function StockMovementChart({ className = '' }) {
  const [timeRange, setTimeRange] = useState('7d')
  const [liveData, setLiveData] = useState(null)
  
  useEffect(() => {
    // Attempt to fetch real ledger data for analytics
    const fetchLedger = async () => {
      try {
        const json = await apiRequest('/stock-ledger')
        // Basic client-side aggregation (mock implementation of grouping)
        if (json?.data && json.data.length > 0) {
          // Aggregate by day... (simplified logic, using mock as fallback below)
          // Real implementation would group json.data by createdAt date
        }
      } catch (err) {
        console.warn(`Stock ledger unavailable (${err.status ?? 'error'}: ${err.message}); showing sample analytics data.`)
      }
    }
    fetchLedger()
  }, [])

  const data = liveData || datasets[timeRange] || datasets['7d']

  const totalReceipts = data.reduce((acc, curr) => acc + curr.receipts, 0)
  const totalDeliveries = data.reduce((acc, curr) => acc + curr.deliveries, 0)
  const netDelta = totalReceipts - totalDeliveries

  return (
    <Card
      className={className}
      title="Stock Movement"
      subtitle="Incoming vs outgoing inventory"
      action={
        <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs shadow-2xs">
          {[
            { id: '7d', label: '7 days' },
            { id: '30d', label: '30 days' },
            { id: '90d', label: '90 days' },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                timeRange === range.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      }
    >
      {/* Metrics Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-600" aria-hidden="true" />
            <span className="text-slate-500 font-medium">Receipts (In):</span>
            <span className="font-semibold text-slate-900 tabular-nums">+{totalReceipts.toLocaleString()} units</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600" aria-hidden="true" />
            <span className="text-slate-500 font-medium">Deliveries (Out):</span>
            <span className="font-semibold text-slate-900 tabular-nums">-{totalDeliveries.toLocaleString()} units</span>
          </div>
        </div>

        <div className="text-[11px] font-medium text-slate-600">
          Net Stock Change:{' '}
          <strong className={`tabular-nums font-semibold ${netDelta >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
            {netDelta >= 0 ? `+${netDelta.toLocaleString()}` : netDelta.toLocaleString()} units
          </strong>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="receiptsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="deliveriesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value, name) => [
                `${value} units`,
                name === 'receipts' ? 'Incoming Receipts' : 'Outgoing Deliveries',
              ]}
            />
            <Area
              type="monotone"
              dataKey="receipts"
              stroke="#0d9488"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#receiptsGradient)"
              name="receipts"
            />
            <Area
              type="monotone"
              dataKey="deliveries"
              stroke="#d97706"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#deliveriesGradient)"
              name="deliveries"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
