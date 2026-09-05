'use client'

/**
 * /access-code — enter the code from the payment email to unlock this account.
 *
 * The customer-operated way in, for when the automatic routes could not help:
 * most often a buyer who signed up twice and is logged in to the account that
 * did not pay. The code unlocks whichever account they are signed in to.
 */
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { WHATSAPP_QUERIES_URL } from '@/lib/contact'
import { invalidateAccessCache } from '@/lib/access-cache'
import { createClient } from '@/lib/supabase-browser'

function AccessCodeForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [code, setCode] = useState(params.get('code') ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    createClient().auth.getUser()
      .then(({ data }) => setSignedIn(!!data.user))
      .catch(() => setSignedIn(null))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/access-code/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const body = await res.json()
      if (res.status === 401) {
        router.push('/login?next=' + encodeURIComponent(`/access-code?code=${encodeURIComponent(code)}`))
        return
      }
      if (!res.ok || !body.granted) {
        setError(body.error ?? 'We could not apply that code.')
        return
      }
      invalidateAccessCache()
      setDone(true)
      router.refresh()
    } catch {
      setError('We could not reach the server. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You&apos;re in!</h1>
        <p className="text-sm text-gray-500 mb-6">Full access is now unlocked on this account.</p>
        <div className="flex flex-col gap-3">
          <Link href="/courses" className="block bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">Start practising →</Link>
          <Link href="/live-notes" className="block border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors">Go to Live Notes</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
      <h1 className="text-2xl font-extrabold text-blue-700 mb-2">Enter your access code</h1>
      <p className="text-sm text-gray-600 mb-6">
        We emailed this to you when your payment went through. It unlocks the account you are
        signed in to right now, which is what you want if you happened to sign up more than once.
      </p>

      {signedIn === false && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You are not signed in. Enter your code and we will take you to the log-in page first.
        </div>
      )}

      <form onSubmit={submit}>
        <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-1.5">Access code</label>
        <input
          id="code"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="SK-A3F9-KM2P-7QXW"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-mono tracking-widest uppercase focus:border-blue-600 focus:outline-none"
        />
        <p className="text-xs text-gray-400 mt-1.5">Dashes and spaces do not matter.</p>
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="w-full mt-5 bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-60"
        >
          {busy ? 'Unlocking…' : 'Unlock my access'}
        </button>
      </form>

      <p className="text-xs text-center mt-5 pt-4 border-t border-gray-100 text-gray-500">
        Paid but never got a code?{' '}
        <a href={WHATSAPP_QUERIES_URL} target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">
          Message us
        </a>
      </p>
    </div>
  )
}

export default function AccessCodePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-sm text-gray-400">Loading…</div>}>
        <AccessCodeForm />
      </Suspense>
    </main>
  )
}
