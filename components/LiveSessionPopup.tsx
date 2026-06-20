'use client'

/**
 * LiveSessionPopup — a one-per-day reminder shown to full-access members,
 * every day from 6pm onwards, about tonight's 8pm live Learner's Licence
 * course session. Dismissible; won't reappear the same day. Self-gating via
 * /api/me/access so it can live in the root layout without making every page
 * dynamic. If the tab is already open before 6pm, it pops at 6pm.
 */
import { useEffect, useState } from 'react'

const DISMISS_KEY = 'sk_session_popup'
const ACTIVATE_HOUR = 18

export default function LiveSessionPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const today = new Date().toDateString()
    try { if (localStorage.getItem(DISMISS_KEY) === today) return } catch {}

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    fetch('/api/me/access')
      .then(r => r.json())
      .then(d => {
        if (cancelled || !d?.fullAccess) return

        const now = new Date()
        const activateAt = new Date()
        activateAt.setHours(ACTIVATE_HOUR, 0, 0, 0)

        if (now >= activateAt) {
          setOpen(true)                                   // already past 6pm → show now
        } else {
          timer = setTimeout(                             // open the tab early? pop at 6pm
            () => { if (!cancelled) setOpen(true) },
            activateAt.getTime() - now.getTime(),
          )
        }
      })
      .catch(() => {})
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [])

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, new Date().toDateString()) } catch {}
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={dismiss} />
      {/* card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 text-center animate-[fadeIn_0.2s_ease-out]">
        <button onClick={dismiss} aria-label="Close" className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>

        <div className="text-5xl mb-3">⚠️</div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Session Notice</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-2">
          We apologise — live sessions will <strong>not be available this Wednesday and Thursday</strong>.
        </p>
        <p className="text-sm text-gray-700 mb-4">
          Sessions will resume on <strong>Monday</strong>. Sorry for the inconvenience.
        </p>
        <p className="text-xs text-gray-500 mb-5">
          In the meantime, catch up on the recording videos — more will be uploaded soon.
        </p>

        <a
          href="/videos"
          onClick={dismiss}
          className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Watch Session Recordings →
        </a>
        <button onClick={dismiss} className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 text-sm">
          OK, got it
        </button>
      </div>
    </div>
  )
}
