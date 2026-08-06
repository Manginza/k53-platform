'use client'

/**
 * /reset-password — final step of the password-reset flow.
 *
 * Supabase's reset email includes a `?code=` (or an auth-fragment) that
 * exchangeCodeForSession / detectSessionInUrl converts into a live session.
 * Once we have a session, the user picks a new password and we call
 * updateUser({ password }). On success, paid members return to the app while
 * pre-qualified/unpaid accounts return to payment.
 *
 * If the link is stale/invalid we let the user know and offer to request
 * a fresh one instead of hanging in a broken state.
 */
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

function safeNext(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

type Status = 'checking' | 'ready' | 'invalid' | 'updating' | 'done' | 'error'

function ResetPasswordForm() {
  const params = useSearchParams()
  const supabase = createClient()
  const nextPath = safeNext(params.get('next'))
  const [status, setStatus] = useState<Status>('checking')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')

  // On mount, Supabase's client parses the URL for the reset code and
  // upgrades it to a real session. If there's a ?code= we hand it to
  // exchangeCodeForSession explicitly; otherwise we just check whether
  // detectSessionInUrl already established one.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (error) { setStatus('invalid'); return }
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      setStatus(session ? 'ready' : 'invalid')
    })()
    return () => { cancelled = true }
  }, [params, supabase])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== password2) { setError('Passwords don\'t match — please retype.'); return }
    setStatus('updating')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setStatus('ready'); return }
    setStatus('done')
    const accessRes = await fetch('/api/me/access', { cache: 'no-store' }).catch(() => null)
    const access = accessRes
      ? await accessRes.json().catch(() => ({ fullAccess: false }))
      : { fullAccess: false }
    const destination = access.fullAccess
      ? (nextPath ?? '/courses')
      : (nextPath?.startsWith('/pricing') ? nextPath : '/pricing?account=prequalified')
    // Full-page navigation so the destination server component sees the
    // new session cookies straight away (same reasoning as the login page).
    setTimeout(() => { window.location.assign(destination) }, 900)
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-sm text-gray-500">Checking your reset link…</p>
        </div>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-2xl font-extrabold text-blue-700 mb-2">This link isn&apos;t valid</h1>
          <p className="text-sm text-gray-600 mb-6">
            Your reset link may have already been used or expired. Request a new one and try again.
          </p>
          <Link
            href={nextPath ? `/forgot-password?next=${encodeURIComponent(nextPath)}` : '/forgot-password'}
            className="inline-block bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-blue-800 transition-colors"
          >
            Send me a new link
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="text-2xl font-extrabold text-blue-700 mb-2">Password updated</h1>
          <p className="text-sm text-gray-500">Taking you back into your account…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-blue-700 mb-2 text-center">Set a new password</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Pick something you&apos;ll remember.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              type="password" required minLength={6} value={password2} onChange={e => setPassword2(e.target.value)}
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type it again"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit" disabled={status === 'updating'}
            className="w-full bg-blue-700 text-white font-semibold py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
          >
            {status === 'updating' ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
