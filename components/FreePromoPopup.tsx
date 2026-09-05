'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso)
    const h = d.getHours()
    const m = d.getMinutes()
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    const ap = h >= 12 ? 'pm' : 'am'
    if (m === 0) return `${h12}${ap}`
    return `${h12}:${m.toString().padStart(2, '0')}${ap}`
  } catch { return '' }
}

export default function FreePromoPopup() {
  const [open, setOpen] = useState(false)
  const [untilLabel, setUntilLabel] = useState('')
  const [dismissKey, setDismissKey] = useState('')

  useEffect(() => {
    fetch('/api/promo').then(r => r.json()).then(d => {
      if (!d.until) return
      const now = Date.now()
      const from = d.from ? Date.parse(d.from) : 0
      const end  = Date.parse(d.until)
      if (now >= end) return
      if (from && now < from) return
      const key = `sk_free_promo_${d.until}`
      setDismissKey(key)
      setUntilLabel(fmtTime(d.until))
      try { if (localStorage.getItem(key) === 'seen') return } catch {}
      setOpen(true)
    }).catch(() => {})
  }, [])

  function dismiss() {
    if (dismissKey) try { localStorage.setItem(dismissKey, 'seen') } catch {}
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-[fadeIn_0.2s_ease-out]">
        <button onClick={dismiss} aria-label="Close" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200">
          <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-600 fill-current" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">The course is FREE until {untilLabel}!</h2>
        <p className="text-sm text-gray-600 mb-1">
          Until <strong className="text-gray-900">{untilLabel}</strong>, the entire course is unlocked — <strong className="text-green-600">no payment needed</strong>.
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Unlimited practice tests, full Live Notes, and the complete Rules of the Road. Don&apos;t miss it!
        </p>

        <Link
          href="/courses"
          onClick={dismiss}
          className="block w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          Start Learning Free
        </Link>
        <button onClick={dismiss} className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 text-sm transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  )
}
