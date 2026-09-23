'use client'

/**
 * /register — account registration.
 *
 * - With ?token=… (admin signup link): single-use, locked to this first email;
 *   registering grants 60-day access immediately → sent to /courses.
 * - Without a token (open): credentials create a pre-qualified account only.
 *   Premium access activates after verified payment → sent to /pricing.
 */
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

/** Only allow same-site paths when returning from registration. */
function safeNext(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

function RegisterForm() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const next = safeNext(params.get('next')) ?? '/pricing'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // True when registration failed because the email already has an account —
  // the common dead-end where a learner re-registers instead of logging in.
  const [existingAccount, setExistingAccount] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setExistingAccount(false)
    try {
      const endpoint = token ? '/api/auth/register-with-token' : '/api/auth/register'
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(token ? { token, email, password } : { email, password }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not create your account.')

      const { error: signInErr } = await createClient().auth.signInWithPassword({ email, password })
      if (signInErr) { window.location.assign('/login'); return }
      // Full-page navigation so the destination server component sees the
      // new session cookies straight away (same reasoning as the login page).
      window.location.assign(token ? '/courses' : next)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
      setExistingAccount(/already exists|log in instead/i.test(message))
      setLoading(false)
    }
  }

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login'
  const resetHref = `/forgot-password?next=${encodeURIComponent(next)}${email ? `&email=${encodeURIComponent(email)}` : ''}`

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
      <h1 className="text-2xl font-extrabold text-blue-700 mb-1 text-center">Create your account</h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        {token
          ? 'Your account unlocks 60 days of full access. This link works once, for this email only.'
          : 'Create your email and password to pre-qualify. Premium access activates only after your R99 payment is verified.'}
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="At least 6 characters" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {existingAccount && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
            <p className="text-sm text-blue-900">This email is already registered. You can:</p>
            <div className="flex gap-2">
              <Link href={loginHref} className="flex-1 text-center text-sm font-semibold text-white bg-blue-700 rounded-lg py-2 hover:bg-blue-800 transition-colors">
                Log in
              </Link>
              <Link href={resetHref} className="flex-1 text-center text-sm font-semibold text-blue-700 border border-blue-300 rounded-lg py-2 hover:bg-blue-100 transition-colors">
                Reset password
              </Link>
            </div>
          </div>
        )}
        <button type="submit" disabled={loading}
          className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60">
          {loading ? 'Creating account…' : token ? 'Create account & unlock access' : 'Create pre-qualified account'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account?{' '}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
          className="text-blue-700 font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense fallback={null}><RegisterForm /></Suspense>
    </main>
  )
}
