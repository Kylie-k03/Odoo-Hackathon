import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  apiRequest,
  clearToken,
  getToken,
  setToken,
  LOGIN_PATH,
  UNAUTHORIZED_EVENT,
} from '../../services/api'
import { AuthContext } from './authContext'

/**
 * Holds the signed-in user. The token itself lives only in the API client's
 * storage (setToken/getToken/clearToken); this provider never stores it.
 *
 * Backend contract:
 *   POST /auth/login { email, password } → { token, user }
 *   GET  /auth/me                        → { user: { id, name, email, role, createdAt, updatedAt } }
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(() => (getToken() ? 'checking' : 'anonymous'))
  const [sessionError, setSessionError] = useState(null)

  // Restore a stored session once on startup.
  useEffect(() => {
    if (!getToken()) return undefined

    let cancelled = false
    apiRequest('/auth/me')
      .then((response) => {
        if (cancelled) return
        setUser(response.user)
        setStatus('authenticated')
      })
      .catch((error) => {
        if (cancelled) return
        setUser(null)
        setStatus('anonymous')
        // A 401 already cleared the token in the API client; anything else
        // (e.g. server unreachable) is worth telling the user about.
        if (!error.isUnauthorized) {
          setSessionError(`Could not verify your session: ${error.message}`)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  // The API client clears the token on an expired session; drop the user too.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
      setStatus('anonymous')
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  const login = useCallback(async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    })
    if (!response?.token) {
      throw new Error('Login response did not include a token')
    }

    setToken(response.token)
    try {
      const me = await apiRequest('/auth/me')
      setUser(me.user)
      setStatus('authenticated')
      setSessionError(null)
      return me.user
    } catch (error) {
      clearToken()
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setStatus('anonymous')
    setSessionError(null)
    navigate(LOGIN_PATH, { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({ user, status, sessionError, login, logout }),
    [user, status, sessionError, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
