/**
 * lib/whatsapp/bot.ts — the K53 practice-test conversation on WhatsApp.
 *
 * How a learner uses it:
 *   1. Says anything ("hi") and gets a menu of tests.
 *   2. Picks a test. Each question arrives as one message (with the road-sign
 *      image when there is one) and buttons for the options that exist.
 *   3. After each answer: right or wrong, the correct answer, and why.
 *   4. At the end, or when time is up, their score. Test 2 also shows the
 *      rules and signs sections. The final test asks whether to include
 *      the motorcycle questions.
 *
 * Who gets what:
 *   - Full access (a linked account with an active grant, or a free promo
 *     window): every test, untimed, as often as they like. A free session
 *     still on screen is upgraded when the account becomes paid.
 *   - Everyone else: 10 minutes on each test, once per WhatsApp number.
 *     Opening a test and immediately switching away does not use the try up.
 *     They are then offered full access, bought on the website after linking
 *     the number to an account.
 *
 * A finished test on a linked account is saved to quiz_attempts, the same
 * table the website uses, so it shows on the learner's progress.
 *
 * All state lives in the wa_* tables (migration 28, plus 29 for one open
 * test per number), so any server instance can answer any message. Taps are
 * applied with an optimistic check on the question position, so a double tap
 * or a retried webhook never counts twice.
 */
import { randomInt } from 'crypto'
import { createAdminClient } from '@/lib/supabase-admin'
import { userHasFullAccess } from '@/lib/access'
import { getExplanationsForQuestions } from '@/lib/learn-mode'
import { ACCESS_PRICE, ACCESS_DURATION_DAYS } from '@/lib/contact'
import {
  categoryFor, isMotorcycleQuestion, isSplitTest, MOTORCYCLE_CONTROLS,
  orderForTest, passedSplit, sectionScores,
} from '@/lib/quiz-format'
import { resolvePublicImageUrl, sendButtons, sendImage, sendLinkButton, sendList, sendText, clip } from '@/lib/whatsapp/api'
import {
  classifyText, countsAsFreeAttempt, maskNumber, needsSplitDelivery, optionLetters, questionBody, resultText,
  type Letter,
} from '@/lib/whatsapp/messages'

export { maskNumber }

export const FREE_SECONDS = 10 * 60
const LINK_CODE_MINUTES = 30
const SITE = (process.env.WHATSAPP_SITE_URL || 'https://www.skdriving.co.za').replace(/\/+$/, '')
const REFRESHER_IMAGE = '/images/final-test/motorcycle-controls-refresher.png'
const FOOTER = 'Type STOP to end the test'

/** The tests offered on WhatsApp, in menu order. */
const CATALOGUE: { code: string; label: string; tests: number[] }[] = [
  { code: 'code8',     label: 'Code 8',     tests: [1, 2, 3] },
  { code: 'code10',    label: 'Code 10',    tests: [1, 2, 3] },
  { code: 'final-k53', label: 'Final test', tests: [1] },
]

type Db = ReturnType<typeof createAdminClient>

interface WaUser { wa_id: string; user_id: string | null }

interface Answer { q: number; a: string; ok: boolean }

interface Session {
  id: string
  wa_id: string
  course_id: number
  test_number: number
  mode: 'free' | 'full'
  question_ids: number[]
  position: number
  correct: number
  answers: Answer[]
  deadline: string | null
  finished_at: string | null
  finish_reason: string | null
}

interface Question {
  id: number
  question: string
  option_a: string
  option_b: string
  option_c: string | null
  correct_answer: Letter
  image_url: string | null
  image_ref?: string | null
}

interface CourseRow { id: number; title: string }

export interface Incoming {
  waId: string
  profileName?: string
  /** Free text the learner typed, if any. */
  text?: string
  /** Id of the button or list row the learner tapped, if any. */
  replyId?: string
}

export type LinkFailure = 'invalid' | 'used' | 'expired' | 'failed'

function log(event: string, waId: string, extra?: Record<string, unknown>) {
  console.log('[whatsapp]', event, { wa: maskNumber(waId), ...extra })
}

function asIds(value: unknown): number[] {
  if (Array.isArray(value)) return value.map(id => Number(id)).filter(id => Number.isFinite(id))
  if (typeof value === 'string') {
    return value.replace(/[{}]/g, '').split(',').map(part => Number(part.trim())).filter(id => Number.isFinite(id))
  }
  return []
}

