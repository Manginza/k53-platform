'use client'

/**
 * ContentPreviewGate — wraps Live Notes / Rules of the Road content for
 * non-paying visitors. Shows a sticky countdown banner; when the shared
 * 3-minute server-enforced preview window expires it replaces the content
 * with the paywall. The server also gates on every navigation (readContentTiming),
 * so this is the in-page enforcement for a visitor who lingers past the window.
 */
import { useEffect, useState } from 'react'
import LockedContent from '@/components/LockedContent'

function fmt(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ContentPreviewGate({
  initialSeconds,
  feature,
  description,
  children,
}: {
  initialSeconds: number
  feature: string
  description: string
  children: React.ReactNode
}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [locked, setLocked] = useState(initialSeconds <= 0)

  // Reconcile with the authoritative server window on mount (and start it if new).
  useEffect(() => {
    let cancelled = false
    fetch('/api/content/session', { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        if (cancelled || d.unlimited) return
        if (d.locked) { setLocked(true); return }
        if (typeof d.remaining === 'number') {
          setSecondsLeft(s => Math.min(s, d.remaining))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Countdown.
  useEffect(() => {
    if (locked) return
    if (secondsLeft <= 0) { setLocked(true); return }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [locked, secondsLeft])

  if (locked) {
    return <LockedContent feature={feature} description={description} />
  }

  return (
    <>
      {/* Free preview countdown banner */}
      <div className="sticky top-14 z-30 bg-amber-50 border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-amber-800 font-medium">
            🔓 Free preview — full access unlocks everything
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 tabular-nums ${
              secondsLeft <= 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
            }`}
            title="Free preview time remaining"
          >
            ⏱ {fmt(secondsLeft)}
          </span>
        </div>
      </div>

      {children}
    </>
  )
}
