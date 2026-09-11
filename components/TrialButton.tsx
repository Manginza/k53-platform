'use client'

/**
 * TrialButton — starts the one-time, per-browser 2-minute free trial from a
 * paywall. On success it records the end time in localStorage (for the
 * countdown banner) and reloads, so the server re-renders the page with
 * access granted. Hidden once the trial has been used in this browser.
 */
import { useEffect, useState } from 'react'
import { TRIAL_SECONDS, TRIAL_USED_STORAGE, TRIAL_ENDS_STORAGE } from '@/lib/trial'

const MINUTES = Math.round(TRIAL_SECONDS / 60)

export default function TrialButton() {
  const [used, setUsed] = useState(true) // assume used until we can check — avoids a flash
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      setUsed(localStorage.getItem(TRIAL_USED_STORAGE) === '1')
    } catch {
      setUsed(false) // storage blocked — let the server be the gate
    }
  }, [])

  if (used) return null

  async function start() {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/trial/start', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        try {
          localStorage.setItem(TRIAL_USED_STORAGE, '1')
          localStorage.setItem(TRIAL_ENDS_STORAGE, String(data.endsAt))
        } catch { /* countdown just won't show; access still works */ }
        window.location.reload()
        return
      }
      if (res.status === 409) {
        try { localStorage.setItem(TRIAL_USED_STORAGE, '1') } catch {}
        setUsed(true)
        return
      }
      setError('Could not start the trial. Please try again.')
    } catch {
      setError('Could not start the trial. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-4">
      <button
        onClick={start}
        disabled={busy}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {busy ? 'Starting…' : `Try free for ${MINUTES} minutes`}
      </button>
      <p className="text-xs text-gray-400 mt-1.5 text-center">
        One-time preview of the full course — no card needed.
      </p>
      {error && <p className="text-xs text-red-500 mt-1 text-center">{error}</p>}
    </div>
  )
}
