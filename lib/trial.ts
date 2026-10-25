/**
 * lib/trial.ts — "Each Once" free trial (server-only).
 *
 * A registered learner WITHOUT paid access may take each Code 8 and Code 10
 * practice test once, full length, with the normal exam timer (1 minute per
 * question). When every test for that code is done they see one combined
 * score and are invited to buy full access.
 *
 * Anti-abuse: each claim is stored in `trial_attempts` (migration 25) with the
 * account email and the IP address it came from. A course's trial is refused
 * when another account has already claimed a trial for that course from the
 * same IP — so making a new email does not buy a second go.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

/** Courses (by `courses.code`) that offer the Each Once trial. */
export const TRIAL_COURSE_CODES = ['code8', 'code10']

/**
 * The tests a free attempt covers — the same Tests 1–3 the course page lists.
 * (Code 10 also has a short Test 4 in the database that the course page does
 * not offer, so it is not part of the combined score.)
 */
export const TRIAL_TEST_NUMBERS = [1, 2, 3]

/**
 * How many different accounts may claim a course's trial from one IP.
 * Mobile networks sometimes share an IP between strangers; raise this if
 * genuine learners report being blocked.
 */
export const TRIAL_MAX_ACCOUNTS_PER_IP = 1

/** Exam-style limit, same as paid tests: 1 minute per question. */
export const TRIAL_SECONDS_PER_QUESTION = 60

export function isTrialCourse(code: string | null | undefined): boolean {
  return !!code && TRIAL_COURSE_CODES.includes(code)
}

/** Whether this course + test is covered by the free attempt. */
export function isTrialTest(code: string | null | undefined, testNumber: number): boolean {
  return isTrialCourse(code) && TRIAL_TEST_NUMBERS.includes(testNumber)
}

/** Best-effort client IP from the proxy headers Vercel sets. */
export function getClientIp(h: Headers): string {
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || h.get('x-real-ip')?.trim() || 'unknown'
}

export type TrialState =
  | { status: 'available'; seconds: number }
  | { status: 'in_progress'; seconds: number }
  | { status: 'used' }
  | { status: 'blocked_ip' }

interface TrialRow {
  test_number: number
  started_at: string
  completed_at: string | null
  score: number | null
  total_questions: number | null
}

function secondsLeft(row: TrialRow, questionCount: number): number {
  const limit = questionCount * TRIAL_SECONDS_PER_QUESTION
  const elapsed = (Date.now() - new Date(row.started_at).getTime()) / 1000
  return Math.max(0, Math.ceil(limit - elapsed))
}

/** True when another account already claimed this course's trial from `ip`. */
async function ipTakenByOthers(admin: SupabaseClient, ip: string, courseId: number, userId: string) {
  if (ip === 'unknown') return false
  const { data } = await admin
    .from('trial_attempts')
    .select('user_id')
    .eq('ip_address', ip)
    .eq('course_id', courseId)
    .neq('user_id', userId)
  const others = new Set((data ?? []).map(r => r.user_id))
  return others.size >= TRIAL_MAX_ACCOUNTS_PER_IP
}

/** Read-only: where this learner stands for one test. Safe in a render. */
export async function getTrialState(
  admin: SupabaseClient,
  userId: string,
  courseId: number,
  testNumber: number,
  questionCount: number,
  ip: string,
): Promise<TrialState> {
  const { data: row } = await admin
    .from('trial_attempts')
    .select('test_number, started_at, completed_at, score, total_questions')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('test_number', testNumber)
    .maybeSingle<TrialRow>()

  if (row) {
    if (row.completed_at) return { status: 'used' }
    const seconds = secondsLeft(row, questionCount)
    return seconds > 0 ? { status: 'in_progress', seconds } : { status: 'used' }
  }
  if (await ipTakenByOthers(admin, ip, courseId, userId)) return { status: 'blocked_ip' }
  return { status: 'available', seconds: questionCount * TRIAL_SECONDS_PER_QUESTION }
}

/**
 * Claim the free attempt (idempotent). Re-checks the IP rule, then records
 * the start with email + IP. Returns the state after claiming.
 */
export async function claimTrial(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
  courseId: number,
  testNumber: number,
  questionCount: number,
  ip: string,
  userAgent: string | null,
): Promise<TrialState> {
  const state = await getTrialState(admin, user.id, courseId, testNumber, questionCount, ip)
  if (state.status !== 'available') return state

  const { error } = await admin.from('trial_attempts').insert({
    user_id: user.id,
    email: user.email ?? '',
    ip_address: ip,
    user_agent: userAgent?.slice(0, 300) ?? null,
    course_id: courseId,
    test_number: testNumber,
  })
  // 23505 = a concurrent request claimed it first; the re-read below is truth.
  if (error && error.code !== '23505') throw new Error(`claimTrial failed: ${error.message}`)
  return getTrialState(admin, user.id, courseId, testNumber, questionCount, ip)
}

/** Record the score of a running trial attempt. No-op if none is open. */
export async function completeTrial(
  admin: SupabaseClient,
  userId: string,
  courseId: number,
  testNumber: number,
  score: number,
  total: number,
  percentage: number,
): Promise<boolean> {
  const { data } = await admin
    .from('trial_attempts')
    .update({ completed_at: new Date().toISOString(), score, total_questions: total, percentage })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('test_number', testNumber)
    .is('completed_at', null)
    .select('id')
  return (data?.length ?? 0) > 0
}

export interface TrialSummary {
  courseId: number
  courseTitle: string
  tests: { testNumber: number; done: boolean; score: number | null; total: number | null }[]
  completed: number
  overallScore: number
  overallTotal: number
  overallPercentage: number
  allDone: boolean
  nextTest: number | null
}

/** Per-test results and the combined score for one course. */
export async function getTrialSummary(admin: SupabaseClient, userId: string, courseId: number): Promise<TrialSummary> {
  const [{ data: course }, { data: qMeta }, { data: rows }] = await Promise.all([
    admin.from('courses').select('title').eq('id', courseId).maybeSingle(),
    admin.from('quiz_questions').select('test_number').eq('course_id', courseId),
    admin.from('trial_attempts')
      .select('test_number, started_at, completed_at, score, total_questions')
      .eq('user_id', userId).eq('course_id', courseId),
  ])

  const testNumbers = Array.from(new Set((qMeta ?? []).map(q => q.test_number as number)))
    .filter(n => TRIAL_TEST_NUMBERS.includes(n))
    .sort((a, b) => a - b)
  const byTest = new Map((rows ?? []).map(r => [r.test_number as number, r as TrialRow]))

  const tests = testNumbers.map(n => {
    const row = byTest.get(n)
    return {
      testNumber: n,
      // An attempt whose clock ran out without a submission still counts as used.
      done: !!row,
      score: row?.score ?? null,
      total: row?.total_questions ?? null,
    }
  })
  const scored = tests.filter(t => t.score != null && t.total != null)
  const overallScore = scored.reduce((a, t) => a + (t.score ?? 0), 0)
  const overallTotal = scored.reduce((a, t) => a + (t.total ?? 0), 0)
  const completed = tests.filter(t => t.done).length

  return {
    courseId,
    courseTitle: course?.title ?? 'Practice tests',
    tests,
    completed,
    overallScore,
    overallTotal,
    overallPercentage: overallTotal ? Math.round((overallScore / overallTotal) * 100) : 0,
    allDone: tests.length > 0 && completed === tests.length,
    nextTest: tests.find(t => !t.done)?.testNumber ?? null,
  }
}
