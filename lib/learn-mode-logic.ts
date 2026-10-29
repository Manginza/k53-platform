/**
 * lib/learn-mode-logic.ts — pure Learn Mode rules (no I/O, unit-tested).
 *
 * When does the Learn panel open by itself, and when is only the button shown?
 *
 *   - First time a user answers a question: always auto-show (right or wrong).
 *   - Repeat answer, correct:   do NOT auto-show; the button stays available.
 *   - Repeat answer, wrong:     auto-open.
 *
 * "First time" is per user per question, tracked across sessions/devices in
 * question_attempts. Anonymous (not-logged-in) learners have no durable
 * record, so we cannot tell a repeat from a first attempt — we fail toward
 * learning and show the panel after every answer for them.
 *
 * The Learn Mode button sits at the top of every question card regardless, so
 * a learner can open the explanation at any time, before or after answering.
 */

export interface AltQuestion {
  question: string
  /** 2–4 answer options, matching the quiz's own A/B/C house style. */
  options: string[]
  /** Index into `options` of the single correct option. */
  correct: number
  /** One line on why that option is correct. */
  reason: string
}

export interface QuestionExplanation {
  question_id: number
  why: string | null
  practical: string | null
  common_mistake: string | null
  alt_questions: AltQuestion[]
  related_href: string | null
}

export interface LearnPanelDecisionInput {
  /** Attempts recorded BEFORE this answer (0 = first ever). Always 0 when untracked. */
  attemptCountBefore: number
  /** Whether the answer just submitted was correct. */
  wasCorrect: boolean
  /** True when we have a durable cross-session record (i.e. the user is logged in). */
  tracked: boolean
}

export interface LearnPanelDecision {
  autoShow: boolean
  showButton: boolean
}

/** Decide whether the Learn panel auto-opens after an answer is submitted. */
export function decideLearnPanel(
  { attemptCountBefore, wasCorrect, tracked }: LearnPanelDecisionInput,
): LearnPanelDecision {
  // No durable history → treat every answer as a first encounter.
  if (!tracked) return { autoShow: true, showButton: true }

  const firstTime = attemptCountBefore <= 0
  if (firstTime) return { autoShow: true, showButton: true }

  // Repeat: auto-open only when they got it wrong.
  return { autoShow: !wasCorrect, showButton: true }
}

/**
 * Whether an alternative question is well-formed: non-empty text, 2–4 options,
 * exactly one correct index in range, and not a verbatim copy of the original.
 * Used by the generator/seed to refuse bad alternatives rather than ship them.
 */
export function isValidAltQuestion(alt: AltQuestion, originalQuestion: string): boolean {
  if (!alt || typeof alt.question !== 'string' || !alt.question.trim()) return false
  if (!Array.isArray(alt.options) || alt.options.length < 2 || alt.options.length > 4) return false
  if (alt.options.some(o => typeof o !== 'string' || !o.trim())) return false
  if (!Number.isInteger(alt.correct) || alt.correct < 0 || alt.correct >= alt.options.length) return false
  if (alt.question.trim().toLowerCase() === originalQuestion.trim().toLowerCase()) return false
  return true
}