function asAnswers(value: unknown): Answer[] {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'object') as Answer[] : []
  } catch {
    return []
  }
}

function normaliseSession(row: Session): Session {
  return {
    ...row,
    question_ids: asIds(row.question_ids),
    position: Number(row.position) || 0,
    correct: Number(row.correct) || 0,
    answers: asAnswers(row.answers),
  }
}

// ── Entry point ─────────────────────────────────────────────────────────────

export async function handleIncoming(msg: Incoming): Promise<void> {
  const db = createAdminClient()
  const user = await touchUser(db, msg.waId, msg.profileName)

  if (msg.replyId) return handleReply(db, user, msg.replyId)

  const command = classifyText(msg.text)
  if (command.type === 'answer') {
    const open = await openSession(db, user.wa_id)
    if (open) return answer(db, user, open, command.letter, open.position)
  }
  if (command.type === 'stop') return stop(db, user)
  if (command.type === 'buy') return offerFullAccess(db, user)
  if (command.type === 'link') return offerLink(db, user)
  if (command.type === 'help') return sendHelp(user)

  const open = await openSession(db, user.wa_id)
  if (open && command.type !== 'menu') {
    const sent = await sendText(user.wa_id, 'Please tap A, B or C to answer. Type STOP to end this test.')
    if (!sent) throw new Error('answer reminder was not delivered')
    return sendQuestion(db, user, open)
  }
  return sendMenu(db, user)
}

async function handleReply(db: Db, user: WaUser, id: string): Promise<void> {
  const [kind, ...rest] = id.split(':')
  if (kind === 'menu') return sendMenu(db, user)
  if (kind === 'buy') return offerFullAccess(db, user)
  if (kind === 'test') {
    const [courseId, testNumber] = rest.map(Number)
    if (Number.isFinite(courseId) && Number.isFinite(testNumber)) return startTest(db, user, courseId, testNumber)
  }
  if (kind === 'final') {
    const courseId = Number(rest[0])
    const choice = rest[1]
    if (Number.isFinite(courseId) && (choice === 'all' || choice === 'skip')) {
      return startTest(db, user, courseId, 1, choice)
    }
  }
  if (kind === 'ans') {
    const [sessionId, pos, letter] = rest
    const session = await openSession(db, user.wa_id)
    if (!session || session.id !== sessionId) {
      if (session) return sendQuestion(db, user, session)
      const sent = await sendText(user.wa_id, 'That test has ended. Type MENU to choose another.')
      if (!sent) throw new Error('ended-test note was not delivered')
      return
    }
    if (letter === 'A' || letter === 'B' || letter === 'C') return answer(db, user, session, letter, Number(pos))
  }
  return sendMenu(db, user)
}

// ── Users and sessions ──────────────────────────────────────────────────────

async function touchUser(db: Db, waId: string, profileName?: string): Promise<WaUser> {
  const { data, error } = await db
    .from('wa_users')
    .upsert(
      { wa_id: waId, last_seen_at: new Date().toISOString(), ...(profileName ? { profile_name: profileName.slice(0, 80) } : {}) },
      { onConflict: 'wa_id' },
    )
    .select('wa_id, user_id')
    .single()
  if (error || !data) throw new Error(`wa_users upsert failed: ${error?.message ?? 'no row'}`)
  return data as WaUser
}

