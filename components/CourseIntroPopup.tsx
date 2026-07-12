'use client'

/**
 * CourseIntroPopup — a one-time welcome shown on /courses pages that gives
 * students five short tips for getting the most out of the K53 practice course
 * and links to the intro video. Dismiss is remembered in localStorage; bump
 * POPUP_VERSION to re-announce.
 */
import { useEffect, useState } from 'react'

const POPUP_VERSION  = 'v1'
const DISMISS_KEY    = `sk_course_intro_${POPUP_VERSION}`
const INTRO_VIDEO_URL = 'https://youtu.be/9AKAPUwpaHM'

export default function CourseIntroPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Only on the courses pages (list + detail).
    if (!window.location.pathname.startsWith('/courses')) return

    try { if (localStorage.getItem(DISMISS_KEY)) return } catch {}

    setOpen(true)
  }, [])

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, new Date().toISOString()) } catch {}
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={dismiss} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* header band */}
        <div className="bg-blue-700 text-white px-7 pt-7 pb-6 text-center relative">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 right-4 text-blue-200 hover:text-white text-2xl leading-none"
          >×</button>
          <span className="inline-block bg-white/15 text-blue-100 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            Welcome
          </span>
          <div className="text-5xl mb-2">🎯</div>
          <h2 className="text-2xl font-extrabold mb-1">Get the best out of this course</h2>
          <p className="text-sm text-blue-100">A 2-minute plan to pass your learner&apos;s test first time</p>
        </div>

        {/* body */}
        <div className="px-7 py-6">
          <ol className="space-y-3 text-sm text-gray-700 mb-5">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">1</span>
              <span><strong>Watch the intro video</strong> — it shows exactly how to use the course.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">2</span>
              <span><strong>Do all 3 practice tests</strong> for your licence code — don&apos;t skip any.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">3</span>
              <span><strong>Aim for 85%+</strong> before booking your test — the pass mark is 75%, give yourself margin.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">4</span>
              <span><strong>Retake the ones you fail</strong> — read the explanation on every wrong answer.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">5</span>
              <span><strong>Join the 7pm live session</strong> for last-minute questions the night before.</span>
            </li>
          </ol>

          <a
            href={INTRO_VIDEO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="block w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors text-center"
          >
            Watch the intro video →
          </a>
          <button
            onClick={dismiss}
            className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 text-sm"
          >
            Start practising
          </button>
        </div>
      </div>
    </div>
  )
}
