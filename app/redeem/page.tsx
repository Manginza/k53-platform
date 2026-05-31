'use client'

/**
 * /redeem — members enter the access code the admin sent them (after paying
 * via WhatsApp) to unlock 60-day full access. Supports /redeem?code=XXXX to
 * prefill the field.
 */
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { WHATSAPP_URL } from '@/lib/contact'

function RedeemForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<string | null>(null)

  useEffect(() => {
    const c = params.get('code')
    if (c) setCode(c.toUpperCase())
  }, [params])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/access/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not redeem that code.')
      setDone(body.expiresAt ?? null)
      // Refresh so server components pick up the new access cookie.
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (done !== null) {
    const expiry = done
      ? new Date(done).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
      : null
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You&apos;re in!</h1>
        <p className="text-sm text-gray-500 mb-6">
          Full access is now unlocked on this device{expiry ? <> until <strong>{expiry}</strong></> : ''}.
        </p>
        <Link
          href="/courses"
          className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors"
        >
          Start practising
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
      <h1 className="text-2xl font-extrabold text-blue-700 mb-1 text-center">Activate your access</h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Enter the access code you received after paying.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="SK-XXXX-XXXX"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center font-mono tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || !code}
          className="w-full bg-blue-700 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
        >
          {loading ? 'Activating…' : 'Activate access'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Don&apos;t have a code?{' '}
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">
          Get full access on WhatsApp
        </a>
      </p>
    </div>
  )
}

export default function RedeemPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense fallback={null}>
        <RedeemForm />
      </Suspense>
    </main>
  )
}
