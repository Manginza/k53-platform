/**
 * POST /api/content/session
 *
 * Starts (or resumes) the server-side 3-minute free-preview window for Live
 * Notes content (Road Signs manual + Rules of the Road) and returns the
 * authoritative seconds remaining. Called by ContentPreviewGate on mount for
 * non-premium visitors.
 *
 * - Premium users → { unlimited: true } (never timed).
 * - Logged-in free users → window keyed by user_id.
 * - Anonymous users → window keyed by an httpOnly `qz_sid` cookie.
 *
 * Reuses the `quiz_sessions` table with a reserved sentinel key
 * (course_id = 0, test_number = 900) so no new table/migration is required.
 */
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { hasFullAccess } from '@/lib/access'
import {
  CONTENT_PREVIEW_SECONDS, CONTENT_COURSE_ID, CONTENT_TEST_NUMBER, ANON_COOKIE,
} from '@/lib/content-session'

function remainingFrom(startedAtIso: string): number {
  const elapsed = (Date.now() - new Date(startedAtIso).getTime()) / 1000
  return Math.max(0, Math.ceil(CONTENT_PREVIEW_SECONDS - elapsed))
}

export async function POST() {
  // Full-access users are never timed.
  if (await hasFullAccess()) return NextResponse.json({ unlimited: true })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Identify anonymous visitors with an httpOnly cookie (issued here).
  let sid = cookies().get(ANON_COOKIE)?.value
  if (!user && !sid) {
    sid = randomUUID()
    cookies().set(ANON_COOKIE, sid, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  const admin = createAdminClient()
  const match = (q: any) =>
    user ? q.eq('user_id', user.id) : q.eq('session_key', sid)

  const { data: existing } = await match(
    admin.from('quiz_sessions')
      .select('started_at')
      .eq('course_id', CONTENT_COURSE_ID)
      .eq('test_number', CONTENT_TEST_NUMBER)
      .limit(1),
  ).maybeSingle()

  let startedAt = existing?.started_at as string | undefined

  if (!startedAt) {
    const { data: inserted, error } = await admin
      .from('quiz_sessions')
      .insert({
        user_id:     user?.id ?? null,
        session_key: user ? null : sid,
        course_id:   CONTENT_COURSE_ID,
        test_number: CONTENT_TEST_NUMBER,
      })
      .select('started_at')
      .maybeSingle()

    if (error) {
      if (error.code === '23505') {
        const { data: again } = await match(
          admin.from('quiz_sessions')
            .select('started_at')
            .eq('course_id', CONTENT_COURSE_ID)
            .eq('test_number', CONTENT_TEST_NUMBER)
            .limit(1),
        ).maybeSingle()
        startedAt = again?.started_at
      } else {
        console.error('[content/session] insert error:', error.message)
        return NextResponse.json({ remaining: CONTENT_PREVIEW_SECONDS, locked: false })
      }
    } else {
      startedAt = inserted?.started_at
    }
  }

  const remaining = startedAt ? remainingFrom(startedAt) : CONTENT_PREVIEW_SECONDS
  return NextResponse.json({ remaining, locked: remaining <= 0 })
}
