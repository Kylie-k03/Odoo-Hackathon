import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main content column */}
      <div className="flex flex-1 flex-col lg:pl-60 min-w-0">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
