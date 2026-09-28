'use client'

/**
 * /subscribe/success — landing after returning from Yoco. Confirms the payment
 * directly with Yoco (via /api/yoco/confirm) and grants the logged-in account
 * its full-access window, then sends them to the courses. Independent of the
 * webhook.
 *
 * This page is the fastest of several routes to access, not the only one. If
 * it gives up, the webhook, the on-demand recovery in /api/me/access and the
 * scheduled sweep in /api/cron/reconcile all still apply the payment on their
 * own. That is why the fallback below tells the buyer their access is coming
 * rather than asking them to contact us.
 *
 * Two things here exist specifically to keep a buyer out of a support queue:
 *
 *   - /api/yoco/claim is called whenever the signed-in routes cannot finish,
 *     including when the session expired mid-payment. It applies the payment
 *     to the account that bought it without needing anyone to be signed in,
 *     which is what used to leave those buyers waiting for the nightly sweep.
 *   - The access code is printed on this page. One is minted for every payment
 *     but email delivery is not configured in production, so until it is, this
 *     screen is the only place a buyer can actually see it.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WHATSAPP_QUERIES_URL, WHATSAPP_LOGIN_URL, ACCESS_DURATION_DAYS } from '@/lib/contact'
import { invalidateAccessCache } from '@/lib/access-cache'
import LiveSessionCard from '@/components/LiveSessionCard'

type Status = 'confirming' | 'done' | 'manual' | 'login_required'

/** Where a buyer should land again after logging in or resetting a password. */
const RETURN_TO = '/subscribe/success'

function storedCheckoutId(): string {
  try { return localStorage.getItem('sk_checkout') ?? '' } catch { return '' }
}

/** The access code, shown so it can be read off the screen and typed later. */
function AccessCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-4 mb-5 text-left">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-700 mb-1">Your access code</p>
      <p className="font-mono text-lg font-extrabold text-blue-900 tracking-wide break-all">{code}</p>
      <p className="text-xs text-blue-700 mt-2">
        Write this down. It unlocks full access on whichever account you sign in to, so it covers you
        even if you end up with more than one.
      </p>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(code)
            .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
            .catch(() => {})
        }}
        className="mt-2 text-xs font-bold text-blue-700 underline underline-offset-2"
      >
        {copied ? '✓ Copied' : 'Copy code'}
      </button>
    </div>
  )
}

export default function SubscribeSuccessPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('confirming')
  const [grantError, setGrantError] = useState('')
  const [code, setCode] = useState('')
  const [claimedForAccount, setClaimedForAccount] = useState(false)
  const attempts = useRef(0)

  /**
   * Finish the payment without a session and fetch its code. Safe to call more
   * than once: applying is idempotent through the payment ledger.
   */
  const claim = useCallback(async () => {
    const checkoutId = storedCheckoutId()
    if (!checkoutId) return
    try {
      const res = await fetch('/api/yoco/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutId }),
      })
      const body = await res.json()
      if (body?.code) setCode(body.code)
      if (body?.applied) setClaimedForAccount(true)
    } catch { /* the page still works without it */ }
  }, [])

  const confirm = useCallback(async () => {
    const checkoutId = storedCheckoutId()

    try {
      const res = await fetch('/api/yoco/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutId }),
      })
      if (res.status === 401) {
        // Session gone. Apply the payment to the account that bought it anyway,
        // so it is waiting for them the moment they get back in.
        void claim()
        setStatus('login_required')
        return
      }
      const body = await res.json()
      if (res.ok && body.granted) {
        invalidateAccessCache()
        const verifyRes = await fetch('/api/me/access', { cache: 'no-store' })
        const verify = await verifyRes.json()
        if (!verify?.fullAccess) {
          console.error('[subscribe/success] confirm returned granted:true but /api/me/access still says fullAccess:false', verify)
          attempts.current += 1
          if (attempts.current >= 20) { void claim(); setStatus('manual'); return }
          setTimeout(confirm, 2000)
          return
        }
        try { localStorage.removeItem('sk_checkout') } catch {}
        setStatus('done')
        router.refresh()
        return
      }
      if (!res.ok && body.error && !body.pending) {
        setGrantError(body.error)
        void claim()
        setStatus('manual')
        return
      }
      if (body.error) {
        console.error('[subscribe/success] confirm error:', body.error)
      }
    } catch { /* keep trying */ }

    attempts.current += 1
    if (attempts.current >= 20) { void claim(); setStatus('manual') }
    else setTimeout(confirm, Math.min(2000 * Math.pow(1.3, attempts.current), 8000))
  }, [router, claim])

  useEffect(() => { confirm() }, [confirm])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        {status === 'confirming' && (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Confirming your payment…</h1>
            <p className="text-sm text-gray-500">Unlocking your {ACCESS_DURATION_DAYS}-day full access — just a moment.</p>
          </>
        )}

        {status === 'done' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You&apos;re in!</h1>
            <p className="text-sm text-gray-500 mb-5">Full access is unlocked on your account for {ACCESS_DURATION_DAYS} days.</p>

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
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment received</h1>
            <p className="text-sm text-gray-500 mb-4">
              {claimedForAccount
                ? <>Your {ACCESS_DURATION_DAYS} days are unlocked on the account you paid with. You were signed out while paying, so log back in to use it.</>
                : <>You were signed out while paying. Log in with the email you paid with and your access will be unlocked automatically.</>}
            </p>

            {code && <AccessCode code={code} />}

            <div className="flex flex-col gap-3">
              <Link href={`/login?next=${encodeURIComponent(RETURN_TO)}`} className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors text-center">Log in to continue</Link>
              {/* Paid customers who cannot get in are helped over WhatsApp
                  rather than an emailed reset — see WHATSAPP_LOGIN_URL. */}
              <a href={WHATSAPP_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="block w-full border-2 border-green-500 text-green-700 font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors text-center">
                Retrieve login
              </a>
            </div>
          </>
        )}

        {status === 'manual' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment received</h1>
            <p className="text-sm text-gray-500 mb-2">
              {grantError
                ? grantError
                : <>Your payment is safe and your {ACCESS_DURATION_DAYS} days are held against your account.</>}
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Access unlocks by itself, usually within a few minutes. You do not need to message anyone.
              Tap <strong>Unlock my access</strong> if you would rather not wait
              {code ? <>, or use the code below on whichever account you sign in to.</> : <>.</>}
            </p>

            {code && <AccessCode code={code} />}

            <div className="flex flex-col gap-3">
              <button onClick={() => { attempts.current = 0; setGrantError(''); setStatus('confirming'); confirm() }} className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">Unlock my access</button>
              <Link href={code ? `/access-code?code=${encodeURIComponent(code)}` : '/access-code'} className="block border-2 border-blue-200 text-blue-700 font-semibold py-3 rounded-xl hover:border-blue-400 transition-colors text-center">Use my access code</Link>
              <a href={WHATSAPP_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="block border-2 border-green-500 text-green-700 font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors text-center">Retrieve login</a>
              <Link href="/courses" className="block text-gray-500 font-medium py-2 hover:text-gray-700 text-sm text-center">Go to courses</Link>
              <a href={WHATSAPP_QUERIES_URL} target="_blank" rel="noopener noreferrer" className="block w-full text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 py-1 text-center">
                Still stuck after an hour? Message us
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
