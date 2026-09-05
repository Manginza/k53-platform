/**
 * POST /api/quiz/session
 *
 * Starts (or resumes) the server-side free-trial timer for a test and
 * returns the authoritative seconds remaining. Called by QuizClient on mount
 * for non-premium users.
 *
 * - Premium users → { unlimited: true } (never timed).
 * - Logged-in free users → session keyed by user_id (survives cookie clears).
 * - Anonymous users → session keyed by an httpOnly `qz_sid` cookie.
 *
 * Body: { courseId: number, testNumber: number }
 */
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { hasFullAccess } from '@/lib/access'
import {
  FREE_PREVIEW_SECONDS,
  ANON_COOKIE,
  isCurrentTrialSession,
  remainingFrom,
} from '@/lib/quiz-session'

/** Fresh full trial — used whenever persistence fails (fail open, never block). */
const freshTrial = () => NextResponse.json({ remaining: FREE_PREVIEW_SECONDS, locked: false })

export async function POST(req: NextRequest) {
  let courseId: number | undefined
  let testNumber: number | undefined
  try {
    ({ courseId, testNumber } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 })
  }
  if (courseId == null || testNumber == null) {
    return NextResponse.json({ error: 'courseId and testNumber are required.' }, { status: 400 })
  }

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

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch (error) {
    console.error('[quiz/session] admin client unavailable; allowing trial:', error)
    return freshTrial()
  }
  const match = (q: any) =>
    user ? q.eq('user_id', user.id) : q.eq('session_key', sid)

  // Look for an existing window for this identity + test.
  const { data: existing, error: selectErr } = await match(
    admin.from('quiz_sessions')
      .select('started_at')
      .eq('course_id', courseId)
      .eq('test_number', testNumber)
      .limit(1),
  ).maybeSingle()

  // Any lookup failure (e.g. PGRST205 schema-cache miss on a cold start) fails
  // open: the trial is a marketing sample and must never break the quiz.
  if (selectErr) {
    console.error('[quiz/session] lookup failed; allowing trial:', selectErr.message)
    return freshTrial()
  }

  let startedAt = existing?.started_at as string | undefined

  // A window started under the old trial length must not send the visitor
  // straight to the paywall. Restart that row once for the current trial;
  // the unique identity/test row still prevents repeated free trials.
  if (startedAt && !isCurrentTrialSession(startedAt)) {
    const refreshedAt = new Date().toISOString()
    const { data: refreshed, error } = await match(
      admin.from('quiz_sessions')
        .update({ started_at: refreshedAt })
        .eq('course_id', courseId)
        .eq('test_number', testNumber)
        .select('started_at')
        .limit(1),
    ).maybeSingle()

    if (error) {
      console.error('[quiz/session] stale-session refresh failed; allowing trial:', error.message)
      return freshTrial()
    }
    startedAt = refreshed?.started_at ?? refreshedAt
  }

  // None yet → create one starting now.
  if (!startedAt) {
    const { data: inserted, error } = await admin
      .from('quiz_sessions')
      .insert({
        user_id:     user?.id ?? null,
        session_key: user ? null : sid,
        course_id:   courseId,
        test_number: testNumber,
      })
      .select('started_at')
      .maybeSingle()

    if (error) {
      // 23505 = a concurrent request already created it; re-read.
      if (error.code === '23505') {
        const { data: again, error: rereadError } = await match(
          admin.from('quiz_sessions')
            .select('started_at')
            .eq('course_id', courseId)
            .eq('test_number', testNumber)
            .limit(1),
        ).maybeSingle()
        if (rereadError) {
          console.error('[quiz/session] concurrent-session re-read failed; allowing trial:', rereadError.message)
          return freshTrial()
        }
        startedAt = again?.started_at
      } else {
        console.error('[quiz/session] insert error:', error.message)
        return freshTrial()
      }
    } else {
      startedAt = inserted?.started_at
    }
  }

  const remaining = startedAt ? remainingFrom(startedAt) : FREE_PREVIEW_SECONDS
  return NextResponse.json({ remaining, locked: remaining <= 0 })
}
