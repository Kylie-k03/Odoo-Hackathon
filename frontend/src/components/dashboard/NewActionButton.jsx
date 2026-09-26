import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronDown, ArrowDownToLine, Truck, ArrowLeftRight, SlidersHorizontal } from 'lucide-react'

export function NewActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const menuItems = [
    {
      label: 'New Receipt',
      description: 'Record incoming vendor shipment',
      path: '/receipts',
      icon: ArrowDownToLine,
      color: 'text-teal-600',
    },
    {
      label: 'New Delivery',
      description: 'Create customer dispatch order',
      path: '/delivery-orders',
      icon: Truck,
      color: 'text-amber-600',
    },
    {
      label: 'Transfer Stock',
      description: 'Move items between locations',
      path: '/transfers',
      icon: ArrowLeftRight,
      color: 'text-slate-600',
    },
    {
      label: 'Adjust Inventory',
      description: 'Reconcile shelf count mismatch',
      path: '/adjustments',
      icon: SlidersHorizontal,
      color: 'text-rose-600',
    },
  ]

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Create new inventory operation"
        className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:bg-teal-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:ring-offset-1 cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        <span>New</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 z-50 mt-1.5 w-64 origin-top-right rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg focus:outline-hidden animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Create Operation
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-slate-50 transition-colors focus:bg-slate-50 focus:outline-hidden"
              >
                <div className={`mt-0.5 p-1 rounded-md bg-slate-50 border border-slate-200/60 ${item.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">{item.label}</div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
