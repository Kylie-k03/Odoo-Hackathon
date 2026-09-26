import { useState } from 'react'
import { AlertCircle, Boxes, Loader2, LogIn } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { useAuth } from '../components/auth/authContext'

const inputClassName =
  'h-9 w-full rounded-md border border-slate-200 bg-slate-50 hover:border-slate-300 px-3 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60'

function SpinnerIcon({ className = '' }) {
  return <Loader2 className={`${className} animate-spin`} />
}

export function LoginPage() {
  const { login, sessionError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError(null)
    try {
      await login(email, password)
      // On success the auth status changes and GuestRoute redirects away from /login.
    } catch (err) {
      setError(err?.message || 'Sign in failed. Please try again.')
      setSubmitting(false)
    }
  }

  const message = error || sessionError

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">StockSense</span>
            <span className="block text-[10px] text-indigo-500 font-bold uppercase tracking-wider -mt-1">
              Inventory OS
            </span>
          </div>
        </div>

        <Card title="Sign in" subtitle="Use your StockSense account to continue.">
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
                <span>{message}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                placeholder="you@company.com"
                className={inputClassName}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className={inputClassName}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={submitting ? SpinnerIcon : LogIn}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
