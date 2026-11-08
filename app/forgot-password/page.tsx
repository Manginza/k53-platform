'use client'

/**
 * /forgot-password — asks for a password-reset link.
 *
 * The request goes through /api/auth/forgot-password, which checks the address
 * (typos, disposable addresses, whether the domain can receive mail), verifies
 * the CAPTCHA and limits how often one address can be sent to. Errors are shown
 * plainly rather than hidden behind "check your inbox", so a typo is caught here
 * instead of producing an email that can only bounce.
 *
 * Nothing is sent again automatically. Resending is a button press, and it
 * waits 60 seconds between presses.
 */
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import EmailSuggestion from '@/components/EmailSuggestion'
import TurnstileWidget, { TURNSTILE_ENABLED } from '@/components/TurnstileWidget'
import { checkEmail, normaliseEmail } from '@/lib/email-check'

const RESEND_WAIT = 60

function safeNext(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

function ForgotPasswordForm() {
  const params = useSearchParams()
  const nextPath = safeNext(params.get('next'))

  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [wait, setWait] = useState(0)

  // Count down the resend wait.
  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait(w => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  async function send(address: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: address, captchaToken, next: nextPath }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setSentTo(address)
        setWait(RESEND_WAIT)
        return
      }
      if (res.status === 429 && typeof data.retryAfter === 'number') {
        setWait(data.retryAfter)
      }
      if (data.suggestion) setError(data.error ?? 'Please check your email address.')
      else setError(data.error ?? 'We could not send the link right now. Please try again.')
    } catch {
      setError('We could not reach the server. Please check your connection and try again.')
    } finally {
      setLoading(false)
      // Tokens are single-use: get a fresh challenge for the next attempt.
      setCaptchaToken('')
      setCaptchaKey(k => k + 1)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    const cleaned = normaliseEmail(email)
    const check = checkEmail(cleaned)
    if (!check.ok) {
      setError(check.message)
      return
    }
    if (TURNSTILE_ENABLED && !captchaToken) {
      setError('Please complete the security check first.')
      return
    }
    setEmail(check.email)
    void send(check.email)
  }

  if (sentTo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-3">📬</div>
          <h1 className="text-2xl font-extrabold text-blue-700 mb-2">Check your inbox</h1>
          <p className="text-sm text-gray-600 mb-2">
            If an account exists for <strong>{sentTo}</strong>, we&apos;ve just sent it a password-reset link.
            Open the email and follow the link to set a new password.
          </p>
          <p className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
            Open the <strong>newest</strong> email from us and tap its link <strong>once</strong>. Each new
            email cancels the link in the ones before it.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            The link expires in about an hour. If it doesn&apos;t arrive within a few minutes, check your
            spam folder. Mistyped your address? Try again with the correct one.
          </p>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <div className="mb-3">
            <TurnstileWidget key={captchaKey} onToken={setCaptchaToken} />
          </div>

          <button
            type="button"
            onClick={() => { if (wait <= 0 && !loading && (!TURNSTILE_ENABLED || captchaToken)) void send(sentTo) }}
            disabled={wait > 0 || loading || (TURNSTILE_ENABLED && !captchaToken)}
            className="w-full border-2 border-blue-200 text-blue-700 font-semibold py-2.5 rounded-lg hover:border-blue-400 transition-colors disabled:opacity-50 mb-3"
          >
            {wait > 0 ? `Resend the link in ${wait}s` : 'Resend the link'}
          </button>

          <Link href="/login" className="inline-block bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-blue-800 transition-colors">
            Back to log in
          </Link>
          <p className="text-sm mt-4">
            <Link href="/still-cant-login" className="text-blue-700 font-medium hover:underline">
              Paid but still can&apos;t log in?
            </Link>
          </p>
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

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fp-email">Email</label>
            <input
              id="fp-email"
              type="email" value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onBlur={() => setTouched(true)}
              autoComplete="email" inputMode="email" autoCapitalize="none"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
            <EmailSuggestion value={email} touched={touched} onAccept={c => { setEmail(c); setError('') }} />
          </div>

          <TurnstileWidget key={captchaKey} onToken={setCaptchaToken} />

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
