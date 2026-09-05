'use client'

/**
 * /subscribe/success — landing after returning from Yoco. Confirms the payment
 * directly with Yoco (via /api/yoco/confirm) and grants the logged-in account
 * 60 days of access, then sends them to the courses. Independent of the webhook.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WHATSAPP_QUERIES_URL } from '@/lib/contact'
import { invalidateAccessCache } from '@/lib/access-cache'
import LiveSessionCard from '@/components/LiveSessionCard'

type Status = 'confirming' | 'done' | 'manual' | 'login_required'

export default function SubscribeSuccessPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('confirming')
  const [grantError, setGrantError] = useState('')
  const attempts = useRef(0)

  const confirm = useCallback(async () => {
    let checkoutId = ''
    try { checkoutId = localStorage.getItem('sk_checkout') ?? '' } catch {}

    try {
      const res = await fetch('/api/yoco/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutId }),
      })
      if (res.status === 401) {
        setStatus('login_required')
        return
      }
      const body = await res.json()
      if (res.ok && body.granted) {
        try { localStorage.removeItem('sk_checkout') } catch {}
        invalidateAccessCache()
        const verifyRes = await fetch('/api/me/access', { cache: 'no-store' })
        const verify = await verifyRes.json()
        if (!verify?.fullAccess) {
          console.error('[subscribe/success] confirm returned granted:true but /api/me/access still says fullAccess:false', verify)
          attempts.current += 1
          if (attempts.current >= 20) { setStatus('manual'); return }
          setTimeout(confirm, 2000)
          return
        }
        setStatus('done')
        router.refresh()
        return
      }
      if (!res.ok && body.error && !body.pending) {
        setGrantError(body.error)
        setStatus('manual')
        return
      }
      if (body.error) {
        console.error('[subscribe/success] confirm error:', body.error)
      }
    } catch { /* keep trying */ }

    attempts.current += 1
    if (attempts.current >= 20) setStatus('manual')
    else setTimeout(confirm, Math.min(2000 * Math.pow(1.3, attempts.current), 8000))
  }, [router])

  useEffect(() => { confirm() }, [confirm])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        {status === 'confirming' && (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Confirming your payment…</h1>
            <p className="text-sm text-gray-500">Unlocking your 60-day full access — just a moment.</p>
          </>
        )}
        {status === 'done' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You&apos;re in!</h1>
            <p className="text-sm text-gray-500 mb-5">Full access is unlocked on your account for 60 days.</p>

            <LiveSessionCard className="mb-5" />

            <div className="flex flex-col gap-3">
              <Link href="/courses" className="block bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">Start practising →</Link>
              <Link href="/live-notes" className="block border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors">Go to Live Notes</Link>
            </div>
          </>
        )}
        {status === 'login_required' && (
          <>
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Please log in</h1>
            <p className="text-sm text-gray-500 mb-6">
              Your session expired while you were paying. Log in with the email you used to pay and your access will be unlocked automatically.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/login?next=/subscribe/success" className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors text-center">Log in to unlock access</Link>
              <a href={WHATSAPP_QUERIES_URL} target="_blank" rel="noopener noreferrer" className="block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors text-center">
                WhatsApp us about my payment
              </a>
            </div>
          </>
        )}
        {status === 'manual' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment received</h1>
            <p className="text-sm text-gray-500 mb-6">
              {grantError
                ? grantError
                : <>We&apos;re finalising your access. Tap <strong>Unlock my access</strong> below — if it still hasn&apos;t unlocked, message us on WhatsApp with the email you paid with and we&apos;ll sort it out right away.</>}
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { attempts.current = 0; setGrantError(''); setStatus('confirming'); confirm() }} className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">Unlock my access</button>
              <a href={WHATSAPP_QUERIES_URL} target="_blank" rel="noopener noreferrer" className="block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors text-center">
                WhatsApp us about my payment
              </a>
              <Link href="/courses" className="block border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors text-center">Go to courses</Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
