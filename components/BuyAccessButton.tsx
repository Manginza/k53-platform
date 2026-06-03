'use client'

/**
 * BuyAccessButton — primary "Pay R99" action. Requires a logged-in account;
 * if not logged in, sends the visitor to register first. Stashes the Yoco
 * checkout id so the success page can confirm the payment and grant access.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ACCESS_PRICE, ACCESS_PRICE_ORIGINAL, ACCESS_DURATION_DAYS } from '@/lib/contact'

export default function BuyAccessButton({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function pay() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/yoco/create-checkout', { method: 'POST' })
      if (res.status === 401) {
        // Not logged in — register/log in first, then come back to pay.
        router.push('/register?next=/pricing')
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
  }

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
            <span className="font-normal opacity-80">· {ACCESS_DURATION_DAYS} days · card</span>
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
