'use client'

/**
 * YoutubeLiveSessionPopup — reminder for tonight's 2-hour Learner's Licence
 * Live Session on YouTube (2026-07-23, 8pm to 10pm SAST).
 *
 * Cadence: once per hour, for EVERYONE (anon, registered, paid). We store
 * the timestamp of the last time we showed the popup in localStorage;
 * on mount, if that's more than an hour ago (or never), we show it and
 * bump the timestamp to now. That means:
 *   - dismissing via X / "Maybe later" / clicking the CTA hides it for
 *     ~an hour;
 *   - just closing the tab without dismissing has the same effect —
 *     the "last shown" timestamp was already set on mount;
 *   - once the hour passes, the very next page load shows it again.
 *
 * Auto-hides entirely after the session's end time (10pm SAST), so the
 * popup won't linger into tomorrow.
 */
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getAccessStatus } from '@/lib/access-cache'

const YOUTUBE_URL       = 'https://youtube.com/live/eazLGnuFF5k?feature=share'
const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/eazLGnuFF5k?autoplay=1'
const SESSION_START     = Date.parse('2026-07-23T20:00:00+02:00') // 8pm SAST tonight
const SESSION_END       = Date.parse('2026-07-23T22:00:00+02:00') // 10pm SAST tonight
const REMIND_INTERVAL_MS = 60 * 60 * 1000                          // 1 hour
const PREVIEW_LENGTH_MS = 2 * 60 * 1000                            // 2 minutes

const LAST_SHOWN_KEY = 'sk_yt_live_2026_07_23_last_shown_ms'
const PREVIEW_STARTED_KEY = 'sk_yt_live_2026_07_23_preview_started_ms'

export default function YoutubeLiveSessionPopup() {
  const [open, setOpen] = useState(false)
  const [clockNow, setClockNow] = useState(() => Date.now())
  const [hasFullAccess, setHasFullAccess] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [previewExpired, setPreviewExpired] = useState(false)
  const [previewSecondsLeft, setPreviewSecondsLeft] = useState(PREVIEW_LENGTH_MS / 1000)

  useEffect(() => {
    const now = Date.now()
    if (!SESSION_END || now >= SESSION_END) return   // session over, never show again

    let cancelled = false

    getAccessStatus().then(access => {
      if (cancelled) return
      setHasFullAccess(access.fullAccess)

      let lastShown = 0
      try {
        const raw = localStorage.getItem(LAST_SHOWN_KEY)
        lastShown = raw ? Number(raw) : 0
        if (!Number.isFinite(lastShown)) lastShown = 0
      } catch {
        lastShown = 0
      }

      if (now - lastShown < REMIND_INTERVAL_MS) return

      if (!access.fullAccess) {
        try {
          const raw = localStorage.getItem(PREVIEW_STARTED_KEY)
          const previewStarted = raw ? Number(raw) : 0
          if (Number.isFinite(previewStarted) && previewStarted > 0) {
            setPreviewExpired(now - previewStarted >= PREVIEW_LENGTH_MS)
          }
        } catch {}
      }

      try { localStorage.setItem(LAST_SHOWN_KEY, String(now)) } catch {}
      setOpen(true)
    })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!previewing) return

    const updateTimer = () => {
      let previewStarted = Date.now()
      try {
        const raw = localStorage.getItem(PREVIEW_STARTED_KEY)
        const stored = raw ? Number(raw) : 0
        if (Number.isFinite(stored) && stored > 0) previewStarted = stored
      } catch {}

      const remainingMs = Math.max(0, PREVIEW_LENGTH_MS - (Date.now() - previewStarted))
      setPreviewSecondsLeft(Math.ceil(remainingMs / 1000))
      if (remainingMs === 0) {
        setPreviewing(false)
        setPreviewExpired(true)
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 250)
    return () => clearInterval(timer)
  }, [previewing])

  useEffect(() => {
    if (!open) return

    const updateClock = () => {
      const now = Date.now()
      setClockNow(now)
      if (now >= SESSION_END) setOpen(false)
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [open])

  function dismiss() { setOpen(false) }

  function startPreview() {
    if (Date.now() < SESSION_START) return

    let previewStarted = 0
    try {
      const raw = localStorage.getItem(PREVIEW_STARTED_KEY)
      previewStarted = raw ? Number(raw) : 0
      if (!Number.isFinite(previewStarted) || previewStarted <= 0) {
        previewStarted = Date.now()
        localStorage.setItem(PREVIEW_STARTED_KEY, String(previewStarted))
      }
    } catch {
      previewStarted = Date.now()
    }

    const remainingMs = PREVIEW_LENGTH_MS - (Date.now() - previewStarted)
    if (remainingMs <= 0) {
      setPreviewExpired(true)
      return
    }

    setPreviewSecondsLeft(Math.ceil(remainingMs / 1000))
    setPreviewing(true)
  }

  if (!open) return null

  const beforeStart = clockNow < SESSION_START

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={dismiss} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">

        {/* Header — YouTube-red band with a live indicator */}
        <div className="bg-red-600 text-white px-7 pt-6 pb-5 text-center relative">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 right-4 text-red-100 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {beforeStart ? 'Tonight' : 'Live now'}
            </span>
            <span className="text-xs font-semibold text-red-100">on YouTube</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">
            2-hour Learner&apos;s Licence Live Session
          </h2>
          <p className="text-red-100 text-sm mt-1">
            Tonight · <strong className="text-white">8pm to 10pm</strong> · SAST
          </p>
        </div>

        {/* Body */}
        <div className="px-7 py-6 text-center">
          {previewing ? (
            <>
              <div className="aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                  src={YOUTUBE_EMBED_URL}
                  title="Learner's Licence live-session preview"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
              <p className="mt-3 text-sm font-bold text-red-600">
                Free preview: {Math.floor(previewSecondsLeft / 60)}:{String(previewSecondsLeft % 60).padStart(2, '0')} remaining
              </p>
            </>
          ) : previewExpired && !hasFullAccess ? (
            <>
              <h3 className="text-lg font-extrabold text-gray-900">Your free preview has ended</h3>
              <p className="text-sm text-gray-600 mt-1 mb-5">
                Get full access to continue watching tonight&apos;s live session.
              </p>
              <Link
                href="/pricing"
                onClick={dismiss}
                className="block w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors"
              >
                Get full access →
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700 mb-2">
                {beforeStart
                  ? 'Join us for a live walkthrough of the K53 test — road signs, rules of the road and everything you need to pass first time.'
                  : 'The session is happening right now — jump in and catch up on anything you missed.'}
              </p>
              <p className="text-xs text-gray-400 mb-5">
                {hasFullAccess
                  ? 'Bring your questions — the chat is open on YouTube.'
                  : 'Guests can watch a free 2-minute preview.'}
              </p>

              {hasFullAccess ? (
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismiss}
                  className="block w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors"
                >
                  {beforeStart ? '📺 Watch on YouTube →' : '🔴 Join the live session →'}
                </a>
              ) : (
                <button
                  onClick={startPreview}
                  disabled={beforeStart}
                  className="block w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {beforeStart ? 'Preview available at 8pm' : 'Watch free 2-minute preview →'}
                </button>
              )}
            </>
          )}
          {!previewing && (
            <button
              onClick={dismiss}
              className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 text-sm"
            >
              Maybe later
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
