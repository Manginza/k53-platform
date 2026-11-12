/**
 * lib/whatsapp/bot.ts — the K53 practice-test conversation on WhatsApp.
 *
 * How a learner uses it:
 *   1. Says anything ("hi") and gets a menu of tests.
 *   2. Picks a test. Each question arrives as one message (with the road-sign
 *      image when there is one) and three buttons: A, B, C.
 *   3. After each answer: right or wrong, the correct answer, and why.
 *   4. At the end, or when time is up, their score.
 *
 * Who gets what:
 *   - Full access (a linked account with an active grant, or a free promo
 *     window): every test, untimed, as often as they like.
 *   - Everyone else: 10 minutes on each test, once per WhatsApp number. Then
 *     they are offered full access, which is bought on the website after
 *     linking the number to an account.
 *
 * All state lives in the wa_* tables (migration 28), so any server instance
 * can answer any message. Taps are applied with an optimistic check on the
 * question position, so a double tap or a retried webhook never counts twice.
 */
import { randomInt } from 'crypto'
import { createAdminClient } from '@/lib/supabase-admin'
import { userHasFullAccess } from '@/lib/access'
import { getExplanationsForQuestions } from '@/lib/learn-mode'
import { ACCESS_PRICE, ACCESS_DURATION_DAYS } from '@/lib/contact'
import { sendButtons, sendLinkButton, sendList, sendText, clip } from '@/lib/whatsapp/api'

export const FREE_SECONDS = 10 * 60
const LINK_CODE_MINUTES = 30
const SITE = (process.env.WHATSAPP_SITE_URL || 'https://www.skdriving.co.za').replace(/\/+$/, '')

/** The tests offered on WhatsApp, in menu order. */
const CATALOGUE: { code: string; label: string; tests: number[] }[] = [
  { code: 'code8',     label: 'Code 8',     tests: [1, 2, 3] },
  { code: 'code10',    label: 'Code 10',    tests: [1, 2, 3] },
  { code: 'final-k53', label: 'Final test', tests: [1] },
]

type Db = ReturnType<typeof createAdminClient>

interface WaUser { wa_id: string; user_id: string | null }

interface Session {
  id: string
  wa_id: string
  course_id: number
  test_number: number
  mode: 'free' | 'full'
  question_ids: number[]
  position: number
  correct: number
  answers: { q: number; a: string; ok: boolean }[]
  deadline: string | null
  finished_at: string | null
}

interface Question {
  id: number
  question: string
  option_a: string
  option_b: string
  option_c: string
  correct_answer: 'A' | 'B' | 'C'
  image_url: string | null
}

export interface Incoming {
  waId: string
  profileName?: string
  /** Free text the learner typed, if any. */
  text?: string
  /** Id of the button or list row the learner tapped, if any. */
  replyId?: string
}

// ── Entry point ─────────────────────────────────────────────────────────────

