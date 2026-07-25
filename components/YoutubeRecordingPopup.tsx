'use client'

/**
 * YoutubeRecordingPopup — "missed the live? watch the recording" nudge
 * for Monday's Rules of the Road Part 2 live lesson on YouTube.
 *
 * Shown to EVERYONE (paying and non-paying) once the live session has
 * ended (9pm SAST on 27 July) and for one week afterwards, so people
 * who couldn't tune in still get a clear hook back to the recording.
 * One-off dismissal per user via localStorage — clicking the CTA,
 * closing with × / "Maybe later", or clicking the backdrop all count
 * as a dismiss and the popup never comes back.
 *
 * The active-session popup (YoutubeLiveSessionPopup) auto-hides at
 * 9pm, so the two don't overlap.
 */
import { useEffect, useState } from 'react'

const YOUTUBE_URL      = 'https://youtube.com/live/En6IEUZW6Oo?feature=share'
const WINDOW_START     = Date.parse('2026-07-27T21:00:00+02:00') // 9pm SAST — right when the live session ends
const WINDOW_END       = Date.parse('2026-08-03T21:00:00+02:00') // 7 days later — hide entirely after that

const DISMISS_KEY = 'sk_yt_recording_2026_07_27_seen'

export default function YoutubeRecordingPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const now = Date.now()
    if (now < WINDOW_START || now >= WINDOW_END) return

    try { if (localStorage.getItem(DISMISS_KEY) === 'seen') return } catch {}

    setOpen(true)
  }, [])

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, 'seen') } catch {}
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={dismiss} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">

        {/* Header — recording-flavoured band, still YouTube red so it's obviously YouTube */}
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
              📺 Recording
            </span>
            <span className="text-xs font-semibold text-red-100">on YouTube</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">
            Missed the live session? Watch it back.
          </h2>
          <p className="text-red-100 text-sm mt-1">
            Rules of the Road Part 2 · 27 July
          </p>
        </div>

        {/* Body */}
        <div className="px-7 py-6 text-center">
          <p className="text-sm text-gray-700 mb-2">
            Couldn&apos;t make it live? The full Rules of the Road Part 2 recording is
            up on YouTube — the rules you need to pass first time.
          </p>
          <p className="text-xs text-gray-400 mb-5">
            Watch at your own pace, pause and rewind as much as you like.
          </p>

          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="block w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors"
          >
            📺 Watch the recording →
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
