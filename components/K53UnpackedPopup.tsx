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

    // Full-access (paid) members only.
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
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={dismiss} />

      {/* card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* header band */}
        <div className="bg-gray-900 text-white px-7 pt-7 pb-6 text-center relative">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl leading-none"
          >×</button>
          <span className="inline-block bg-green-500/20 text-green-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            New Feature
          </span>
          <div className="text-5xl mb-2">🚗</div>
          <h2 className="text-2xl font-extrabold mb-1">K53 Unpacked</h2>
          <p className="text-sm text-gray-300">The complete Learner&apos;s &amp; Driving Licence manual</p>
        </div>

        {/* body */}
        <div className="px-7 py-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Study the entire K53 book page-by-page — road signs, rules of the road,
            the driving test and more — with an <strong>exam-standard quiz after every chapter</strong>.
          </p>

          <Link
            href="/live-notes/k53"
            onClick={dismiss}
            className="block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Explore K53 Unpacked →
          </Link>
          <button
            onClick={dismiss}
            className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 text-sm"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