export async function handleIncoming(msg: Incoming): Promise<void> {
  const db = createAdminClient()
  const user = await touchUser(db, msg.waId, msg.profileName)

  if (msg.replyId) return handleReply(db, user, msg.replyId)

  const text = (msg.text ?? '').trim()
  const word = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()

  // A typed answer: exactly one letter, optionally in brackets or with a full
  // stop: "a", "B", "(c)", "b." — but never a word such as "bye" or "cab".
  const typed = /^\(?\s*([abc])\s*[).]?$/i.exec(text)
  if (typed) {
    const open = await openSession(db, user.wa_id)
    if (open) return answer(db, user, open, typed[1].toUpperCase() as 'A' | 'B' | 'C', open.position)
  }

  if (['stop', 'quit', 'end', 'exit', 'cancel'].includes(word)) return stop(db, user)
  if (['buy', 'pay', 'access', 'price', 'pricing', 'full access'].includes(word)) return offerFullAccess(db, user)
  if (['link', 'account', 'login', 'log in'].includes(word)) return offerLink(db, user)
  if (['help', '?'].includes(word)) return sendHelp(user)

  const open = await openSession(db, user.wa_id)
  if (open && !['menu', 'hi', 'hello', 'start', 'tests', 'test'].includes(word)) {
    await sendText(user.wa_id, 'Please tap A, B or C to answer. Type STOP to end this test.')
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
  if (kind === 'ans') {
    const [sessionId, pos, letter] = rest
    const session = await openSession(db, user.wa_id)
    // A tap on an old message (another test, or a question already answered) is ignored.
    if (!session || session.id !== sessionId) return
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
  if (error || !data) throw new Error(`wa_users upsert failed: ${error?.message}`)
  return data as WaUser
}

/** The learner's running test, closing it first if its free time ran out. */
async function openSession(db: Db, waId: string): Promise<Session | null> {
  const { data } = await db
    .from('wa_quiz_sessions')
    .select('*')
    .eq('wa_id', waId)
    .is('finished_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as Session | null) ?? null
}

function secondsLeft(s: Session): number | null {
  if (!s.deadline) return null
  return Math.max(0, Math.ceil((Date.parse(s.deadline) - Date.now()) / 1000))
}

async function finish(db: Db, s: Session, reason: 'completed' | 'time' | 'stopped' | 'replaced'): Promise<Session | null> {
  const { data } = await db
    .from('wa_quiz_sessions')
    .update({ finished_at: new Date().toISOString(), finish_reason: reason })
    .eq('id', s.id)
    .is('finished_at', null)
    .select('*')
    .maybeSingle()
  return (data as Session | null) ?? null
}

async function loadQuestion(db: Db, id: number): Promise<Question | null> {
  const { data } = await db
    .from('quiz_questions')
    .select('id, question, option_a, option_b, option_c, correct_answer, image_url')
    .eq('id', id)
    .maybeSingle()
  return (data as Question | null) ?? null
}

async function courseIdsByCode(db: Db): Promise<Map<string, { id: number; title: string }>> {
  const { data } = await db.from('courses').select('id, code, title').in('code', CATALOGUE.map(c => c.code))
  return new Map((data ?? []).map(c => [c.code as string, { id: c.id as number, title: c.title as string }]))
}

function testLabel(courseCode: string | undefined, testNumber: number): string {
  const entry = CATALOGUE.find(c => c.code === courseCode)
  if (!entry) return `Test ${testNumber}`
  return entry.tests.length === 1 ? entry.label : `${entry.label} · Test ${testNumber}`
}

function fmt(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
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

  const status = full
    ? 'You have *full access*: every test, no time limit.'
    : `Free: *10 minutes* on each test. Full access is ${ACCESS_PRICE} for ${ACCESS_DURATION_DAYS} days (type BUY).`

  await sendList(
    user.wa_id,
    `🚗 *SK Driving K53 practice tests*\n\nPick a test. Each question comes with buttons A, B and C, and you see the right answer after every question.\n\n${status}`,
    'Choose a test',
    'Practice tests',
    rows,
  )
}

async function sendHelp(user: WaUser): Promise<void> {
  await sendText(user.wa_id, [
    '*How it works*',
    'MENU: choose a test',
    'A, B or C: answer the question',
    'STOP: end the test and see your score',
    'BUY: get full access',
    'LINK: connect this number to your skdriving.co.za account',
  ].join('\n'))
}

// ── Taking a test ───────────────────────────────────────────────────────────

async function startTest(db: Db, user: WaUser, courseId: number, testNumber: number): Promise<void> {
  const courses = await courseIdsByCode(db)
  const code = Array.from(courses.entries()).find(([, c]) => c.id === courseId)?.[0]
  const entry = CATALOGUE.find(c => c.code === code)
  if (!entry || !entry.tests.includes(testNumber)) return sendMenu(db, user)
  const label = testLabel(code, testNumber)

  // Resume the same test if it is still running; close any other.
  const open = await openSession(db, user.wa_id)
  if (open) {
    const left = secondsLeft(open)
    const sameTest = open.course_id === courseId && open.test_number === testNumber
    if (sameTest && left !== 0) {
      await sendText(user.wa_id, `Carrying on with *${label}* where you left off.`)
      return sendQuestion(db, user, open)
    }
    // Same test with its free time used up: give them their score now.
    if (sameTest) return endAndReport(db, user, open, 'time')
    await finish(db, open, left === 0 ? 'time' : 'replaced')
  }

  const full = await userHasFullAccess(user.user_id)
  if (!full) {
    const { count } = await db
      .from('wa_quiz_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('wa_id', user.wa_id)
      .eq('course_id', courseId)
      .eq('test_number', testNumber)
      .eq('mode', 'free')
    if ((count ?? 0) > 0) {
      await sendText(user.wa_id, `You have already used your free 10 minutes on *${label}*.`)
      return offerFullAccess(db, user)
    }
  }

  const { data: qs } = await db
    .from('quiz_questions')
    .select('id')
    .eq('course_id', courseId)
    .eq('test_number', testNumber)
    .order('id')
  const ids = (qs ?? []).map(q => q.id as number)
  if (ids.length === 0) {
    await sendText(user.wa_id, 'That test is not available right now. Please pick another.')
    return sendMenu(db, user)
  }

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
  if (error || !created) throw new Error(`could not start session: ${error?.message}`)

  await sendText(user.wa_id, full
    ? `📝 *${label}*: ${ids.length} questions, no time limit.\nTap A, B or C. Type STOP to end and see your score.`
    : `📝 *${label}*: ${ids.length} questions.\n⏱ Your free *10 minutes* start now. Answer as many as you can.\nTap A, B or C. Type STOP to end and see your score.`)
  return sendQuestion(db, user, created as Session)
}

async function sendQuestion(db: Db, user: WaUser, s: Session): Promise<void> {
  const left = secondsLeft(s)
  if (left === 0) return endAndReport(db, user, s, 'time')

  const q = await loadQuestion(db, s.question_ids[s.position])
  if (!q) {
    // A question was removed after the test started: skip it.
    const { data } = await db.from('wa_quiz_sessions')
      .update({ position: s.position + 1 }).eq('id', s.id).eq('position', s.position).select('*').maybeSingle()
    const next = data as Session | null
    if (!next) return
    return next.position >= next.question_ids.length ? endAndReport(db, user, next, 'completed') : sendQuestion(db, user, next)
  }

  const head = `*Question ${s.position + 1} of ${s.question_ids.length}*${left != null ? `   ⏱ ${fmt(left)} left` : ''}`
  const body = `${head}\n\n${q.question.trim()}\n\n*A*  ${q.option_a.trim()}\n*B*  ${q.option_b.trim()}\n*C*  ${q.option_c.trim()}`
  const buttons = (['A', 'B', 'C'] as const).map(l => ({ id: `ans:${s.id}:${s.position}:${l}`, title: l }))
  const sent = await sendButtons(user.wa_id, body, buttons, { imageUrl: q.image_url, footer: 'Type STOP to end the test' })
  // WhatsApp rejects the whole message if it cannot fetch the image. Send the
  // question without it rather than leave the learner with nothing.
  if (!sent && q.image_url) {
    await sendButtons(user.wa_id, `${body}\n\n(The picture for this question could not be shown.)`, buttons, { footer: 'Type STOP to end the test' })
  }
}

async function answer(db: Db, user: WaUser, s: Session, letter: 'A' | 'B' | 'C', position: number): Promise<void> {
  if (position !== s.position) return              // an earlier question's button: already answered
  if (secondsLeft(s) === 0) return endAndReport(db, user, s, 'time')

  const q = await loadQuestion(db, s.question_ids[s.position])
  if (!q) return sendQuestion(db, user, s)
  const ok = letter === q.correct_answer

  // Optimistic update: only applies if nobody else moved this session on.
  const { data } = await db
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
  const next = data as Session | null
  if (!next) return                                 // double tap or retried webhook

  const right = q.correct_answer
  const rightText = right === 'A' ? q.option_a : right === 'B' ? q.option_b : q.option_c
  const why = (await getExplanationsForQuestions([q.id]))[q.id]?.why?.trim()
  await sendText(user.wa_id, [
    ok ? '✅ *Correct!*' : `❌ *Not quite.* The answer is *${right}*: ${rightText.trim()}`,
    why ? `\n💡 ${clip(why, 600)}` : '',
  ].join(''))

  if (next.position >= next.question_ids.length) return endAndReport(db, user, next, 'completed')
  return sendQuestion(db, user, next)
}

async function stop(db: Db, user: WaUser): Promise<void> {
  const open = await openSession(db, user.wa_id)
  if (!open) {
    await sendText(user.wa_id, 'There is no test running.')
    return sendMenu(db, user)
  }
  return endAndReport(db, user, open, 'stopped')
}

async function endAndReport(db: Db, user: WaUser, s: Session, reason: 'completed' | 'time' | 'stopped'): Promise<void> {
  const closed = await finish(db, s, reason)
  if (!closed) return                               // another request already reported it

  const courses = await courseIdsByCode(db)
  const code = Array.from(courses.entries()).find(([, c]) => c.id === s.course_id)?.[0]
  const label = testLabel(code, s.test_number)
  const total = s.question_ids.length
  const answered = closed.position
  const pct = total ? Math.round((closed.correct / total) * 100) : 0

  const title = reason === 'completed' ? '🏁 *Test complete!*' : reason === 'time' ? '⏰ *Time is up!*' : '🛑 *Test ended.*'
  const lines = [
    `${title}  ${label}`,
    '',
    `Correct: *${closed.correct}* of ${total} (${pct}%)`,
    answered < total ? `You answered ${answered} of ${total} questions.` : '',
  ].filter(Boolean)
  await sendText(user.wa_id, lines.join('\n'))

  const full = closed.mode === 'full' || (await userHasFullAccess(user.user_id))
  if (full) {
    await sendButtons(user.wa_id, 'Ready for another one?', [{ id: 'menu', title: 'Choose a test' }])
    return
  }
  await sendButtons(
    user.wa_id,
    `With full access (${ACCESS_PRICE} for ${ACCESS_DURATION_DAYS} days) you can take every test as often as you like, with no 10-minute limit.`,
    [{ id: 'buy', title: 'Get full access' }, { id: 'menu', title: 'Another test' }],
  )
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
  await sendLinkButton(
    user.wa_id,
    user.user_id
      ? 'This number is already linked to an account. To link it to a different one, open this page (it works for 30 minutes).'
      : 'Link this WhatsApp number to your skdriving.co.za account. Log in (or register), then confirm. The link works for 30 minutes.',
    'Link my account',
    `${SITE}/whatsapp/link?code=${code}`,
  )
}

async function offerFullAccess(db: Db, user: WaUser): Promise<void> {
  if (await userHasFullAccess(user.user_id)) {
    await sendText(user.wa_id, 'You already have full access. Type MENU to choose a test.')
    return
  }
  if (user.user_id) {
    await sendLinkButton(
      user.wa_id,
      `Full access is ${ACCESS_PRICE} for ${ACCESS_DURATION_DAYS} days: every test, as often as you like, with no time limit. Pay securely on our website, then come back here and type MENU.`,
      'Get full access',
      `${SITE}/pricing`,
    )
    return
  }
  const code = await newLinkCode(db, user.wa_id)
  await sendLinkButton(
    user.wa_id,
    `Full access is ${ACCESS_PRICE} for ${ACCESS_DURATION_DAYS} days: every test, as often as you like, with no time limit.\n\nTap below, log in or register, and pay on our website. Your WhatsApp number is linked at the same time, so you can carry on here.`,
    'Get full access',
    `${SITE}/whatsapp/link?code=${code}&then=pay`,
  )
}

// ── Used by the website once a learner confirms the link ────────────────────

export function maskNumber(waId: string): string {
  const d = waId.replace(/\D/g, '')
  return d.length > 4 ? `+${d.slice(0, 2)} ••• ••• ${d.slice(-4)}` : d
}

export async function linkNumberToAccount(code: string, userId: string): Promise<{ ok: true; waId: string } | { ok: false; reason: string }> {
  const db = createAdminClient()
  const { data: row } = await db
    .from('wa_link_codes')
    .select('code, wa_id, expires_at, used_at')
    .eq('code', code)
    .maybeSingle()
  if (!row) return { ok: false, reason: 'This link is not valid. Type LINK in WhatsApp to get a new one.' }
  if (row.used_at) return { ok: false, reason: 'This link has already been used. Type LINK in WhatsApp to get a new one.' }
  if (Date.parse(row.expires_at) < Date.now()) return { ok: false, reason: 'This link has expired. Type LINK in WhatsApp to get a new one.' }

  // Claim the code first so it can only ever be used once.
  const { data: claimed } = await db
    .from('wa_link_codes')
    .update({ used_at: new Date().toISOString(), used_by: userId })
    .eq('code', code)
    .is('used_at', null)
    .select('code')
    .maybeSingle()
  if (!claimed) return { ok: false, reason: 'This link has already been used. Type LINK in WhatsApp to get a new one.' }

  // One number per account: free any number previously linked to this account.
  await db.from('wa_users').update({ user_id: null }).eq('user_id', userId).neq('wa_id', row.wa_id)
  const { error } = await db.from('wa_users').update({ user_id: userId }).eq('wa_id', row.wa_id)
  if (error) return { ok: false, reason: 'Something went wrong linking your number. Please try again.' }

  const full = await userHasFullAccess(userId)
  await sendText(row.wa_id, full
    ? '✅ This number is now linked to your SK Driving account, and you have *full access*. Type MENU to choose a test.'
    : `✅ This number is now linked to your SK Driving account. Once you have paid for full access, type MENU here to practise with no time limit.`)
  return { ok: true, waId: row.wa_id }
}

export async function describeLinkCode(code: string): Promise<{ valid: boolean; masked?: string; reason?: string }> {
  const { data: row } = await createAdminClient()
    .from('wa_link_codes')
    .select('wa_id, expires_at, used_at')
    .eq('code', code)
    .maybeSingle()
  if (!row) return { valid: false, reason: 'This link is not valid. Type LINK in WhatsApp to get a new one.' }
  if (row.used_at) return { valid: false, reason: 'This link has already been used. Type LINK in WhatsApp to get a new one.' }
  if (Date.parse(row.expires_at) < Date.now()) return { valid: false, reason: 'This link has expired. Type LINK in WhatsApp to get a new one.' }
  return { valid: true, masked: maskNumber(row.wa_id) }
}