/** The learner's running test, closing it first if its free time ran out. */
async function openSession(db: Db, waId: string): Promise<Session | null> {
  const { data, error } = await db
    .from('wa_quiz_sessions')
    .select('*')
    .eq('wa_id', waId)
    .is('finished_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`open session: ${error.message}`)
  return data ? normaliseSession(data as Session) : null
}

function secondsLeft(s: Session): number | null {
  if (!s.deadline) return null
  const deadline = Date.parse(s.deadline)
  if (!Number.isFinite(deadline)) return null
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}

/** A paid account keeps the test it already started, without the 10-minute cap. */
async function promoteIfPaid(db: Db, user: WaUser, s: Session): Promise<Session> {
  if (s.mode === 'full' || !s.deadline) return s
  if (!(await userHasFullAccess(user.user_id))) return s
  const { data, error } = await db
    .from('wa_quiz_sessions')
    .update({ mode: 'full', deadline: null })
    .eq('id', s.id)
    .is('finished_at', null)
    .select('*')
    .maybeSingle()
  if (error) throw new Error(`promote session: ${error.message}`)
  if (!data) return s
  log('session-upgraded', user.wa_id, { session: s.id })
  return normaliseSession(data as Session)
}

async function finish(db: Db, s: Session, reason: 'completed' | 'time' | 'stopped' | 'replaced'): Promise<Session | null> {
  const { data, error } = await db
    .from('wa_quiz_sessions')
    .update({ finished_at: new Date().toISOString(), finish_reason: reason })
    .eq('id', s.id)
    .is('finished_at', null)
    .select('*')
    .maybeSingle()
  if (error) throw new Error(`finish session: ${error.message}`)
  return data ? normaliseSession(data as Session) : null
}

async function loadQuestion(db: Db, id: number): Promise<Question | null> {
  const { data, error } = await db
    .from('quiz_questions')
    .select('id, question, option_a, option_b, option_c, correct_answer, image_url, image_ref')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`load question: ${error.message}`)
  return (data as Question | null) ?? null
}

async function loadQuestions(db: Db, ids: number[]): Promise<Question[]> {
  if (ids.length === 0) return []
  const { data, error } = await db
    .from('quiz_questions')
    .select('id, question, option_a, option_b, option_c, correct_answer, image_url, image_ref')
    .in('id', ids)
  if (error) throw new Error(`load questions: ${error.message}`)
  return (data ?? []) as Question[]
}

async function courseIdsByCode(db: Db): Promise<Map<string, CourseRow>> {
  const { data, error } = await db.from('courses').select('id, code, title').in('code', CATALOGUE.map(c => c.code))
  if (error) throw new Error(`courses: ${error.message}`)
  return new Map((data ?? []).map(c => [c.code as string, { id: c.id as number, title: c.title as string }]))
}

function codeFor(courses: Map<string, CourseRow>, courseId: number): string | undefined {
  return Array.from(courses.entries()).find(([, course]) => course.id === courseId)?.[0]
}

function testLabel(courseCode: string | undefined, testNumber: number): string {
  const entry = CATALOGUE.find(c => c.code === courseCode)
  if (!entry) return `Test ${testNumber}`
  return entry.tests.length === 1 ? entry.label : `${entry.label} · Test ${testNumber}`
}

async function mustSend(ok: boolean, what: string): Promise<void> {
  if (!ok) throw new Error(`${what} was not delivered`)
}

// ── Menu ────────────────────────────────────────────────────────────────────

async function sendMenu(db: Db, user: WaUser): Promise<void> {
  const [courses, full] = await Promise.all([courseIdsByCode(db), userHasFullAccess(user.user_id)])
  const rows = CATALOGUE.flatMap(c => {
    const course = courses.get(c.code)
    if (!course) return []
    return c.tests.map(t => ({
      id: `test:${course.id}:${t}`,
      title: testLabel(c.code, t),
      description: c.code === 'final-k53' ? 'Mixed questions: Code 8, 10 and motorcycle' : course.title,
    }))
  })

  if (rows.length === 0) {
    await mustSend(
      await sendText(user.wa_id, 'The practice tests are not available right now. Please try again in a few minutes.'),
      'empty menu',
    )
    console.error('[whatsapp] menu has no courses')
    return
  }

  const status = full
    ? 'You have *full access*: every test, no time limit.'
    : `Free: *10 minutes* on each test. Full access is ${ACCESS_PRICE} for ${ACCESS_DURATION_DAYS} days (type BUY).`

  await mustSend(await sendList(
    user.wa_id,
    `Hi! This is SK Driving 🚗\n\n*K53 practice tests on WhatsApp*\n\nPick a test. Each question comes with buttons A, B and C, and you see the right answer after every question.\n\n${status}`,
    'Choose a test',
    'Practice tests',
    rows,
  ), 'menu')
  log('menu', user.wa_id, { choices: rows.length, full })
}

