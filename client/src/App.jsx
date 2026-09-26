import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AuthProvider } from './components/auth/AuthProvider'
import { GuestRoute, ProtectedRoute } from './components/auth/RouteGuards'
import { UnauthorizedRedirect } from './components/auth/UnauthorizedRedirect'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProductsPage } from './pages/ProductsPage'
import { ReceiptsPage } from './pages/ReceiptsPage'
import { DeliveryOrdersPage } from './pages/DeliveryOrdersPage'
import { InternalTransfersPage } from './pages/InternalTransfersPage'
import { InventoryAdjustmentsPage } from './pages/InventoryAdjustmentsPage'
import { StockLedgerPage } from './pages/StockLedgerPage'
import { SettingsWarehousePage } from './pages/SettingsWarehousePage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UnauthorizedRedirect />
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/receipts" element={<ReceiptsPage />} />
              <Route path="/delivery-orders" element={<DeliveryOrdersPage />} />
              <Route path="/transfers" element={<InternalTransfersPage />} />
              <Route path="/adjustments" element={<InventoryAdjustmentsPage />} />
              <Route path="/ledger" element={<StockLedgerPage />} />
              <Route path="/settings" element={<SettingsWarehousePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
