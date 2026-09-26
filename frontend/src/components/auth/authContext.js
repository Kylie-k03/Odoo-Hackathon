import { createContext, useContext } from 'react'

/**
 * Auth state shared by AuthProvider.
 *   status       — 'checking' (verifying a stored token), 'authenticated' or 'anonymous'
 *   user         — { id, name, email, role, createdAt?, updatedAt? } from the backend, or null
 *   sessionError — why a stored session could not be verified (e.g. server unreachable)
 *   login(email, password), logout()
 */
export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