async function sendHelp(user: WaUser): Promise<void> {
  await mustSend(await sendText(user.wa_id, [
    '*How it works*',
    'MENU: choose a test',
    'A, B or C: answer the question',
    'STOP: end the test and see your score',
    'BUY: get full access',
    'LINK: connect this number to your skdriving.co.za account',
  ].join('\n')), 'help')
}

// ── Taking a test ───────────────────────────────────────────────────────────

async function startTest(
  db: Db,
  user: WaUser,
  courseId: number,
  testNumber: number,
  motorcycle?: 'all' | 'skip',
): Promise<void> {
  const courses = await courseIdsByCode(db)
  const code = codeFor(courses, courseId)
  const entry = CATALOGUE.find(c => c.code === code)
  if (!entry || !entry.tests.includes(testNumber)) return sendMenu(db, user)
  const label = testLabel(code, testNumber)

  let open = await openSession(db, user.wa_id)
  if (open) open = await promoteIfPaid(db, user, open)
  if (open && open.course_id === courseId && open.test_number === testNumber) {
    if (secondsLeft(open) !== 0) {
      await mustSend(await sendText(user.wa_id, `Carrying on with *${label}* where you left off.`), 'resume note')
      return sendQuestion(db, user, open)
    }
    return endAndReport(db, user, open, 'time')
  }

  const full = await userHasFullAccess(user.user_id)
  if (!full) {
    const { data: previous, error: previousError } = await db
      .from('wa_quiz_sessions')
      .select('position, finish_reason')
      .eq('wa_id', user.wa_id)
      .eq('course_id', courseId)
      .eq('test_number', testNumber)
      .eq('mode', 'free')
    if (previousError) throw new Error(`free-attempt lookup: ${previousError.message}`)
    const used = (previous ?? []).some(row => countsAsFreeAttempt(Number(row.position) || 0, row.finish_reason as string | null))
    if (used) {
      await mustSend(await sendText(user.wa_id, `You have already used your free 10 minutes on *${label}*.`), 'free-attempt note')
      return offerFullAccess(db, user)
    }
  }

  if (code === 'final-k53' && !motorcycle) {
    await mustSend(await askMotorcycle(user.wa_id, courseId), 'motorcycle choice')
    return
  }

  const { data: qs, error: questionsError } = await db
    .from('quiz_questions')
    .select('id, question, image_url')
    .eq('course_id', courseId)
    .eq('test_number', testNumber)
    .order('id')
  if (questionsError) throw new Error(`list questions: ${questionsError.message}`)
  const ordered = orderForTest(
    (qs ?? []) as { id: number; question: string; image_url: string | null }[],
    isSplitTest(code, testNumber),
    motorcycle === 'skip',
  )
  const ids = ordered.map(question => question.id as number)
  if (ids.length === 0) {
    await mustSend(await sendText(user.wa_id, 'That test is not available right now. Please pick another.'), 'missing test')
    return sendMenu(db, user)
  }

  if (open) await finish(db, open, secondsLeft(open) === 0 ? 'time' : 'replaced')

  const { data: created, error } = await db
    .from('wa_quiz_sessions')
    .insert({
      wa_id: user.wa_id,
      course_id: courseId,
      test_number: testNumber,
      mode: full ? 'full' : 'free',
      question_ids: ids,
      deadline: full ? null : new Date(Date.now() + FREE_SECONDS * 1000).toISOString(),
    })
    .select('*')
    .single()
  if (error?.code === '23505') {
    const existing = await openSession(db, user.wa_id)
    if (existing) {
      await mustSend(await sendText(user.wa_id, `Carrying on with *${label}*.`), 'resume note')
      return sendQuestion(db, user, existing)
    }
  }
  if (error || !created) throw new Error(`could not start session: ${error?.message ?? 'no row'}`)

  log('test-start', user.wa_id, { course: code, test: testNumber, questions: ids.length, full, motorcycle: motorcycle ?? 'n/a' })
  await mustSend(await sendText(user.wa_id, full
    ? `📝 *${label}*: ${ids.length} questions, no time limit.\nTap A, B or C. Type STOP to end and see your score.`
    : `📝 *${label}*: ${ids.length} questions.\n⏱ Your free *10 minutes* start now. Answer as many as you can.\nTap A, B or C. Type STOP to end and see your score.`), 'test intro')
  return sendQuestion(db, user, normaliseSession(created as Session))
}

