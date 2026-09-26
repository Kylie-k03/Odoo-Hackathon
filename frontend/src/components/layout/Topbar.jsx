import { Menu, Bell, Search, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Topbar({ onOpenMobile }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors lg:hidden focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Warehouse Filter */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Warehouse:
          </span>
          <select className="h-8 rounded-md border border-slate-200 bg-slate-50 hover:border-slate-300 px-2.5 text-xs font-medium text-slate-700 transition-colors focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 cursor-pointer">
            <option value="all">All Warehouses (Global)</option>
            <option value="wh1">Main Warehouse (WH-MAIN)</option>
            <option value="wh2">Production Floor (WH-PROD)</option>
            <option value="wh3">Warehouse 2 (WH-DIST)</option>
          </select>
        </div>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center relative max-w-sm w-full mx-4">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search SKU, product, document reference..."
          className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 hover:border-slate-300 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Role indicator pill */}
        <div className="flex items-center gap-1.5 rounded-md bg-teal-50 border border-teal-200/80 px-2.5 py-1 text-xs font-medium text-teal-800">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600 shrink-0" />
          <span className="hidden sm:inline text-teal-700">Role:</span>
          <span className="font-semibold text-teal-900">Manager</span>
        </div>

        {/* Low-stock / Activity Alerts */}
        <button
          className="relative rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          title="Notifications & Alerts"
          aria-label="Alerts"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex h-7.5 w-7.5 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          title="User Profile"
        >
          AD
        </Link>
      </div>
    </header>
  )
}
