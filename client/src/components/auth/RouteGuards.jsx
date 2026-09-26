import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { LOGIN_PATH } from '../../services/api'
import { useAuth } from './authContext'

function SessionCheck() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
        <span>Checking your session…</span>
      </div>
    </div>
  )
}

/** Where to go after signing in: the page the user was sent away from, else the dashboard. */
function postLoginTarget(location) {
  const from = location.state?.from
  if (from?.pathname && from.pathname !== LOGIN_PATH) {
    return `${from.pathname}${from.search ?? ''}`
  }
  return '/'
}

/** Protected pages: anonymous users go to /login. */
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <SessionCheck />
  if (status !== 'authenticated') {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location }} />
  }
  return <Outlet />
}

/** The login page: signed-in users go to the dashboard (or where they came from). */
export function GuestRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <SessionCheck />
  if (status === 'authenticated') {
    return <Navigate to={postLoginTarget(location)} replace />
  }
  return <Outlet />
}
