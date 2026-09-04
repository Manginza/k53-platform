/**
 * LiveSessionCard — shows the live evening study-session details + YouTube
 * link to paid members (after checkout and on member pages). Server-safe.
 */
import { LIVE_SESSION_URL, LIVE_SESSION_NOTE } from '@/lib/contact'

export default function LiveSessionCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-left ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">📹</span>
        <div className="min-w-0">
          <h3 className="font-extrabold text-indigo-900">Learner&apos;s Licence Video Lessons</h3>
          <p className="text-sm text-indigo-800 mt-0.5">
            <strong>Study at your own pace</strong>
          </p>
          <p className="text-xs text-indigo-700/80 mt-1">{LIVE_SESSION_NOTE}</p>
          <a
            href={LIVE_SESSION_URL}
            className="inline-flex items-center gap-2 mt-3 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            Watch Learner&apos;s Licence Videos →
          </a>
        </div>
      </div>
    </div>
  )
}
