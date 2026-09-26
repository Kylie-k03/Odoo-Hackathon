import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LOGIN_PATH, UNAUTHORIZED_EVENT } from '../../services/api'

/**
 * Listens for the API client's 401 event and sends the user to the login
 * route, remembering where they were. Renders nothing.
 */
export function UnauthorizedRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function handleUnauthorized() {
      if (location.pathname === LOGIN_PATH) return
      navigate(LOGIN_PATH, { replace: true, state: { from: location } })
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [navigate, location])

  return null
}
