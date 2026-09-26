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
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-100 shadow-[20px_0_40px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-bold shadow-lg shadow-indigo-500/30">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-800 tracking-tight">StockSense</span>
              <span className="block text-[10px] text-indigo-500 font-bold uppercase tracking-wider -mt-1">
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
                      ? 'bg-gradient-to-r from-indigo-50 to-cyan-50 text-indigo-700 shadow-sm border border-indigo-100/50 scale-[1.02]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
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
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <NavLink
            to="/profile"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white shadow-sm border border-slate-200 text-indigo-600'
                  : 'text-slate-700 hover:bg-white hover:shadow-sm hover:text-indigo-600 border border-transparent'
              }`
            }
          >
            <UserCircle className="h-6 w-6 text-indigo-500 shrink-0" />
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[13px] font-bold text-slate-800 truncate">Inventory Manager</span>
              <span className="text-[11px] text-slate-500 truncate">admin@stocksense.local</span>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  )
}
