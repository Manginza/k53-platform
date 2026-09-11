/**
 * POST /api/trial/start — begin this browser's one-time free trial.
 *
 * Sets an httpOnly start cookie (auto-expiring after TRIAL_SECONDS) plus a
 * long-lived "used" marker so the trial cannot be restarted. Returns the end
 * time so the client can show a countdown. hasFullAccess() honours the start
 * cookie, so every gated surface unlocks for the duration.
 *
 * Refuses (409) if this browser has already taken its trial. Never throws.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { TRIAL_SECONDS, TRIAL_START_COOKIE, TRIAL_USED_COOKIE } from '@/lib/trial'
import { trialAlreadyUsed } from '@/lib/trial-server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    if (trialAlreadyUsed()) {
      return NextResponse.json({ ok: false, reason: 'used' }, { status: 409 })
    }

    const now = Date.now()
    const store = cookies()
    const base = { httpOnly: true, sameSite: 'lax' as const, path: '/', secure: true }

    store.set(TRIAL_START_COOKIE, String(now), { ...base, maxAge: TRIAL_SECONDS })
    store.set(TRIAL_USED_COOKIE, '1', { ...base, maxAge: 60 * 60 * 24 * 365 })

    return NextResponse.json({
      ok: true,
      seconds: TRIAL_SECONDS,
      endsAt: now + TRIAL_SECONDS * 1000,
    })
  } catch {
    return NextResponse.json({ ok: false, reason: 'error' }, { status: 500 })
  }
}
