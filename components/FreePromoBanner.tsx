'use client'

/**
 * FreePromoBanner — a persistent top bar announcing the free-access promotion,
 * with a live countdown to FREE_PROMO_UNTIL. Renders nothing once the promo
 * has ended (or is disabled). Sits above the navbar in the root layout.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FREE_PROMO_UNTIL } from '@/lib/contact'

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return { h, m, s }
}

export default function FreePromoBanner() {
  const end = FREE_PROMO_UNTIL ? Date.parse(FREE_PROMO_UNTIL) : 0
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!end) return
    const tick = () => setRemaining(end - Date.now())
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [end])

  if (!end || remaining === null || remaining <= 0) return null

  const { h, m, s } = parts(remaining)

  return (
    <div className="bg-green-600 text-white">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-x-3 gap-y-1 flex-wrap text-center">
        <span className="text-sm font-bold">
          🎉 The full course is FREE until 9pm tonight!
        </span>
        <span className="text-xs font-semibold bg-white/20 rounded-full px-2.5 py-0.5 tabular-nums">
          ⏱ {h}h {m.toString().padStart(2, '0')}m {s.toString().padStart(2, '0')}s left
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
