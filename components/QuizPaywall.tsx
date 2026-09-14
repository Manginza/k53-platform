'use client'

/**
 * QuizPaywall — shown when a free user's 3-minute preview has expired.
 * Primary CTA: pay via Yoco (card). Secondary: WhatsApp.
 * Unlocks ALL features: unlimited timed tests, Live Notes, Road Rules, Videos.
 */
import Link from 'next/link'
import BuyAccessButton from '@/components/BuyAccessButton'
import { WHATSAPP_URL, ACCESS_PRICE, ACCESS_PRICE_ORIGINAL, ACCESS_DURATION_DAYS } from '@/lib/contact'

const FEATURES = [
  { icon: '📝', label: 'Unlimited timed practice tests', sub: '1 minute per question — just like the real exam' },
  { icon: '📖', label: 'Full Live Notes', sub: 'All 18 chapters of the Road Signs Manual + quizzes' },
  { icon: '📜', label: 'Rules of the Road', sub: '8 chapters with end-of-chapter exam questions' },
  { icon: '🎬', label: 'Video lessons', sub: 'Session recordings you can watch anytime' },
  { icon: '🗂️', label: 'Study resources', sub: 'Guides, notes and Code 10 memo slides' },
]

export default function QuizPaywall({ courseId }: { courseId: number }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">

        {/* Header */}
        <div className="bg-blue-700 text-white px-8 py-6 text-center">
          <div className="text-4xl mb-2">⏱️</div>
          <h1 className="text-2xl font-extrabold mb-1">Your free preview has ended</h1>
          <p className="text-blue-200 text-sm">
            Get full access for{' '}
            <span className="line-through text-blue-300 mr-1">{ACCESS_PRICE_ORIGINAL}</span>
            <strong className="text-white text-lg">{ACCESS_PRICE}</strong>
            {' '}· {ACCESS_DURATION_DAYS} days
          </p>
        </div>

        <div className="px-8 py-6">

          {/* What you unlock */}
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">What you unlock</p>
          <ul className="space-y-3 mb-6">
            {FEATURES.map(f => (
              <li key={f.label} className="flex items-start gap-3">
                <span className="text-xl shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.label}</p>
                  <p className="text-xs text-gray-400">{f.sub}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Primary: Yoco card payment */}
          <BuyAccessButton />

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">or pay via WhatsApp</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          {/* WhatsApp alternative */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border-2 border-green-600 text-green-700 font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.47 14.38c-.3-.15-1.74-.86-2-.95-.27-.1-.47-.15-.66.15-.2.3-.77.95-.94 1.15-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.57-.48-.5-.66-.5l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.74-.71 1.98-1.4.24-.68.24-1.27.17-1.4-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.5 9.5 0 01-4.84-1.33l-.35-.2-3.6.94.96-3.5-.23-.36a9.46 9.46 0 01-1.45-5.05c0-5.24 4.27-9.5 9.52-9.5 2.54 0 4.93.99 6.73 2.79a9.45 9.45 0 012.79 6.72c0 5.24-4.27 9.5-9.52 9.5zm5.55-15.05A11.43 11.43 0 0012.05 3C5.8 3 .72 8.08.72 14.33c0 2 .53 3.96 1.53 5.69L.64 26l6.13-1.61a11.4 11.4 0 005.28 1.34h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01z"/>
            </svg>
            Pay {ACCESS_PRICE} via WhatsApp
          </a>

          <div className="flex gap-3 mt-3">
            <Link
              href="/login"
              className="flex-1 text-center text-blue-700 font-semibold py-2.5 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors text-sm"
            >
              Log in
            </Link>
            <Link
              href={`/courses/${courseId}`}
              className="flex-1 text-center text-gray-500 font-medium py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
            >
              Back to course
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
