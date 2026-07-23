'use client'

/**
 * FreePromoBanner — a persistent top bar tied to the FREE_PROMO_FROM/UNTIL
 * window. Runs in three phases so a scheduled promo still generates urgency
 * BEFORE it starts:
 *
 *   - now < FROM   → teaser: "goes FREE at 8pm tonight!" with countdown to
 *                    unlock. Blue (calm, informative) so it doesn't compete
 *                    with the "active promo" branding.
 *   - FROM ≤ now < UNTIL → live: "FREE until 10pm tonight!" with countdown
 *                    to close. Green (active, celebratory).
 *   - now ≥ UNTIL  → nothing (promo over, back to paid).
 *
 * Both FROM and UNTIL are ISO strings from lib/contact — an empty FROM
 * means "already open".
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FREE_PROMO_FROM, FREE_PROMO_UNTIL } from '@/lib/contact'

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return { h, m, s }
}

function fmt({ h, m, s }: { h: number; m: number; s: number }) {
  return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
}

export default function FreePromoBanner() {
  const from  = FREE_PROMO_FROM  ? Date.parse(FREE_PROMO_FROM)  : 0
  const until = FREE_PROMO_UNTIL ? Date.parse(FREE_PROMO_UNTIL) : 0
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (!until) return
    const tick = () => setNow(Date.now())
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [until])

  if (!until || now === null) return null
  if (now >= until) return null

  // Teaser phase — before FROM
  if (from && now < from) {
    const t = parts(from - now)
    return (
      <div className="bg-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-x-3 gap-y-1 flex-wrap text-center">
          <span className="text-sm font-bold">
            ⏳ The full course goes FREE at 8pm tonight!
          </span>
          <span className="text-xs font-semibold bg-white/20 rounded-full px-2.5 py-0.5 tabular-nums">
            unlocks in {fmt(t)}
          </span>
          <Link
            href="/register"
            className="text-xs font-bold bg-white text-blue-700 rounded-full px-3 py-1 hover:bg-blue-50 transition-colors"
          >
            Register free →
          </Link>
        </div>
      </div>
    )
  }

  // Active phase — FROM ≤ now < UNTIL
  const t = parts(until - now)
  return (
    <div className="bg-green-600 text-white">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-x-3 gap-y-1 flex-wrap text-center">
        <span className="text-sm font-bold">
          🎉 The full course is FREE until 10pm tonight!
        </span>
        <span className="text-xs font-semibold bg-white/20 rounded-full px-2.5 py-0.5 tabular-nums">
          ⏱ {fmt(t)} left
        </span>
        <Link
          href="/courses"
          className="text-xs font-bold bg-white text-green-700 rounded-full px-3 py-1 hover:bg-green-50 transition-colors"
        >
          Start learning →
        </Link>
      </div>
    </div>
  )
}
