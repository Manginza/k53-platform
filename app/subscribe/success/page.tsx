'use client'

/**
 * /subscribe/success?code=XXXX — landing after a successful Yoco payment.
 *
 * The webhook activates the access code; this page redeems it onto the
 * device (sets the access cookie). It polls for a short while in case the
 * webhook is still in flight, and shows the code as a fallback so the buyer
 * can always activate later at /redeem.
 */
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Status = 'activating' | 'done' | 'manual'

function SuccessInner() {
  const router = useRouter()
  const params = useSearchParams()
  const code = (params.get('code') ?? '').toUpperCase()
  const [status, setStatus] = useState<Status>('activating')
  const attempts = useRef(0)

  const tryRedeem = useCallback(async () => {
    if (!code) { setStatus('manual'); return }
    try {
      const res = await fetch('/api/access/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      if (res.ok) {
        setStatus('done')
        router.refresh()
        return
      }
    } catch { /* keep polling */ }

    attempts.current += 1
    if (attempts.current >= 10) setStatus('manual')   // ~25s of polling
    else setTimeout(tryRedeem, 2500)
  }, [code, router])

  useEffect(() => { tryRedeem() }, [tryRedeem])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        {status === 'activating' && (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Activating your access…</h1>
            <p className="text-sm text-gray-500">Payment received. We&apos;re unlocking your 60-day full access — this only takes a few seconds.</p>
          </>
        )}

        {status === 'done' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You&apos;re in!</h1>
            <p className="text-sm text-gray-500 mb-6">Full access is unlocked on this device for 60 days — unlimited tests, Live Notes, resources and videos.</p>
            <div className="flex flex-col gap-3">
              <Link href="/courses" className="block bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">Start practising →</Link>
              <Link href="/live-notes" className="block border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors">Go to Live Notes</Link>
            </div>
          </>
        )}

        {status === 'manual' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment received</h1>
            <p className="text-sm text-gray-500 mb-4">
              Your access is being finalised. If it doesn&apos;t unlock automatically, save the code below and activate it at any time.
            </p>
            {code && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Your access code</div>
                <div className="font-mono font-extrabold text-lg text-gray-900 tracking-widest">{code}</div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Link href={`/redeem?code=${encodeURIComponent(code)}`} className="block bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">Activate access</Link>
              <a href="mailto:support@skdriving.co.za" className="text-xs text-gray-400 underline">Need help? support@skdriving.co.za</a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  )
}
