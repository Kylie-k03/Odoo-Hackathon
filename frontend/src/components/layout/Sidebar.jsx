import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Settings,
  UserCircle,
  Boxes,
  X
} from 'lucide-react'

export const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Receipts', path: '/receipts', icon: ArrowDownToLine },
  { name: 'Delivery Orders', path: '/delivery-orders', icon: Truck },
  { name: 'Internal Transfers', path: '/transfers', icon: ArrowLeftRight },
  { name: 'Inventory Adjustments', path: '/adjustments', icon: SlidersHorizontal },
  { name: 'Stock Ledger', path: '/ledger', icon: History },
  { name: 'Settings / Warehouse', path: '/settings', icon: Settings },
]

export function Sidebar({ mobileOpen = false, onCloseMobile }) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-2xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-slate-200 border-r border-slate-800/90 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white font-bold shadow-lg shadow-teal-600/30">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">StockSense</span>
              <span className="block text-[10px] text-teal-400 font-bold uppercase tracking-wider -mt-1">
                Inventory OS
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Operations & Stock
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm scale-[1.02]'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom profile / quick footer */}
        <div className="border-t border-slate-800 p-4">
          <NavLink
            to="/profile"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
              }`
            }
          >
            <UserCircle className="h-6 w-6 text-teal-400 shrink-0" />
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[13px] font-bold text-white truncate">Inventory Manager</span>
              <span className="text-[11px] text-slate-400 truncate">admin@stocksense.local</span>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  )
}
