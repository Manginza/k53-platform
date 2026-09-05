/**
 * lib/quiz-session.ts — server-side free-trial timer.
 *
 * The free 3-minute practice-test trial (see lib/free-trial.ts) is enforced
 * from the server so it can't be reset by reloading the page or editing the
 * client timer. The start time lives in `quiz_sessions` (keyed by user_id for
 * logged-in users, or an httpOnly cookie uuid for anonymous users).
 *
 * - readQuizTiming() — read-only; safe to call during a Server Component
 *   render (it never sets cookies). Used by the quiz page to short-circuit
 *   to the paywall when the trial has already expired.
 * - The POST /api/quiz/session route CREATES the session and sets the anon
 *   cookie (cookies can only be written from a route handler / action).
 */
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { hasFullAccess } from '@/lib/access'
import { FREE_TRIAL_SECONDS, FREE_TRIAL_ROLLOUT_AT } from '@/lib/free-trial'

export const FREE_PREVIEW_SECONDS = FREE_TRIAL_SECONDS
export const ANON_COOKIE = 'qz_sid'

export interface QuizTiming {
  premium:   boolean
  locked:    boolean   // free trial already expired
  remaining: number    // seconds left in the free trial
  exists:    boolean   // a session row already exists for this identity+test
}

/** Whether a stored session was started under the current trial length. */
export function isCurrentTrialSession(startedAtIso: string): boolean {
  const startedAt = Date.parse(startedAtIso)
  return Number.isFinite(startedAt) && startedAt >= Date.parse(FREE_TRIAL_ROLLOUT_AT)
}

/** Seconds left given a start timestamp. Invalid values fail open. */
export function remainingFrom(startedAtIso: string): number {
  const startedAt = Date.parse(startedAtIso)
  if (!Number.isFinite(startedAt)) return FREE_PREVIEW_SECONDS

  const elapsed = (Date.now() - startedAt) / 1000
  return Math.min(
    FREE_PREVIEW_SECONDS,
    Math.max(0, Math.ceil(FREE_PREVIEW_SECONDS - elapsed)),
  )
}

const FRESH_TRIAL: QuizTiming = { premium: false, locked: false, remaining: FREE_PREVIEW_SECONDS, exists: false }

/**
 * Read-only timing for the current visitor + test. Does NOT create a session
 * or set cookies — safe inside a Server Component render.
 */
export async function readQuizTiming(courseId: number, testNumber: number): Promise<QuizTiming> {
  if (await hasFullAccess()) {
    return { premium: true, locked: false, remaining: 0, exists: true }
  }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const sid = cookies().get(ANON_COOKIE)?.value

    // No identity yet → no session can exist; full trial ahead.
    if (!user && !sid) return FRESH_TRIAL

    const admin = createAdminClient()
    let query = admin
      .from('quiz_sessions')
      .select('started_at')
      .eq('course_id', courseId)
      .eq('test_number', testNumber)
      .limit(1)

    query = user ? query.eq('user_id', user.id) : query.eq('session_key', sid!)

    const { data, error } = await query.maybeSingle()
    if (error) {
      console.error('[quiz-session] timing lookup failed; allowing trial:', error.message)
      return FRESH_TRIAL
    }
    // No row, or a row from the old trial length → the route will (re)start
    // a fresh window on mount.
    if (!data?.started_at || !isCurrentTrialSession(data.started_at)) return FRESH_TRIAL

    const remaining = remainingFrom(data.started_at)
    return { premium: false, locked: remaining <= 0, remaining, exists: true }
  } catch (error) {
    // The trial is a marketing sample; it must never turn into a 500 page.
    console.error('[quiz-session] timing check failed; allowing trial:', error)
    return FRESH_TRIAL
  }
}
