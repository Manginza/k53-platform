'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso)
    const h = d.getHours()
    const m = d.getMinutes()
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    const ap = h >= 12 ? 'pm' : 'am'
    if (m === 0) return `${h12}${ap}`
    return `${h12}:${m.toString().padStart(2, '0')}${ap}`
  } catch { return '' }
}

export default function FreePromoBanner() {
  const [from, setFrom]   = useState(0)
  const [until, setUntil] = useState(0)
  const [fromIso, setFromIso] = useState('')
  const [untilIso, setUntilIso] = useState('')
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/promo').then(r => r.json()).then(d => {
      setFrom(d.from ? Date.parse(d.from) : 0)
      setUntil(d.until ? Date.parse(d.until) : 0)
      setFromIso(d.from || '')
      setUntilIso(d.until || '')
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!until) return
    const tick = () => setNow(Date.now())
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [until])

  if (!until || now === null) return null
  if (now >= until) return null

  const untilLabel = fmtTime(untilIso)
  const fromLabel  = fmtTime(fromIso)

  if (from && now < from) {
    const t = parts(from - now)
    return (
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 text-white">
        <div className="section-container py-2.5 flex items-center justify-center gap-x-3 gap-y-1 flex-wrap text-center">
          <span className="text-sm font-bold">
            The full course goes FREE at {fromLabel} tonight!
          </span>
          <span className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1 tabular-nums backdrop-blur-sm">
            unlocks in {fmt(t)}
          </span>
          <Link
            href="/register"
            className="text-xs font-bold bg-accent-400 text-brand-900 rounded-full px-4 py-1.5 hover:bg-accent-500 transition-all duration-200"
          >
            Register free
          </Link>
        </div>
      </div>
    )
  }

  const t = parts(until - now)
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
      <div className="section-container py-2.5 flex items-center justify-center gap-x-3 gap-y-1 flex-wrap text-center">
        <span className="text-sm font-bold">
          The full course is FREE until {untilLabel}!
        </span>
        <span className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1 tabular-nums backdrop-blur-sm">
          {fmt(t)} left
        </span>
        <Link
          href="/courses"
          className="text-xs font-bold bg-white text-green-700 rounded-full px-4 py-1.5 hover:bg-green-50 transition-all duration-200"
        >
          Start learning
        </Link>
      </div>
    </div>
  )
}
