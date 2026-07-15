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

type Status = 'confirming' | 'done' | 'manual'

export default function SubscribeSuccessPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('confirming')
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
      const body = await res.json()
      if (res.ok && body.granted) {
        try { localStorage.removeItem('sk_checkout') } catch {}
        // Blow away the client-side "no access" cache — otherwise the
        // 5-minute sessionStorage entry (and any browser HTTP cache from
        // before the payment) keeps client-gated pages (Resources, popups)
        // showing the paywall for minutes after access was granted.
        invalidateAccessCache()
        // Double-check: even after invalidate + no-store fetch, if the
        // grant didn't actually persist in the DB (e.g. transient write
        // failure that the confirm route couldn't detect) we would send
        // the user to the courses page only for them to hit the paywall.
        // Verify BEFORE showing "You're in!" so the user only sees success
        // when the API actually reports fullAccess.
        const verifyRes = await fetch('/api/me/access', { cache: 'no-store' })
        const verify = await verifyRes.json()
        if (!verify?.fullAccess) {
          console.error('[subscribe/success] confirm returned granted:true but /api/me/access still says fullAccess:false', verify)
          attempts.current += 1
          if (attempts.current >= 8) { setStatus('manual'); return }
          setTimeout(confirm, 2500)
          return
        }
        setStatus('done')
        router.refresh()
        return
      }
      // Surface the specific failure so the user gets clear guidance
      // rather than a generic "we'll try again in a moment" spinner.
      if (body.error) {
        console.error('[subscribe/success] confirm error:', body.error)
      }
    } catch { /* keep trying */ }

    attempts.current += 1
    if (attempts.current >= 8) setStatus('manual')   // ~20s
    else setTimeout(confirm, 2500)
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
        {status === 'manual' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment received</h1>
            <p className="text-sm text-gray-500 mb-6">
              We&apos;re finalising your access. Tap <strong>Unlock my access</strong> below — if it still hasn&apos;t
              unlocked, message us on WhatsApp with the email you paid with and we&apos;ll sort it out right away.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { attempts.current = 0; setStatus('confirming'); confirm() }} className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">Unlock my access</button>
              <a href={WHATSAPP_QUERIES_URL} target="_blank" rel="noopener noreferrer" className="block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors">
                WhatsApp us about my payment
              </a>
              <Link href="/courses" className="block border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors">Go to courses</Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
