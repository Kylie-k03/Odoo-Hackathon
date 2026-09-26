import { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { SuccessState } from './SuccessState'
import { ArrowLeftRight, AlertCircle, ArrowRight } from 'lucide-react'

const sampleProducts = [
  { id: 1, name: 'Steel Rods', sku: 'RAW-STL-001', uom: 'kg', defaultFrom: 'Main Warehouse / WH/Stock', stockByLoc: { 'Main Warehouse / WH/Stock': 43, 'Production Floor / Rack B': 54 } },
  { id: 2, name: 'Steel Frames', sku: 'FIN-FRM-002', uom: 'units', defaultFrom: 'Production Floor / Rack B', stockByLoc: { 'Production Floor / Rack B': 45, 'Main Warehouse / WH/Stock': 0 } },
  { id: 3, name: 'Industrial Bolts M10', sku: 'HRD-BLT-010', uom: 'pcs', defaultFrom: 'Main Warehouse / Rack B', stockByLoc: { 'Main Warehouse / Rack B': 8, 'Assembly Line 1': 0 } },
  { id: 4, name: 'Aluminum Sheets 4x8', sku: 'RAW-ALM-004', uom: 'sheets', defaultFrom: 'Main Warehouse / WH/Stock', stockByLoc: { 'Main Warehouse / WH/Stock': 60, 'Warehouse 2 / Staging': 0 } },
]

const warehouseLocations = [
  'Main Warehouse / WH/Stock',
  'Production Floor / Rack B',
  'Main Warehouse / Rack A',
  'Assembly Line 1',
  'Warehouse 2 / Staging',
]

export function TransferStockModal({
  isOpen,
  onClose,
  initialProduct = null,
  onSuccess,
}) {
  const [selectedProductId, setSelectedProductId] = useState(initialProduct?.id || 1)
  const [fromLocation, setFromLocation] = useState('Main Warehouse / WH/Stock')
  const [toLocation, setToLocation] = useState('Production Floor / Rack B')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('Production replenishment')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Reset form when modal opens or initial product changes
  useEffect(() => {
    if (isOpen) {
      const prodId = initialProduct?.id || 1
      setSelectedProductId(prodId)
      const currentProd = sampleProducts.find((p) => p.id === prodId) || sampleProducts[0]
      setFromLocation(currentProd.defaultFrom || warehouseLocations[0])
      setToLocation(
        warehouseLocations.find((loc) => loc !== (currentProd.defaultFrom || warehouseLocations[0])) ||
          warehouseLocations[1]
      )
      setQuantity('')
      setReason('Production replenishment')
      setIsSubmitted(false)
    }
  }, [isOpen, initialProduct])

  const product = sampleProducts.find((p) => p.id === Number(selectedProductId)) || sampleProducts[0]
  const availableStock = product.stockByLoc?.[fromLocation] ?? 40

  const numQty = parseFloat(quantity) || 0
  const isOverStock = numQty > availableStock
  const isZeroOrNegative = numQty <= 0 && quantity !== ''
  const isSameLocation = fromLocation === toLocation
  const isValid = numQty > 0 && !isOverStock && !isSameLocation

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return

    setIsSubmitted(true)
    if (onSuccess) {
      onSuccess({
        productId: product.id,
        productName: product.name,
        fromLocation,
        toLocation,
        quantity: numQty,
        uom: product.uom,
        reason,
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSubmitted ? undefined : 'Transfer Stock'}
      subtitle={isSubmitted ? undefined : 'Relocate inventory between warehouse bays, racks, or sites.'}
      maxWidth="max-w-md"
    >
      {isSubmitted ? (
        <SuccessState
          title="✓ Transfer Created"
          message={`${numQty} ${product.uom} moved successfully.`}
          details={
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400">Product:</span>
                <span className="font-semibold text-slate-800">{product.name} ({product.sku})</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400 font-sans">Routing:</span>
                <span className="text-slate-700 flex items-center gap-1">
                  {fromLocation} <ArrowRight className="h-3 w-3 text-teal-600" /> {toLocation}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ledger Impact:</span>
                <span className="font-semibold text-teal-700">Total company stock unchanged; location updated</span>
              </div>
            </div>
          }
          onClose={onClose}
          closeLabel="Close Transfer"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Select */}
          <div>
            <label htmlFor="transfer-product" className="block text-xs font-semibold text-slate-700 mb-1">
              Product
            </label>
            <select
              id="transfer-product"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(Number(e.target.value))
                const newProd = sampleProducts.find((p) => p.id === Number(e.target.value))
                if (newProd?.defaultFrom) setFromLocation(newProd.defaultFrom)
              }}
              className="h-8.5 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-800 transition-colors focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            >
              {sampleProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — {p.uom}
                </option>
              ))}
            </select>
          </div>

          {/* Locations Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="transfer-from" className="block text-xs font-semibold text-slate-700 mb-1">
                From Location
              </label>
              <select
                id="transfer-from"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="h-8.5 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 transition-colors focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
              >
                {warehouseLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="transfer-to" className="block text-xs font-semibold text-slate-700 mb-1">
                To Location
              </label>
              <select
                id="transfer-to"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="h-8.5 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 transition-colors focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
              >
                {warehouseLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isSameLocation && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-md">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Destination location must be different from source location.</span>
            </div>
          )}

          {/* Available Stock Banner & Quantity Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="transfer-qty" className="text-xs font-semibold text-slate-700">
                Quantity to Move ({product.uom})
              </label>
              <span className="text-xs font-semibold text-slate-600 tabular-nums">
                Available:{' '}
                <strong className={availableStock > 0 ? 'text-teal-700' : 'text-rose-600'}>
                  {availableStock} {product.uom}
                </strong>
              </span>
            </div>

            <input
              id="transfer-qty"
              type="number"
              min="0.01"
              step="any"
              placeholder={`e.g. 20`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`h-8.5 w-full rounded-md border px-3 text-xs text-slate-900 transition-colors focus:outline-hidden focus:ring-2 ${
                isOverStock
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 bg-white focus:border-teal-500 focus:ring-teal-500/20'
              }`}
            />

            {isOverStock && (
              <p className="mt-1 text-xs text-rose-700 flex items-center gap-1 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Only {availableStock} {product.uom} is available at this location.</span>
              </p>
            )}

            {isZeroOrNegative && (
              <p className="mt-1 text-xs text-rose-700">Quantity must be greater than zero.</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="transfer-reason" className="block text-xs font-semibold text-slate-700 mb-1">
              Transfer Reason
            </label>
            <input
              id="transfer-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Replenishment, staging, workstation shift"
              className="h-8.5 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 transition-colors focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={ArrowLeftRight}
              disabled={!isValid}
            >
              Confirm Transfer
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
