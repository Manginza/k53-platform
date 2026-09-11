/**
 * lib/trial-server.ts — server-only cookie logic for the free trial.
 *
 *   - k53_trial_start  — httpOnly cookie holding the start time (epoch ms).
 *                        Auto-expires after TRIAL_SECONDS, so a stale cookie
 *                        can never keep access open.
 *   - k53_trial_used   — httpOnly cookie that persists for a year, so the
 *                        trial cannot be restarted in the same browser once
 *                        it has been taken. (Clearing cookies resets it —
 *                        an accepted trade-off for a per-browser trial.)
 *
 * hasFullAccess() reads readTrialActive() and grants access while a trial is
 * live. POST /api/trial/start is the only place that sets the cookies.
 *
 * readTrialActive() and trialAlreadyUsed() are read-only and safe to call
 * during a Server Component render (they never set cookies).
 */
import { cookies } from 'next/headers'
import { TRIAL_START_COOKIE, TRIAL_USED_COOKIE, trialRemainingSeconds } from '@/lib/trial'

/**
 * Whether a trial is currently live for this browser. Read-only — reads the
 * start cookie and checks it against TRIAL_SECONDS. Safe inside a render.
 */
export function readTrialActive(now = Date.now()): boolean {
  const raw = cookies().get(TRIAL_START_COOKIE)?.value
  if (!raw) return false
  const startMs = Number(raw)
  if (!Number.isFinite(startMs)) return false
  return trialRemainingSeconds(startMs, now) > 0
}

/** Whether this browser has already taken its one trial. */
export function trialAlreadyUsed(): boolean {
  return !!cookies().get(TRIAL_USED_COOKIE)?.value
}
