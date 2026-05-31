/**
 * POST /api/quiz/session
 *
 * Starts (or resumes) the server-side free-preview timer for a test and
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
import { FREE_PREVIEW_SECONDS, ANON_COOKIE } from '@/lib/quiz-session'

function remainingFrom(startedAtIso: string): number {
  const elapsed = (Date.now() - new Date(startedAtIso).getTime()) / 1000
  return Math.max(0, Math.ceil(FREE_PREVIEW_SECONDS - elapsed))
}

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

  const admin = createAdminClient()
  const match = (q: any) =>
    user ? q.eq('user_id', user.id) : q.eq('session_key', sid)

  // Look for an existing window for this identity + test.
  const { data: existing } = await match(
    admin.from('quiz_sessions')
      .select('started_at')
      .eq('course_id', courseId)
      .eq('test_number', testNumber)
      .limit(1),
  ).maybeSingle()

  let startedAt = existing?.started_at as string | undefined

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
        const { data: again } = await match(
          admin.from('quiz_sessions')
            .select('started_at')
            .eq('course_id', courseId)
            .eq('test_number', testNumber)
            .limit(1),
        ).maybeSingle()
        startedAt = again?.started_at
      } else {
        console.error('[quiz/session] insert error:', error.message)
        // Fail open with a fresh full preview rather than blocking the user.
        return NextResponse.json({ remaining: FREE_PREVIEW_SECONDS, locked: false })
      }
    } else {
      startedAt = inserted?.started_at
    }
  }

  const remaining = startedAt ? remainingFrom(startedAt) : FREE_PREVIEW_SECONDS
  return NextResponse.json({ remaining, locked: remaining <= 0 })
}