function askMotorcycle(to: string, courseId: number) {
  return sendButtons(
    to,
    'This final test includes motorcycle questions. Include them in your score, or skip them?',
    [
      { id: `final:${courseId}:all`, title: 'Include them' },
      { id: `final:${courseId}:skip`, title: 'Skip them' },
    ],
  )
}

async function sendQuestion(db: Db, user: WaUser, s: Session, lead?: string): Promise<void> {
  let session = await promoteIfPaid(db, user, s)
  for (let guard = 0; guard < 30; guard++) {
    if (secondsLeft(session) === 0) return endAndReport(db, user, session, 'time')
    if (session.position >= session.question_ids.length) return endAndReport(db, user, session, 'completed')

    const q = await loadQuestion(db, session.question_ids[session.position])
    if (!q) {
      const { data, error } = await db.from('wa_quiz_sessions')
        .update({ position: session.position + 1 })
        .eq('id', session.id)
        .eq('position', session.position)
        .is('finished_at', null)
        .select('*')
        .maybeSingle()
      if (error) throw new Error(`skip question: ${error.message}`)
      if (!data) return
      session = normaliseSession(data as Session)
      continue
    }

    await maybeRefresher(db, user, session, q)
    const imageUrl = resolvePublicImageUrl(q.image_url, SITE)
    let body = questionBody(q, session.position, session.question_ids.length, secondsLeft(session))
    if (q.image_url && !imageUrl) body += '\n\n(The picture for this question could not be shown.)'
    if (lead) body = `${lead}\n\n${body}`
    const buttons = optionLetters(q).map(letter => ({
      id: `ans:${session.id}:${session.position}:${letter}`,
      title: letter,
    }))
    await deliverQuestion(user.wa_id, body, buttons, imageUrl)
    return
  }
  throw new Error('question loop did not settle')
}

async function maybeRefresher(db: Db, user: WaUser, s: Session, question: Question): Promise<void> {
  if (!isMotorcycleQuestion(question)) return
  if (s.position > 0) {
    const previous = await loadQuestion(db, s.question_ids[s.position - 1])
    if (previous && isMotorcycleQuestion(previous)) return
  }
  const image = resolvePublicImageUrl(REFRESHER_IMAGE, SITE)
  const lines = [
    '*Motorcycle controls*',
    'The next questions use these numbered controls. This reminder is not scored.',
    ...MOTORCYCLE_CONTROLS.map(([number, name, description]) => `${number}. ${name} — ${description}`),
  ]
  if (image) {
    const sent = await sendImage(user.wa_id, image, 'Motorcycle controls')
    if (!sent) lines.push('(The picture of the controls could not be shown.)')
  }
  const sent = await sendText(user.wa_id, lines.join('\n'))
  if (!sent) console.error('[whatsapp] motorcycle refresher was not delivered', { wa: maskNumber(user.wa_id) })
}

async function deliverQuestion(
  to: string,
  body: string,
  buttons: { id: string; title: string }[],
  imageUrl: string | null,
): Promise<void> {
  if (!needsSplitDelivery(body)) {
    const sent = await sendButtons(to, body, buttons, { imageUrl, footer: FOOTER })
    if (sent) return
    if (imageUrl) {
      const noted = body.includes('could not be shown') ? body : `${body}\n\n(The picture for this question could not be shown.)`
      if (!needsSplitDelivery(noted)) {
        const retry = await sendButtons(to, noted, buttons, { footer: FOOTER })
        if (retry) return
      }
    }
  }

  let text = body
  if (imageUrl && !text.includes('could not be shown')) {
    const sent = await sendImage(to, imageUrl)
    if (!sent) text += '\n\n(The picture for this question could not be shown.)'
  }
  const textSent = await sendText(to, text)
  const buttonsSent = await sendButtons(to, 'Tap A, B or C.', buttons, { footer: FOOTER })
  if (!buttonsSent) throw new Error('answer buttons were not delivered')
  if (!textSent) console.error('[whatsapp] question text was not delivered', { wa: maskNumber(to) })
}

