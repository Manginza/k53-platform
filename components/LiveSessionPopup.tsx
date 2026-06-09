'use client'

/**
 * LiveSessionPopup — a one-per-day reminder shown to full-access members on
 * session days (Mon–Thu) about tonight's 8pm live study session. Dismissible;
 * won't reappear the same day. Self-gating via /api/me/access so it can live
 * in the root layout without making every page dynamic.
 */
import { useEffect, useState } from 'react'
import { LIVE_SESSION_URL, LIVE_SESSION_SCHEDULE, LIVE_SESSION_NOTE, LIVE_SESSION_RECORDING_URL } from '@/lib/contact'

const DISMISS_KEY = 'sk_session_popup'

export default function LiveSessionPopup() {
  const [open, setOpen] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState(LIVE_SESSION_RECORDING_URL)

  useEffect(() => {
    // Only on session days: Mon(1) – Thu(4) in the visitor's local time.
    const day = new Date().getDay()
    if (day < 1 || day > 4) return

    // Already dismissed today?
    const today = new Date().toDateString()
    try { if (localStorage.getItem(DISMISS_KEY) === today) return } catch {}

    let cancelled = false
    fetch('/api/me/access')
      .then(r => r.json())
      .then(d => {
        if (cancelled || !d?.fullAccess) return
        if (d.recordingUrl) setRecordingUrl(d.recordingUrl)
        setOpen(true)
      })
      .catch(() => {})
    return () => { cancelled = true }
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

        <div className="text-5xl mb-3">📹</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Live study session tonight!</h2>
        <p className="text-sm text-gray-600 mb-1">
          Join us this evening at <strong>8pm</strong>.
        </p>
        <p className="text-xs text-gray-500 mb-1">{LIVE_SESSION_SCHEDULE}</p>
        <p className="text-xs text-gray-400 mb-5">{LIVE_SESSION_NOTE}</p>

        <a
          href={LIVE_SESSION_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Join on Google Meet →
        </a>
        <a
          href={recordingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="block w-full border-2 border-indigo-200 text-indigo-700 font-semibold py-2.5 rounded-xl mt-2 hover:bg-indigo-50 transition-colors text-sm"
        >
          📹 Missed a session? Watch the recording
        </a>
        <button onClick={dismiss} className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 text-sm">
          Maybe later
        </button>
      </div>
    </div>
  )
}
