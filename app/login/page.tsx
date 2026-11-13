'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { isAdminEmail } from '@/lib/admin-emails'

/**
 * Whitelist for the `next` param — only allow same-site paths so a poisoned
 * link can't route the user to an external site after login.
 */
function safeNext(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

/**
 * Map Supabase Auth error messages to something a paid user can act on.
 * The default "Invalid login credentials" is too generic — many users
 * assume their account is broken when they actually mistyped their password.
 */
function friendlyError(raw: string): string {
  const m = raw.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Wrong email or password. Please try again, or reset your password below.'
  }
  if (m.includes('email not confirmed')) {
    return 'Your email hasn\'t been confirmed yet. Check your inbox for the confirmation link.'
  }
  if (m.includes('rate') || m.includes('too many')) {
    return 'Too many attempts. Please wait a minute and try again.'
  }
  return raw
}

function LoginForm() {
  const params = useSearchParams()
  const supabase = createClient()
  const nextPath = safeNext(params.get('next'))
  // True when arriving from the post-payment success page — user's Yoco
  // session expired and they need to log back in to claim their access.
  const isPaymentReturn = !!(nextPath?.startsWith('/subscribe/success') || nextPath?.startsWith('/subscribe'))

  // Pre-fill email from localStorage if we stored it during registration
  // (payment flow). Read once on mount so the user can still edit it.
  function getStoredEmail() {
    if (typeof window === 'undefined') return ''
    try { return localStorage.getItem('sk_pay_email') ?? '' } catch { return '' }
  }

  const [email, setEmail] = useState(() => isPaymentReturn ? getStoredEmail() : '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Normalise the email exactly the way registration does (trim + lowercase),
    // so someone who registered as "User@Example.com" can sign in as
    // "user@example.com" or "USER@EXAMPLE.COM" without hitting an "Invalid
    // credentials" error.
    const cleanEmail = email.trim().toLowerCase()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail, password,
    })
    if (error) {
      setError(friendlyError(error.message))
      setLoading(false)
      return
    }

    // Authentication proves account ownership, not premium entitlement.
    // Admin and affiliate workspaces have their own role checks; learner
    // destinations require the payment-backed fullAccess result.
    let dest = '/pricing?account=prequalified'
    if (isAdminEmail(cleanEmail)) {
      dest = '/admin'
    } else if (data.user) {
      const [{ data: aff }, accessRes] = await Promise.all([
        supabase.from('affiliates').select('id').eq('user_id', data.user.id).maybeSingle(),
        fetch('/api/me/access', { cache: 'no-store' }).catch(() => null),
      ])
      if (aff) {
        dest = '/affiliate'
      } else {
        const access = accessRes
          ? await accessRes.json().catch(() => ({ fullAccess: false }))
          : { fullAccess: false }
        if (access.fullAccess) dest = nextPath ?? '/group'
        else if (nextPath?.startsWith('/pricing') || nextPath?.startsWith('/subscribe')) dest = nextPath
      }
    }

    // Use a full-page navigation instead of router.push + router.refresh.
    // In the App Router, router.push can render the destination server
    // component with the PRE-login request context (cookies not yet
    // included in the fetch), so a paid user briefly sees the paywall
    // before router.refresh() rehydrates — which reads as "I logged in
    // but my access is broken". A full assign forces the browser to
    // re-request the destination with the fresh auth cookies attached.

    // Clear the stored email once login succeeds — it's served its purpose.
    if (isPaymentReturn) {
      try { localStorage.removeItem('sk_pay_email') } catch {}
    }

    window.location.assign(dest)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        {isPaymentReturn ? (
          <>
            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-900">
              <p className="font-bold text-green-800">Your payment was received.</p>
              <p className="mt-0.5">Log back in below to unlock your 30-day access.</p>
            </div>
            <h1 className="text-2xl font-extrabold text-blue-700 mb-1 text-center">Almost there</h1>
            <p className="text-sm text-gray-500 text-center mb-6">Log in with the email and password you created</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-blue-700 mb-2 text-center">Welcome back</h1>
            <p className="text-sm text-gray-500 text-center mb-6">Log in to your K53 account</p>
          </>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email" inputMode="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-700 text-white font-semibold py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          <Link
            href={nextPath ? `/forgot-password?next=${encodeURIComponent(nextPath)}` : '/forgot-password'}
            className="text-blue-700 font-medium hover:underline"
          >
            Forgot your password?
          </Link>
        </p>
        {/* Second option: a paid client who still cannot get in sends proof of payment. */}
        <p className="text-sm text-center mt-2">
          <Link href="/still-cant-login" className="text-blue-700 font-medium hover:underline">
            Still can&apos;t log in?
          </Link>
        </p>

        <p className="text-sm text-center text-gray-500 mt-6">
          Don&apos;t have an account? Get full access on the{' '}
          <Link href="/pricing" className="text-blue-700 font-medium hover:underline">pricing page</Link>.
        </p>
        <p className="text-sm text-center text-gray-500 mt-2">
          Want to earn? Join the{' '}
          <Link href="/affiliate" className="text-blue-700 font-medium hover:underline">affiliate programme</Link>.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