async function answer(db: Db, user: WaUser, s: Session, letter: Letter, position: number): Promise<void> {
  s = await promoteIfPaid(db, user, s)
  if (position !== s.position) return sendQuestion(db, user, s)
  if (secondsLeft(s) === 0) return endAndReport(db, user, s, 'time')

  const q = await loadQuestion(db, s.question_ids[s.position])
  if (!q) return sendQuestion(db, user, s)
  const letters = optionLetters(q)
  if (!letters.includes(letter)) {
    await mustSend(await sendText(user.wa_id, `This question has options ${letters.join(', ')}.`), 'option note')
    return sendQuestion(db, user, s)
  }
  const correct = (q.correct_answer ?? '').toUpperCase() as Letter
  const ok = letter === correct

  const { data, error } = await db
    .from('wa_quiz_sessions')
    .update({
      position: s.position + 1,
      correct: s.correct + (ok ? 1 : 0),
      answers: [...(s.answers ?? []), { q: q.id, a: letter, ok }],
    })
    .eq('id', s.id)
    .eq('position', s.position)
    .is('finished_at', null)
    .select('*')
    .maybeSingle()
  if (error) throw new Error(`record answer: ${error.message}`)
  const next = data ? normaliseSession(data as Session) : null
  if (!next) {
    const fresh = await openSession(db, user.wa_id)
    if (fresh && fresh.id === s.id) return sendQuestion(db, user, fresh)
    return
  }

  const rightText = correct === 'A' ? q.option_a : correct === 'B' ? q.option_b : q.option_c
  const why = (await getExplanationsForQuestions([q.id]))[q.id]?.why?.trim()
  const feedback = [
    ok ? '✅ *Correct!*' : `❌ *Not quite.* The answer is *${correct}*: ${(rightText ?? '').trim()}`,
    why ? `\n💡 ${clip(why, 600)}` : '',
  ].join('')
  log('answer', user.wa_id, { session: s.id, position: s.position, ok })

  const sent = await sendText(user.wa_id, feedback)
  if (next.position >= next.question_ids.length) {
    if (!sent) console.error('[whatsapp] answer feedback was not delivered', { wa: maskNumber(user.wa_id) })
    return endAndReport(db, user, next, 'completed')
  }
  return sendQuestion(db, user, next, sent ? undefined : feedback)
}

async function stop(db: Db, user: WaUser): Promise<void> {
  const open = await openSession(db, user.wa_id)
  if (!open) {
    await mustSend(await sendText(user.wa_id, 'There is no test running.'), 'no-test note')
    return sendMenu(db, user)
  }
  return endAndReport(db, user, open, 'stopped')
}

async function endAndReport(db: Db, user: WaUser, s: Session, reason: 'completed' | 'time' | 'stopped'): Promise<void> {
  const closed = await finish(db, s, reason)
  if (!closed) return

  const courses = await courseIdsByCode(db)
  const code = codeFor(courses, s.course_id)
  const label = testLabel(code, s.test_number)
  let questions: Question[] = []
  try {
    questions = await loadQuestions(db, s.question_ids)
  } catch (error) {
    console.error('[whatsapp] score details failed', error instanceof Error ? error.message : error)
  }
  const split = isSplitTest(code, s.test_number) && questions.length > 0
    ? sectionScores(questions, closed.answers ?? [])
    : null
  const text = resultText({
    reason,
    label,
    correct: closed.correct,
    total: s.question_ids.length,
    answered: closed.position,
    split,
  })
  await mustSend(await sendText(user.wa_id, text), 'score')
  log('finish', user.wa_id, { session: s.id, reason, correct: closed.correct, total: s.question_ids.length })

  await saveLinkedResult(db, user, closed, reason, code, courses.get(code ?? '')?.title, questions)

  const full = closed.mode === 'full' || (await userHasFullAccess(user.user_id))
  if (full) {
    await mustSend(await sendButtons(user.wa_id, 'Ready for another one?', [{ id: 'menu', title: 'Choose a test' }]), 'next-test prompt')
    return
  }
  await mustSend(await sendButtons(
    user.wa_id,
    `With full access (${ACCESS_PRICE} for ${ACCESS_DURATION_DAYS} days) you can take every test as often as you like, with no 10-minute limit.`,
    [{ id: 'buy', title: 'Get full access' }, { id: 'menu', title: 'Another test' }],
  ), 'upgrade prompt')
}

