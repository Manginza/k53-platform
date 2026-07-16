'use client'

/**
 * /forgot-password — sends a password-reset email via Supabase Auth.
 *
 * The email link takes the user back to /reset-password on this site,
 * where they can pick a new password. Any pending `?next=` intent
 * (e.g. from a paid-flow checkout redirect) is preserved through the
 * whole reset flow so the user doesn't lose their spot in a checkout.
 */
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

function safeNext(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

function ForgotPasswordForm() {
  const params = useSearchParams()
  const supabase = createClient()
  const nextPath = safeNext(params.get('next'))
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const cleanEmail = email.trim().toLowerCase()

    // Where the email link should land. Redirect through /reset-password
    // and carry the next intent so a paid user coming from checkout ends
    // up back at their intended destination once the reset is complete.
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const redirectTo = origin + '/reset-password' +
      (nextPath ? `?next=${encodeURIComponent(nextPath)}` : '')

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo })
    setLoading(false)
    if (error) {
      // Don't reveal whether an account exists. Show success either way,
      // but log the underlying error for debugging.
      console.warn('[forgot-password]', error.message)
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-3">📬</div>
          <h1 className="text-2xl font-extrabold text-blue-700 mb-2">Check your inbox</h1>
          <p className="text-sm text-gray-600 mb-2">
            If an account exists for <strong>{email.trim().toLowerCase()}</strong>, we&apos;ve just sent it a
            password-reset link. Open the email and follow the link to set a new password.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            The link expires in about an hour. If it doesn&apos;t arrive within a few minutes, check
            your spam folder or try again.
          </p>
          <Link href="/login" className="inline-block bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-blue-800 transition-colors">
            Back to log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-blue-700 mb-2 text-center">Reset your password</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter the email you signed up with — we&apos;ll send you a link to pick a new password.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email" inputMode="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-700 text-white font-semibold py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Remembered it?{' '}
          <Link
            href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login'}
            className="text-blue-700 font-medium hover:underline"
          >
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  )
}
