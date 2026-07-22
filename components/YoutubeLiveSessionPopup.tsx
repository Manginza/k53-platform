'use client'

/**
 * YoutubeLiveSessionPopup — reminder for tonight's 2-hour Learner's Licence
 * Live Session on YouTube (2026-07-23, 8pm to 10pm SAST).
 *
 * Two audiences with different rules:
 *
 *   - Anonymous visitors (not signed in):
 *       Reminder on every fresh browsing session until 10pm — pushes them
 *       to watch tonight even though they haven't registered. Dismiss is
 *       stored in sessionStorage so it doesn't flash on every navigation
 *       within the same tab, but reappears on a new tab or reload.
 *
 *   - Signed-in visitors (paid + registered):
 *       Fires once, from 6pm onwards (closer to 8pm), dismissible for
 *       good via localStorage. Less intrusive than the anon reminder
 *       because they've already committed to the platform.
 *
 * Auto-hides after the session's end time (10pm). Change SESSION_END to a
 * later timestamp to keep the reminder up (e.g. for a rerun).
 */
import { useEffect, useState } from 'react'
import { getAccessStatus } from '@/lib/access-cache'

const YOUTUBE_URL      = 'https://youtube.com/live/xtvTKAf5eJc?feature=share'
const SESSION_START    = Date.parse('2026-07-23T20:00:00+02:00') // 8pm SAST tonight
const SESSION_END      = Date.parse('2026-07-23T22:00:00+02:00') // 10pm SAST tonight
const PAID_REMIND_FROM = Date.parse('2026-07-23T18:00:00+02:00') // 6pm — 2 hours before start

const DISMISS_KEY = 'sk_yt_live_2026_07_23'

type Audience = 'signed_in' | 'anon'

export default function YoutubeLiveSessionPopup() {
  const [open, setOpen] = useState(false)
  const [audience, setAudience] = useState<Audience>('anon')

  useEffect(() => {
    const now = Date.now()
    if (!SESSION_END || now >= SESSION_END) return   // session over, never show again

    let cancelled = false
    getAccessStatus()
      .then(d => {
        if (cancelled) return
        const signedIn = !!(d?.fullAccess || d?.isLoggedIn)

        if (signedIn) {
          // Members / registered users → one-off, only from 6pm.
          if (now < PAID_REMIND_FROM) return
          try { if (localStorage.getItem(DISMISS_KEY) === 'seen') return } catch {}
          setAudience('signed_in')
          setOpen(true)
        } else {
          // Anonymous visitors → every fresh browsing session.
          try { if (sessionStorage.getItem(DISMISS_KEY) === 'seen') return } catch {}
          setAudience('anon')
          setOpen(true)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  function dismiss() {
    if (audience === 'signed_in') {
      try { localStorage.setItem(DISMISS_KEY, 'seen') } catch {}
    } else {
      // Session-scoped — comes back on new tab / reload for anon visitors.
      try { sessionStorage.setItem(DISMISS_KEY, 'seen') } catch {}
    }
    setOpen(false)
  }

  if (!open) return null

  const beforeStart = Date.now() < SESSION_START

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
          <p className="text-sm text-gray-700 mb-2">
            {beforeStart
              ? 'Join us for a live walkthrough of the K53 test — road signs, rules of the road and everything you need to pass first time.'
              : 'The session is happening right now — jump in and catch up on anything you missed.'}
          </p>
          <p className="text-xs text-gray-400 mb-5">
            Bring your questions — the chat is open on YouTube.
          </p>

          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="block w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors"
          >
            {beforeStart ? '📺 Watch on YouTube →' : '🔴 Join the live session →'}
          </a>
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
