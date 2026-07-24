/**
 * LiveSessionCard — shows the live evening study-session details + Google Meet
 * link to paid members (after checkout and on member pages). Server-safe.
 */
import { LIVE_SESSION_URL, LIVE_SESSION_SCHEDULE, LIVE_SESSION_NOTE } from '@/lib/contact'

const TONIGHT_LIVE_URL = 'https://youtube.com/live/wep9ne7rPG4?feature=share'
const TONIGHT_LIVE_START = Date.parse('2026-07-24T00:00:00+02:00')
const TONIGHT_LIVE_END = Date.parse('2026-07-24T21:30:00+02:00')

export default function LiveSessionCard({ className = '' }: { className?: string }) {
  const now = Date.now()
  const isTonightLive = now >= TONIGHT_LIVE_START && now < TONIGHT_LIVE_END
  const sessionUrl = isTonightLive ? TONIGHT_LIVE_URL : LIVE_SESSION_URL

  return (
    <div className={`bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-left ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">📹</span>
        <div className="min-w-0">
          <h3 className="font-extrabold text-indigo-900">
            {isTonightLive ? 'Road Signs Live Lesson — tonight' : 'Live evening study sessions'}
          </h3>
          <p className="text-sm text-indigo-800 mt-0.5">
            <strong>{isTonightLive ? 'Tonight, 8pm–9:30pm' : LIVE_SESSION_SCHEDULE}</strong>
          </p>
          <p className="text-xs text-indigo-700/80 mt-1">
            {isTonightLive
              ? 'Join our Road Signs live lesson on YouTube — walk through every sign you need to pass.'
              : LIVE_SESSION_NOTE}
          </p>
          <a
            href={sessionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            {isTonightLive ? 'Watch live on YouTube →' : 'Join on Google Meet →'}
          </a>
          <p className="text-[11px] text-indigo-700/70 mt-2 break-all">{sessionUrl}</p>
        </div>
      </div>
    </div>
  )
}