async function saveLinkedResult(
  db: Db,
  user: WaUser,
  session: Session,
  reason: 'completed' | 'time' | 'stopped',
  courseCode: string | undefined,
  courseTitle: string | undefined,
  questions: Question[],
): Promise<void> {
  if (!user.user_id || reason === 'stopped') return
  if (isSplitTest(courseCode, session.test_number) && questions.length === 0) {
    console.error('[whatsapp] progress not saved, question details missing', { session: session.id })
    return
  }
  try {
    const total = session.question_ids.length
    const correct = session.correct
    const percentage = total ? Math.round((correct / total) * 10000) / 100 : 0
    const byId = new Map(questions.map(question => [question.id, question]))
    const categories: Record<string, { correct: number; total: number; percentage: number }> = {}
    for (const id of session.question_ids) {
      const question = byId.get(id)
      if (!question) continue
      const category = categoryFor(question)
      const current = categories[category] ?? { correct: 0, total: 0, percentage: 0 }
      current.total += 1
      if (session.answers.some(answer => answer.q === id && answer.ok)) current.correct += 1
      current.percentage = current.total ? Math.round((current.correct / current.total) * 100) : 0
      categories[category] = current
    }
    const split = isSplitTest(courseCode, session.test_number)
      ? sectionScores(questions, session.answers)
      : null
    const resultPassed = split
      ? passedSplit(split.rules.correct, split.signs.correct)
      : (total ? Math.round((correct / total) * 100) : 0) >= 75

    const inserted = await db.from('quiz_attempts').insert({
      user_id: user.user_id,
      course_id: session.course_id,
      test_number: session.test_number,
      submission_key: session.id,
      test_name: `${courseTitle ?? 'Practice test'} — Test ${session.test_number}`,
      licence_code: courseCode ?? null,
      score: correct,
      total_questions: total,
      percentage,
      result_passed: resultPassed,
      is_final: courseCode === 'final-k53',
      category_scores: categories,
      completed_at: new Date().toISOString(),
    }).select('id').maybeSingle()

    if (inserted.error) {
      if (inserted.error.code === '23505') return
      throw new Error(inserted.error.message)
    }
    const attemptId = inserted.data?.id
    if (!attemptId) return

    const rows = session.answers.map(answer => ({
      attempt_id: attemptId,
      question_id: answer.q,
      selected_answer: answer.a,
      is_correct: answer.ok,
    }))
    if (rows.length > 0) {
      const { error } = await db.from('user_answers').upsert(rows, { onConflict: 'attempt_id,question_id', ignoreDuplicates: true })
      if (error) console.error('[whatsapp] answer detail save failed', error.message)
    }
    log('progress-saved', user.wa_id, { attempt: attemptId, passed: resultPassed })
  } catch (error) {
    console.error('[whatsapp] progress save failed', error instanceof Error ? error.message : error)
  }
}

// ── Linking and buying ──────────────────────────────────────────────────────

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

