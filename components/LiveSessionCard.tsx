/**
 * LiveSessionCard — shows the live evening study-session details + Google Meet
 * link to paid members (after checkout and on member pages). Server-safe.
 */
import { LIVE_SESSION_URL, LIVE_SESSION_SCHEDULE, LIVE_SESSION_NOTE } from '@/lib/contact'

export default function LiveSessionCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-left ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">📹</span>
        <div className="min-w-0">
          <h3 className="font-extrabold text-indigo-900">Live evening study sessions</h3>
          <p className="text-sm text-indigo-800 mt-0.5">
            <strong>{LIVE_SESSION_SCHEDULE}</strong>
          </p>
          <p className="text-xs text-indigo-700/80 mt-1">{LIVE_SESSION_NOTE}</p>
          <a
            href={LIVE_SESSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            Join on Google Meet →
          </a>
          <p className="text-[11px] text-indigo-700/70 mt-2 break-all">{LIVE_SESSION_URL}</p>
        </div>
      </div>
    </div>
  )
}
