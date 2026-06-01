'use client'

/**
 * BuyAccessButton — primary "Pay R150" action. Creates a Yoco checkout and
 * redirects the buyer to Yoco's hosted payment page. On failure it surfaces a
 * message (WhatsApp remains available as the alternative).
 */
import { useState } from 'react'
import { ACCESS_PRICE, ACCESS_DURATION_DAYS } from '@/lib/contact'

export default function BuyAccessButton({ className = '' }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function pay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/yoco/create-checkout', { method: 'POST' })
      const body = await res.json()
      if (!res.ok || !body.redirectUrl) throw new Error(body.error ?? 'Could not start payment.')
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
        {loading ? 'Redirecting to payment…' : `Pay ${ACCESS_PRICE} — ${ACCESS_DURATION_DAYS} days · card`}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
