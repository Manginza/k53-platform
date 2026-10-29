/**
 * lib/learn-mode.ts — server-side Learn Mode data access.
 *
 * Reads explanations for the quiz page (reviewed-only, unless an admin flips
 * the app_settings flag), and records a user's per-question attempt so the
 * panel can decide when to auto-open. Writes use the service-role client after
 * the caller has authenticated the user; RLS protects any direct access.
 */
import { createAdminClient } from '@/lib/supabase-admin'
import type { AltQuestion, QuestionExplanation } from '@/lib/learn-mode-logic'

type AdminClient = ReturnType<typeof createAdminClient>

const SHOW_UNREVIEWED_KEY = 'learn_mode_show_unreviewed'

interface ExplanationRow {
  question_id: number
  why: string | null
  practical: string | null
  common_mistake: string | null
  alt_questions: unknown
  related_href: string | null
}

/** Normalise the jsonb alt_questions into a typed, length-capped array. */
function parseAlts(value: unknown): AltQuestion[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((a): a is AltQuestion =>
      !!a && typeof a === 'object'
      && typeof (a as AltQuestion).question === 'string'
      && Array.isArray((a as AltQuestion).options)
      && typeof (a as AltQuestion).correct === 'number')
    .slice(0, 2)
}

/** Whether learners should be shown explanations that are not yet reviewed. */
export async function showUnreviewedEnabled(db: AdminClient = createAdminClient()): Promise<boolean> {
  try {
    const { data } = await db.from('app_settings').select('value').eq('key', SHOW_UNREVIEWED_KEY).maybeSingle()
    return data?.value === true
  } catch {
    return false
  }
}

/** Admin: turn unreviewed-content display on or off. */
export async function setShowUnreviewed(enabled: boolean, db: AdminClient = createAdminClient()): Promise<void> {
  await db.from('app_settings').upsert(
    { key: SHOW_UNREVIEWED_KEY, value: enabled, updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
}

/**
 * Explanations for a set of questions, keyed by question_id. Returns only
 * reviewed rows unless the admin flag allows unreviewed. Never throws — a
 * missing explanation simply means no Learn content for that question yet.
 */
export async function getExplanationsForQuestions(
  questionIds: number[],
): Promise<Record<number, QuestionExplanation>> {
  if (questionIds.length === 0) return {}
  const db = createAdminClient()
  try {
    const allowUnreviewed = await showUnreviewedEnabled(db)
    let query = db
      .from('question_explanations')
      .select('question_id, why, practical, common_mistake, alt_questions, related_href')
      .in('question_id', questionIds)
    if (!allowUnreviewed) query = query.eq('reviewed', true)

    const { data, error } = await query
    if (error || !data) return {}

    const map: Record<number, QuestionExplanation> = {}
    for (const row of data as ExplanationRow[]) {
      map[row.question_id] = {
        question_id: row.question_id,
        why: row.why,
        practical: row.practical,
        common_mistake: row.common_mistake,
        alt_questions: parseAlts(row.alt_questions),
        related_href: row.related_href,
      }
    }
    return map
  } catch {
    return {}
  }
}

export interface AttemptResult {
  tracked: boolean
  /** Attempts recorded before this one (0 = first ever). */
  attemptCountBefore: number
}

const UNIQUE_VIOLATION = '23505'

/**
 * Record that `userId` answered `questionId`, and whether it was correct.
 * Returns how many attempts existed BEFORE this one so the client can decide
 * whether to auto-open the panel. Idempotent-enough under races: a lost insert
 * race is recovered as an increment.
 */
export async function recordQuestionAttempt(
  db: AdminClient,
  userId: string,
  questionId: number,
  correct: boolean,
): Promise<number> {
  const now = new Date().toISOString()

  const { data: existing } = await db
    .from('question_attempts')
    .select('attempt_count')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle()

  if (existing) {
    const before = (existing.attempt_count as number) ?? 0
    await db.from('question_attempts')
      .update({ attempt_count: before + 1, last_correct: correct, last_attempted_at: now })
      .eq('user_id', userId)
      .eq('question_id', questionId)
    return before
  }

  const { error } = await db.from('question_attempts').insert({
    user_id: userId, question_id: questionId,
    attempt_count: 1, last_correct: correct,
    first_attempted_at: now, last_attempted_at: now,
  })
  if (error) {
    // Lost the insert race — another submit created the row first. Increment it.
    if (error.code === UNIQUE_VIOLATION) {
      const { data: row } = await db
        .from('question_attempts').select('attempt_count')
        .eq('user_id', userId).eq('question_id', questionId).maybeSingle()
      const before = (row?.attempt_count as number) ?? 1
      await db.from('question_attempts')
        .update({ attempt_count: before + 1, last_correct: correct, last_attempted_at: now })
        .eq('user_id', userId).eq('question_id', questionId)
      return before
    }
    throw new Error(`question_attempts write failed: ${error.message}`)
  }
  return 0
}
