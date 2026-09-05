'use client'

/**
 * BuyAccessButton — primary "Pay R99" action.
 *
 * Enforces register-before-pay:
 *   - If the user isn't logged in, we send them to /register?next=/pricing?pay=1
 *     (or /login for the "already have an account" path). Once they come back
 *     signed in with `?pay=1` still on the URL, this component auto-fires the
 *     checkout so they don't have to click Pay a second time.
 *   - When Yoco returns the redirect URL we stash the checkout id in
 *     localStorage so /subscribe/success can confirm the payment and grant
 *     access to that same account.
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ACCESS_PRICE, ACCESS_PRICE_ORIGINAL, ACCESS_DURATION_DAYS } from '@/lib/contact'
import { getAccessStatus } from '@/lib/access-cache'

export default function BuyAccessButton({
  className = '',
  durationDays: durationDaysProp,
}: {
  className?: string
  /**
   * The window to quote, when the page already resolved it server-side.
   * Pass it wherever the surrounding page also prints the number, so the two
   * cannot disagree and nothing shifts after hydration.
   */
  durationDays?: number
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // A customer grandfathered onto the longer plan must be quoted the window
  // they will actually be given, not the current standard one. The server
  // decides that; this only asks. It starts on the standard window so the
  // button renders immediately, and this endpoint is cached and deduplicated
  // per tab, so asking costs nothing on top of what the page already fetches.
  const [fetchedDays, setFetchedDays] = useState(ACCESS_DURATION_DAYS)
  const durationDays = durationDaysProp ?? fetchedDays
  useEffect(() => {
    if (durationDaysProp != null) return          // the page already knows
    let cancelled = false
    getAccessStatus()
      .then(status => {
        if (!cancelled && status.accessDurationDays) setFetchedDays(status.accessDurationDays)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [durationDaysProp])

  const pay = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/yoco/create-checkout', { method: 'POST' })
      if (res.status === 401) {
        // Not logged in → register first. Keep the ?pay=1 intent flag so the
        // button auto-fires after register redirects them back.
        router.push('/register?next=' + encodeURIComponent('/pricing?pay=1'))
        return
      }
      const body = await res.json()
      if (!res.ok || !body.redirectUrl) throw new Error(body.error ?? 'Could not start payment.')
      if (body.checkoutId) {
        try { localStorage.setItem('sk_checkout', body.checkoutId) } catch {}
      }
      window.location.href = body.redirectUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start payment. Please try WhatsApp.')
      setLoading(false)
    }
  }, [router])

  // Auto-continue after register: if we came back with ?pay=1 in the URL AND
  // the user is now signed in, kick off the checkout without needing another
  // click. Guarded against loops — we only auto-fire once per page load, and
  // never fire if there's no session (letting the user click manually).
  //
  // Reads the URL directly (not useSearchParams) so this client component
  // stays compatible with the statically-prerendered /pricing page without
  // needing a Suspense wrapper around it.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const shouldPay = new URLSearchParams(window.location.search).get('pay') === '1'
    if (!shouldPay) return
    let cancelled = false
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled || !session) return
      // Strip the flag from the URL so a refresh / back-nav doesn't refire.
      try {
        const url = new URL(window.location.href)
        url.searchParams.delete('pay')
        window.history.replaceState({}, '', url.toString())
      } catch {}
      void pay()
    })()
    return () => { cancelled = true }
  }, [supabase, pay])

  return (
    <div className={className}>
      <button
        onClick={pay}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-60"
      >
        {loading ? (
          'Redirecting to payment…'
        ) : (
          <>
            Pay <span className="line-through opacity-70 font-normal">{ACCESS_PRICE_ORIGINAL}</span>
            <span>{ACCESS_PRICE}</span>
            <span className="font-normal opacity-80">· {durationDays} days · card</span>
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
