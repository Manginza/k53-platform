'use client'

/**
 * K53UnpackedPopup — a one-time "new feature" announcement for the K53 Unpacked
 * manual (Live Notes). Shown once per visitor (dismiss is remembered in
 * localStorage) to full-access (paid) members only, via /api/me/access — so the
 * app stays static. Bump POPUP_VERSION to re-announce in future.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAccessStatus } from '@/lib/access-cache'

const POPUP_VERSION = 'v1'
const DISMISS_KEY = `sk_feature_k53_unpacked_${POPUP_VERSION}`

export default function K53UnpackedPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Already dismissed this announcement?
    try { if (localStorage.getItem(DISMISS_KEY)) return } catch {}

    // Don't announce the feature while the user is already inside it.
    if (window.location.pathname.startsWith('/live-notes/k53')) return

    // This announcement links to premium content, so account identity alone
    // is not enough: the payment-backed fullAccess flag is required.
    let cancelled = false
    getAccessStatus()
      .then(d => { if (!cancelled && d?.fullAccess) setOpen(true) })
    return () => { cancelled = true }
  }, [])

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, new Date().toISOString()) } catch {}
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-gradient-to-br from-brand-900 to-brand-800 text-white px-7 pt-8 pb-7 text-center relative">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
          <span className="inline-block bg-green-500/20 text-green-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            New Feature
          </span>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-3">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
          </div>
          <h2 className="text-2xl font-extrabold mb-1">K53 Unpacked</h2>
          <p className="text-sm text-blue-200">The complete Learner&apos;s &amp; Driving Licence manual</p>
        </div>

        <div className="px-7 py-7 text-center">
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            Study the entire K53 book page-by-page — road signs, rules of the road,
            the driving test and more — with an <strong className="text-gray-900">exam-standard quiz after every chapter</strong>.
          </p>

          <Link
            href="/live-notes/k53"
            onClick={dismiss}
            className="block w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Explore K53 Unpacked
          </Link>
          <button
            onClick={dismiss}
            className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 text-sm transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
