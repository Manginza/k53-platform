'use client'

/**
 * LiveSessionPopup — a one-per-day reminder shown to full-access members,
 * every day from 6pm onwards, about tonight's 8pm live Learner's Licence
 * course session. Dismissible; won't reappear the same day. Self-gating via
 * /api/me/access so it can live in the root layout without making every page
 * dynamic. If the tab is already open before 6pm, it pops at 6pm.
 */
import { useEffect, useState } from 'react'
import { LIVE_SESSION_URL, LIVE_SESSION_NOTE } from '@/lib/contact'
import { getAccessStatus } from '@/lib/access-cache'

const DISMISS_KEY = 'sk_session_popup'
const START_HOUR = 20   // 8pm — popup opens
const END_HOUR   = 21   // 9pm — popup closes / never shows after this

export default function LiveSessionPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const today = new Date().toDateString()
    try { if (localStorage.getItem(DISMISS_KEY) === today) return } catch {}

    let cancelled = false
    let openTimer:  ReturnType<typeof setTimeout> | undefined
    let closeTimer: ReturnType<typeof setTimeout> | undefined

    getAccessStatus()
      .then(d => {
        // The session link is a premium benefit. A signed-in, pre-qualified
        // account is not active until payment has created an access grant.
        if (cancelled || !d?.fullAccess) return

        const now = new Date()
        const startAt = new Date(); startAt.setHours(START_HOUR, 0, 0, 0)
        const endAt   = new Date(); endAt.setHours(END_HOUR,   0, 0, 0)

        // Outside the 8pm–9pm window — don't show at all
        if (now >= endAt) return

        if (now >= startAt) {
          // Already inside the window → show immediately, close at 9pm
          setOpen(true)
          closeTimer = setTimeout(() => { if (!cancelled) setOpen(false) }, endAt.getTime() - now.getTime())
        } else {
          // Before 8pm → schedule open at 8pm and close at 9pm
          openTimer = setTimeout(() => {
            if (!cancelled) {
              setOpen(true)
              closeTimer = setTimeout(() => { if (!cancelled) setOpen(false) }, endAt.getTime() - startAt.getTime())
            }
          }, startAt.getTime() - now.getTime())
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (openTimer)  clearTimeout(openTimer)
      if (closeTimer) clearTimeout(closeTimer)
    }
  }, [])

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, new Date().toDateString()) } catch {}
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

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-indigo-600 fill-current" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Watch Learner&apos;s Licence Videos</h2>
        <p className="text-sm text-gray-600 mb-1">
          Study for your Learner&apos;s Licence with our video lessons — available now.
        </p>
        <p className="text-xs text-gray-400 mb-6">{LIVE_SESSION_NOTE}</p>

        <a
          href={LIVE_SESSION_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="block w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          Watch Learner&apos;s Licence Videos
        </a>
        <button onClick={dismiss} className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 text-sm transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  )
}