async function newLinkCode(db: Db, waId: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = Array.from({ length: 10 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('')
    const { error } = await db.from('wa_link_codes').insert({
      code,
      wa_id: waId,
      expires_at: new Date(Date.now() + LINK_CODE_MINUTES * 60 * 1000).toISOString(),
    })
    if (!error) return code
    if (error.code !== '23505') throw new Error(`link code insert failed: ${error.message}`)
  }
  throw new Error('could not create a unique link code')
}

async function offerLink(db: Db, user: WaUser): Promise<void> {
  const code = await newLinkCode(db, user.wa_id)
  const sent = await sendLinkButton(
    user.wa_id,
    user.user_id
      ? 'This number is already linked to an account. To link it to a different one, open this page (it works for 30 minutes).'
      : 'Link this WhatsApp number to your skdriving.co.za account. Log in (or register), then confirm. The link works for 30 minutes.',
    'Link my account',
    `${SITE}/whatsapp/link?code=${code}`,
  )
  await mustSend(sent, 'link button')
  log('link-offer', user.wa_id, { relink: Boolean(user.user_id) })
}

async function offerFullAccess(db: Db, user: WaUser): Promise<void> {
  if (await userHasFullAccess(user.user_id)) {
    await mustSend(await sendText(user.wa_id, 'You already have full access. Type MENU to choose a test.'), 'already-paid note')
    return
  }
  if (user.user_id) {
    await mustSend(await sendLinkButton(
      user.wa_id,
      `Full access is ${ACCESS_PRICE} for ${ACCESS_DURATION_DAYS} days: every test, as often as you like, with no time limit. Pay securely on our website, then come back here and type MENU.`,
      'Get full access',
      `${SITE}/pricing`,
    ), 'buy button')
    log('buy-offer', user.wa_id, { linked: true })
    return
  }
  const code = await newLinkCode(db, user.wa_id)
  await mustSend(await sendLinkButton(
    user.wa_id,
    `Full access is ${ACCESS_PRICE} for ${ACCESS_DURATION_DAYS} days: every test, as often as you like, with no time limit.\n\nTap below, log in or register, and pay on our website. Your WhatsApp number is linked at the same time, so you can carry on here.`,
    'Get full access',
    `${SITE}/whatsapp/link?code=${code}&then=pay`,
  ), 'buy button')
  log('buy-offer', user.wa_id, { linked: false })
}

async function releaseLinkCode(db: Db, code: string, userId: string): Promise<void> {
  const { error } = await db
    .from('wa_link_codes')
    .update({ used_at: null, used_by: null })
    .eq('code', code)
    .eq('used_by', userId)
  if (error) console.error('[whatsapp] link code release failed', error.message)
}

// ── Used by the website once a learner confirms the link ────────────────────

export async function linkNumberToAccount(code: string, userId: string): Promise<{ ok: true; waId: string } | { ok: false; code: LinkFailure }> {
  const db = createAdminClient()
  const { data: row, error: readError } = await db
    .from('wa_link_codes')
    .select('code, wa_id, expires_at, used_at')
    .eq('code', code)
    .maybeSingle()
  if (readError) throw new Error(`link code lookup: ${readError.message}`)
  if (!row) return { ok: false, code: 'invalid' }
  if (row.used_at) return { ok: false, code: 'used' }
  if (Date.parse(row.expires_at) < Date.now()) return { ok: false, code: 'expired' }

  const { data: claimed, error: claimError } = await db
    .from('wa_link_codes')
    .update({ used_at: new Date().toISOString(), used_by: userId })
    .eq('code', code)
    .is('used_at', null)
    .select('code')
    .maybeSingle()
  if (claimError) throw new Error(`link code claim: ${claimError.message}`)
  if (!claimed) return { ok: false, code: 'used' }

  const { error: clearError } = await db.from('wa_users').update({ user_id: null }).eq('user_id', userId).neq('wa_id', row.wa_id)
  if (clearError) {
    await releaseLinkCode(db, code, userId)
    console.error('[whatsapp] unlink previous number failed', clearError.message)
    return { ok: false, code: 'failed' }
  }
  const { error } = await db.from('wa_users').update({ user_id: userId }).eq('wa_id', row.wa_id)
  if (error) {
    await releaseLinkCode(db, code, userId)
    console.error('[whatsapp] link update failed', error.message)
    return { ok: false, code: 'failed' }
  }

  const full = await userHasFullAccess(userId)
  const sent = await sendText(row.wa_id, full
    ? '✅ This number is now linked to your SK Driving account, and you have *full access*. Type MENU to choose a test.'
    : '✅ This number is now linked to your SK Driving account. Once you have paid for full access, type MENU here to practise with no time limit.')
  if (!sent) console.error('[whatsapp] link confirmation was not delivered', { wa: maskNumber(row.wa_id) })
  log('linked', row.wa_id, { full })
  return { ok: true, waId: row.wa_id }
}

export async function describeLinkCode(code: string): Promise<{ valid: boolean; masked?: string; reason?: string }> {
  const { data: row, error } = await createAdminClient()
    .from('wa_link_codes')
    .select('wa_id, expires_at, used_at')
    .eq('code', code)
    .maybeSingle()
  if (error) throw new Error(`link code lookup: ${error.message}`)
  if (!row) return { valid: false, reason: 'This link is not valid. Type LINK in WhatsApp to get a new one.' }
  if (row.used_at) return { valid: false, reason: 'This link has already been used. Type LINK in WhatsApp to get a new one.' }
  if (Date.parse(row.expires_at) < Date.now()) return { valid: false, reason: 'This link has expired. Type LINK in WhatsApp to get a new one.' }
  return { valid: true, masked: maskNumber(row.wa_id) }
}
