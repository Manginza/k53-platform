'use client'

/**
 * FreePromoPopup — a one-time dismissible popup announcing the 24-hour
 * free-access promotion. Shows once per promo (keyed by the deadline, so a
 * future promo re-shows). Renders nothing once the promo has ended.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FREE_PROMO_UNTIL } from '@/lib/contact'

export default function FreePromoPopup() {
  const [open, setOpen] = useState(false)
  const end = FREE_PROMO_UNTIL ? Date.parse(FREE_PROMO_UNTIL) : 0
  const dismissKey = `sk_free_promo_${FREE_PROMO_UNTIL}`

  useEffect(() => {
    if (!end || Date.now() >= end) return
    try { if (localStorage.getItem(dismissKey) === 'seen') return } catch {}
    setOpen(true)
  }, [end, dismissKey])

  function dismiss() {
    try { localStorage.setItem(dismissKey, 'seen') } catch {}
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={dismiss} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 text-center animate-[fadeIn_0.2s_ease-out]">
        <button onClick={dismiss} aria-label="Close" className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>

        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">The course is FREE until 10pm tonight!</h2>
        <p className="text-sm text-gray-600 mb-1">
          Until <strong>10pm tonight</strong>, the entire course is unlocked — <strong>no payment needed</strong>.
        </p>
        <p className="text-sm text-gray-600 mb-5">
          Unlimited practice tests, full Live Notes, and the complete Rules of the Road. Don&apos;t miss it!
        </p>

        <Link
          href="/courses"
          onClick={dismiss}
          className="block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors"
        >
          Start Learning Free →
        </Link>
        <button onClick={dismiss} className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 text-sm">
          Maybe later
        </button>
      </div>
    </div>
  )
}
