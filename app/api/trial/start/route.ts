/**
 * POST /api/trial/start — claim a learner's free "Each Once" attempt.
 *
 * Called by QuizClient on mount when the quiz page rendered in trial mode.
 * Records the claim (email + IP) and returns the authoritative seconds left,
 * so reloading the page cannot restart the clock.
 *
 * Body: { courseId: number, testNumber: number }
 * Returns: { status: 'available' | 'in_progress', seconds } | { status: 'used' | 'blocked_ip' }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { hasFullAccess } from '@/lib/access'
import { claimTrial, getClientIp, isTrialTest } from '@/lib/trial'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let courseId: number | undefined
  let testNumber: number | undefined
  try {
    ({ courseId, testNumber } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 })
  }
  if (!Number.isInteger(courseId) || !Number.isInteger(testNumber)) {
    return NextResponse.json({ error: 'courseId and testNumber are required.' }, { status: 400 })
  }

  if (await hasFullAccess()) return NextResponse.json({ unlimited: true })

  const { data: { user } } = await createClient().auth.getUser()
  if (!user) return NextResponse.json({ error: 'Register or log in to use your free attempt.' }, { status: 401 })

  const admin = createAdminClient()
  const [{ data: course }, { count }] = await Promise.all([
    admin.from('courses').select('code').eq('id', courseId!).maybeSingle(),
    admin.from('quiz_questions').select('id', { count: 'exact', head: true })
      .eq('course_id', courseId!).eq('test_number', testNumber!),
  ])
  if (!course || !isTrialTest(course.code, testNumber!) || !count) {
    return NextResponse.json({ error: 'This test has no free attempt.' }, { status: 400 })
  }

  try {
    const state = await claimTrial(
      admin, user, courseId!, testNumber!, count,
      getClientIp(req.headers), req.headers.get('user-agent'),
    )
    return NextResponse.json(state)
  } catch (error) {
    console.error('[trial/start]', error)
    return NextResponse.json({ error: 'Could not start your free attempt. Please try again.' }, { status: 500 })
  }
}
