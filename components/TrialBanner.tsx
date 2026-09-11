'use client'

/**
 * TrialBanner — sticky countdown shown while a free trial is live. Reads the
 * end time from localStorage (written by TrialButton). When the countdown
 * reaches zero it clears the marker and reloads, so the server re-gates the
 * page — the trial cookie has expired by then, so content re-locks.
 *
 * The server cookie is the real gate; this banner is only the visible timer.
 */
import { useEffect, useState } from 'react'
import { TRIAL_ENDS_STORAGE } from '@/lib/trial'

export default function TrialBanner() {
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TRIAL_ENDS_STORAGE)
      const ms = raw ? Number(raw) : NaN
      if (Number.isFinite(ms) && ms > Date.now()) setEndsAt(ms)
    } catch { /* no banner */ }
  }, [])

  useEffect(() => {
    if (endsAt === null) return
    const tick = () => setNow(Date.now())
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [endsAt])

  if (endsAt === null) return null

  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000))

  if (remaining <= 0) {
    try { localStorage.removeItem(TRIAL_ENDS_STORAGE) } catch {}
    // Re-render the current page against the (now-expired) trial cookie.
    if (typeof window !== 'undefined') window.location.reload()
    return null
  }

  const m = Math.floor(remaining / 60)
  const s = remaining % 60

  return (
    <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white">
      <div className="section-container py-2.5 flex items-center justify-center gap-x-3 gap-y-1 flex-wrap text-center">
        <span className="text-sm font-bold">Free trial — full course unlocked</span>
        <span className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1 tabular-nums backdrop-blur-sm">
          {m}:{s.toString().padStart(2, '0')} left
        </span>
      </div>
    </div>
  )
}
