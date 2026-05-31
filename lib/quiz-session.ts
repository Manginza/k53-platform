/**
 * lib/quiz-session.ts — server-side free-preview timer.
 *
 * The free 3-minute quiz preview is enforced from the server so it can't be
 * reset by reloading the page or editing the client timer. The start time
 * lives in `quiz_sessions` (keyed by user_id for logged-in users, or an
 * httpOnly cookie uuid for anonymous users).
 *
 * - readQuizTiming() — read-only; safe to call during a Server Component
 *   render (it never sets cookies). Used by the quiz page to short-circuit
 *   to the paywall when the preview has already expired.
 * - The POST /api/quiz/session route CREATES the session and sets the anon
 *   cookie (cookies can only be written from a route handler / action).
 */
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getUserSubscription, isPremium } from '@/lib/subscription'

export const FREE_PREVIEW_SECONDS = 180
export const ANON_COOKIE = 'qz_sid'

export interface QuizTiming {
  premium:   boolean
  locked:    boolean   // free preview already expired
  remaining: number    // seconds left in the free preview
  exists:    boolean    // a session row already exists for this identity+test
}

/** Seconds left given a start timestamp. */
function remainingFrom(startedAtIso: string): number {
  const elapsed = (Date.now() - new Date(startedAtIso).getTime()) / 1000
  return Math.max(0, Math.ceil(FREE_PREVIEW_SECONDS - elapsed))
}

/**
 * Read-only timing for the current visitor + test. Does NOT create a session
 * or set cookies — safe inside a Server Component render.
 */
export async function readQuizTiming(courseId: number, testNumber: number): Promise<QuizTiming> {
  const sub = await getUserSubscription()
  if (isPremium(sub.status)) {
    return { premium: true, locked: false, remaining: 0, exists: true }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const sid = cookies().get(ANON_COOKIE)?.value

  // No identity yet → no session can exist; full preview ahead.
  if (!user && !sid) {
    return { premium: false, locked: false, remaining: FREE_PREVIEW_SECONDS, exists: false }
  }

  const admin = createAdminClient()
  let query = admin
    .from('quiz_sessions')
    .select('started_at')
    .eq('course_id', courseId)
    .eq('test_number', testNumber)
    .limit(1)

  query = user ? query.eq('user_id', user.id) : query.eq('session_key', sid!)

  const { data } = await query.maybeSingle()
  if (!data) {
    return { premium: false, locked: false, remaining: FREE_PREVIEW_SECONDS, exists: false }
  }

  const remaining = remainingFrom(data.started_at)
  return { premium: false, locked: remaining <= 0, remaining, exists: true }
}
