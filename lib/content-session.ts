/**
 * lib/content-session.ts — server-side free-preview timer for Live Notes.
 *
 * Non-paying visitors get ONE shared 3-minute preview window covering all
 * Live Notes content (the Road Traffic Signs manual chapters and the Rules
 * of the Road). After it expires the paywall takes over. The window is
 * enforced server-side so it can't be reset by reloading or editing the
 * client timer.
 *
 * Implementation: it reuses the existing `quiz_sessions` table (so no new
 * migration is needed) with a reserved sentinel key that never collides with
 * a real quiz: course_id = 0, test_number = 900. The visitor identity is the
 * same as the quiz preview — logged-in users by user_id, anonymous users by
 * the httpOnly `qz_sid` cookie.
 *
 * - readContentTiming() — read-only; safe during a Server Component render
 *   (never sets cookies). Used by each Live Notes page to short-circuit to the
 *   paywall once the preview has expired.
 * - POST /api/content/session CREATES the window and sets the anon cookie.
 */
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { hasFullAccess } from '@/lib/access'
import { ANON_COOKIE } from '@/lib/quiz-session'

export const CONTENT_PREVIEW_SECONDS = 180
export const CONTENT_COURSE_ID = 0   // sentinel — no real course has id 0
export const CONTENT_TEST_NUMBER = 900

export { ANON_COOKIE }

export interface ContentTiming {
  premium:   boolean
  locked:    boolean   // free preview already expired
  remaining: number    // seconds left in the free preview
  exists:    boolean    // a window row already exists for this identity
}

function remainingFrom(startedAtIso: string): number {
  const elapsed = (Date.now() - new Date(startedAtIso).getTime()) / 1000
  return Math.max(0, Math.ceil(CONTENT_PREVIEW_SECONDS - elapsed))
}

/**
 * Read-only preview timing for the current visitor. Does NOT create a window
 * or set cookies — safe to call inside a Server Component render.
 */
export async function readContentTiming(): Promise<ContentTiming> {
  if (await hasFullAccess()) {
    return { premium: true, locked: false, remaining: 0, exists: true }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const sid = cookies().get(ANON_COOKIE)?.value

  // No identity yet → no window can exist; full preview ahead.
  if (!user && !sid) {
    return { premium: false, locked: false, remaining: CONTENT_PREVIEW_SECONDS, exists: false }
  }

  const admin = createAdminClient()
  let query = admin
    .from('quiz_sessions')
    .select('started_at')
    .eq('course_id', CONTENT_COURSE_ID)
    .eq('test_number', CONTENT_TEST_NUMBER)
    .limit(1)

  query = user ? query.eq('user_id', user.id) : query.eq('session_key', sid!)

  const { data } = await query.maybeSingle()
  if (!data) {
    return { premium: false, locked: false, remaining: CONTENT_PREVIEW_SECONDS, exists: false }
  }

  const remaining = remainingFrom(data.started_at)
  return { premium: false, locked: remaining <= 0, remaining, exists: true }
}
