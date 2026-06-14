'use client'

/**
 * BonusContentPopup — announces bonus learner's licence quizzes & content
 * hosted on SK Online Academy's Thinkific course. Shown once per visitor
 * (dismiss is remembered in localStorage). Bump POPUP_VERSION to re-announce.
 */
import { useEffect, useState } from 'react'

const POPUP_VERSION = 'v1'
const DISMISS_KEY = `sk_bonus_content_${POPUP_VERSION}`
const BONUS_QUIZ_URL =
  'https://skonlineacademy.thinkific.com/courses/take/learners-licence/quizzes/56657789-full-learner-licence-test-rules-of-the-road-part-1'

export default function BonusContentPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
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
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={dismiss} />

      {/* card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* header band */}
        <div className="bg-blue-700 text-white px-7 pt-7 pb-6 text-center relative">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 right-4 text-blue-200 hover:text-white text-2xl leading-none"
          >×</button>
          <span className="inline-block bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            Bonus Content
          </span>
          <div className="text-5xl mb-2">🎁</div>
          <h2 className="text-2xl font-extrabold mb-1">Bonus Learner&apos;s Licence Quizzes</h2>
          <p className="text-sm text-blue-100">Extra free practice content to help you pass</p>
        </div>

        {/* body */}
        <div className="px-7 py-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Here&apos;s a bonus quiz and study content covering the{' '}
            <strong>Rules of the Road</strong> — great extra practice alongside
            your tests here.
          </p>

          <a
            href={BONUS_QUIZ_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors"
          >
            Try the Bonus Quiz →
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
