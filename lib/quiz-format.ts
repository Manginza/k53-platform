/**
 * lib/quiz-format.ts — K53 scoring and question order shared by the site and WhatsApp.
 *
 * Test 2 (Code 8 and Code 10) is marked in two sections, rules then signs.
 * The final test mixes in motorcycle-only questions the learner can skip.
 */

export const SPLIT_PASS_MARK = 22
export const STANDARD_PASS_PERCENT = 75

const MOTORCYCLE_TEST_C_QUESTIONS = new Set([25, 36, 38, 40, 41, 42, 43, 44, 49])

/** Numbered controls shown before the final test's motorcycle questions. */
export const MOTORCYCLE_CONTROLS = [
  ['1', 'Gear lever', 'Selects gears'],
  ['2', 'Clutch', 'Disengages the engine for gear changes'],
  ['3', 'Mirrors', 'Used to check traffic behind you'],
  ['4', 'Front brake', 'Controls speed and stops the motorcycle'],
  ['5', 'Accelerator', 'Increases or decreases speed'],
  ['6', 'Indicator', 'Signals your intention to turn'],
  ['7', 'Brake pedal', 'Controls speed with the rear brake'],
  ['8', 'Handlebars', 'Steer the motorcycle'],
] as const

/** Motorcycle-only questions identified from the manual's section labels. */
export function isMotorcycleQuestion(question: { question: string }): boolean {
  const match = question.question.match(/^Test ([ABC]).*Question (\d+)/)
  if (!match) return false
  const number = Number(match[2])
  return (match[1] === 'A' && number >= 10 && number <= 18)
    || (match[1] === 'C' && MOTORCYCLE_TEST_C_QUESTIONS.has(number))
}

/** Code 8 / Code 10 Test 2: rules and signs are scored separately. */
export function isSplitTest(courseCode: string | undefined, testNumber: number): boolean {
  return testNumber === 2 && (courseCode === 'code8' || courseCode === 'code10')
}

/** Same buckets the learner-progress dashboard stores for a finished test. */
export function categoryFor(question: { question: string; image_url: string | null; image_ref?: string | null }): string {
  const text = `${question.question} ${question.image_ref ?? ''}`.toLowerCase()
  if (text.includes('control') || text.includes('clutch') || text.includes('brake') || text.includes('motorcycle')) {
    return 'Vehicle Controls'
  }
  return question.image_url ? 'Road Signs & Markings' : 'Rules of the Road'
}

/** Rules (no picture) first on a split test, matching the website. */
export function orderForTest<T extends { image_url: string | null; question: string }>(
  rows: T[],
  split: boolean,
  skipMotorcycle: boolean,
): T[] {
  const list = skipMotorcycle ? rows.filter(row => !isMotorcycleQuestion(row)) : rows.slice()
  if (!split) return list
  return [...list.filter(row => !row.image_url), ...list.filter(row => row.image_url)]
}

export interface SectionScore { correct: number; total: number }

export interface GivenAnswer { q: number; ok: boolean }

export function sectionScores(
  questions: { id: number; image_url: string | null }[],
  answers: GivenAnswer[],
): { rules: SectionScore; signs: SectionScore } {
  const correctIds = new Set(answers.filter(answer => answer.ok).map(answer => answer.q))
  const score = (rows: { id: number }[]): SectionScore => ({
    total: rows.length,
    correct: rows.filter(row => correctIds.has(row.id)).length,
  })
  return {
    rules: score(questions.filter(question => !question.image_url)),
    signs: score(questions.filter(question => question.image_url)),
  }
}

export function passedSplit(rulesCorrect: number, signsCorrect: number): boolean {
  return rulesCorrect >= SPLIT_PASS_MARK && signsCorrect >= SPLIT_PASS_MARK
}
