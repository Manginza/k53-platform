'use client'

/**
 * TestPrepPopup — a one-per-day reminder shown to EVERYONE (not gated by
 * full-access) every day from 7pm onwards about tonight's 7pm Learner's Test
 * Preparation session. Dismissible; won't reappear the same day. Auto-closes
 * at 8pm to hand off to the existing 8pm session popup. If the tab is already
 * open before 7pm, it pops at 7pm.
 */
import { useEffect, useState } from 'react'
import { LIVE_SESSION_URL } from '@/lib/contact'

const DISMISS_KEY = 'sk_testprep_popup'
const START_HOUR = 19   // 7pm — popup opens
const END_HOUR   = 20   // 8pm — popup closes / never shows after this

export default function TestPrepPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const today = new Date().toDateString()
    try { if (localStorage.getItem(DISMISS_KEY) === today) return } catch {}

    let cancelled = false
    let openTimer:  ReturnType<typeof setTimeout> | undefined
    let closeTimer: ReturnType<typeof setTimeout> | undefined

    const now = new Date()
    const startAt = new Date(); startAt.setHours(START_HOUR, 0, 0, 0)
    const endAt   = new Date(); endAt.setHours(END_HOUR,   0, 0, 0)

    // Outside the 7pm–8pm window → don't show at all today
    if (now >= endAt) return

    if (now >= startAt) {
      // Already inside the window → show immediately, close at 8pm
      setOpen(true)
      closeTimer = setTimeout(() => { if (!cancelled) setOpen(false) }, endAt.getTime() - now.getTime())
    } else {
      // Before 7pm → schedule open at 7pm and close at 8pm
      openTimer = setTimeout(() => {
        if (!cancelled) {
          setOpen(true)
          closeTimer = setTimeout(() => { if (!cancelled) setOpen(false) }, endAt.getTime() - startAt.getTime())
        }
      }, startAt.getTime() - now.getTime())
    }

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
      <div className="absolute inset-0 bg-black/50" onClick={dismiss} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 text-center animate-[fadeIn_0.2s_ease-out]">
        <button onClick={dismiss} aria-label="Close" className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>

        <div className="text-5xl mb-3">📝</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Learner&apos;s Test Preparation — tonight at 7pm!</h2>
        <p className="text-sm text-gray-600 mb-1">
          Join our free <strong>Learner&apos;s Test Preparation</strong> session tonight at <strong>7pm</strong>.
        </p>
        <p className="text-xs text-gray-500 mb-5">
          Live on Google Meet — bring your questions and get ready for your test.
        </p>

        <a
          href={LIVE_SESSION_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="block w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Join the 7pm session →
        </a>
        <button onClick={dismiss} className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 text-sm">
          Maybe later
        </button>
      </div>
    </div>
  )
}
