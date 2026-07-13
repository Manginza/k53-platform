'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import QuizPaywall from '@/components/QuizPaywall'
import type { QuizQuestion } from '@/lib/types'
import { EXPLANATIONS } from '@/lib/explanations'

type Option    = 'A' | 'B' | 'C'
type AnswerMap = Record<number, Option>

/** Free preview length (seconds) before non-premium users hit the paywall. */
const FREE_SECONDS = 120

interface Props {
  questions:   QuizQuestion[]
  courseTitle: string
  courseId:    number
  testNumber:  number
  isPremium:   boolean
  /** Server-computed seconds left in the free preview (non-premium only). */
  initialSeconds?: number
  /** Use separate K53 section pass marks instead of one combined percentage. */
  splitScoring?: boolean
}

/** mm:ss formatter for the countdown pill. */
function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const FINAL_TEST_TITLE = 'Final Test Code 8, 10 and Motorcycle'
const MOTORCYCLE_TEST_C_QUESTIONS = new Set([25, 36, 38, 40, 41, 42, 43, 44, 49])
const MOTORCYCLE_CONTROLS = [
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
function isMotorcycleQuestion(question: QuizQuestion): boolean {
  const match = question.question.match(/^Test ([ABC]).*Question (\d+)/)
  if (!match) return false
  const number = Number(match[2])
  return (match[1] === 'A' && number >= 10 && number <= 18)
    || (match[1] === 'C' && MOTORCYCLE_TEST_C_QUESTIONS.has(number))
}

// ── Split-score results (Test 2 — K53 format) ────────────────────────────────
function SplitResultsScreen({
  questions,
  answers,
  courseId,
  courseTitle,
}: {
  questions:   QuizQuestion[]
  answers:     AnswerMap
  courseId:    number
  courseTitle: string
}) {
  const [showReview, setShowReview] = useState(false)

  const rulesQs  = questions.filter(q => !q.image_url)
  const signsQs  = questions.filter(q =>  q.image_url)

  const rulesScore = rulesQs.filter(q => answers[q.id] === q.correct_answer).length
  const signsScore = signsQs.filter(q => answers[q.id] === q.correct_answer).length
  const total      = questions.length
  const totalScore = rulesScore + signsScore

  const RULES_PASS = 22
  const SIGNS_PASS = 22

  const rulesPassed = rulesScore >= RULES_PASS
  const signsPassed = signsScore >= SIGNS_PASS
  const passed      = rulesPassed && signsPassed

  const pct = Math.round((totalScore / total) * 100)

  const optLabel = (q: QuizQuestion, key: Option) =>
    ({ A: q.option_a, B: q.option_b, C: q.option_c }[key])

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Banner */}
        <div className={`rounded-2xl p-8 text-center mb-6 shadow-lg ${passed ? 'bg-green-600' : 'bg-red-500'} text-white`}>
          <div className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-3">{courseTitle}</div>
          <div className="text-6xl font-extrabold mb-1">{pct}%</div>
          <div className="text-2xl font-bold mb-2">
            {passed ? '🎉 You Passed!' : '😔 Keep Practising'}
          </div>
          <div className="text-white/80">{totalScore} out of {total} correct</div>
          {!passed && (
            <div className="mt-3 text-sm text-white/70 bg-white/10 rounded-full px-4 py-1 inline-block">
              Both sections must be passed
            </div>
          )}
        </div>

        {/* Section breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`rounded-2xl p-5 border-2 text-center ${rulesPassed ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}`}>
            <div className={`text-3xl font-extrabold ${rulesPassed ? 'text-green-700' : 'text-red-600'}`}>
              {rulesScore}/{rulesQs.length}
            </div>
            <div className="text-sm font-semibold text-gray-700 mt-1">Rules of the Road</div>
            <div className="text-xs text-gray-400 mt-0.5">Pass mark: {RULES_PASS}/{rulesQs.length}</div>
            <div className={`mt-2 text-xs font-bold px-3 py-0.5 rounded-full inline-block ${
              rulesPassed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-700'
            }`}>
              {rulesPassed ? 'PASS' : 'FAIL'}
            </div>
          </div>
          <div className={`rounded-2xl p-5 border-2 text-center ${signsPassed ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}`}>
            <div className={`text-3xl font-extrabold ${signsPassed ? 'text-green-700' : 'text-red-600'}`}>
              {signsScore}/{signsQs.length}
            </div>
            <div className="text-sm font-semibold text-gray-700 mt-1">Road Signs &amp; Controls</div>
            <div className="text-xs text-gray-400 mt-0.5">Pass mark: {SIGNS_PASS}/{signsQs.length}</div>
            <div className={`mt-2 text-xs font-bold px-3 py-0.5 rounded-full inline-block ${
              signsPassed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-700'
            }`}>
              {signsPassed ? 'PASS' : 'FAIL'}
            </div>
          </div>
        </div>

        {/* What to focus on */}
        {!passed && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 text-sm text-amber-800">
            <span className="font-semibold">Focus area: </span>
            {!rulesPassed && !signsPassed
              ? 'Both sections need more practice.'
              : !rulesPassed
              ? `Rules of the Road — need ${RULES_PASS - rulesScore} more correct.`
              : `Road Signs & Controls — need ${SIGNS_PASS - signsScore} more correct.`}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Link
            href={`/quiz/${courseId}?test=2`}
            className="flex-1 text-center bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href={`/courses/${courseId}`}
            className="flex-1 text-center bg-white text-gray-700 font-semibold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Back to Course
          </Link>
        </div>

        {/* Review toggle */}
        <button
          onClick={() => setShowReview(r => !r)}
          className="w-full text-center text-blue-600 font-semibold py-3 mb-4 hover:underline"
        >
          {showReview ? '▲ Hide Answer Review' : '▼ Review All Answers'}
        </button>

        {showReview && (
          <div className="space-y-3">
            {questions.map((q, i) => {
              const sel     = answers[q.id]
              const correct = sel === q.correct_answer
              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-xl border p-4 ${correct ? 'border-green-200' : 'border-red-200'}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`shrink-0 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-line">{q.question}</p>
                  </div>
                  {q.image_url && (
                    <div className="ml-9 mb-3">
                      <img
                        src={q.image_url}
                        alt=""
                        className="h-16 object-contain rounded border border-gray-100"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}
                  <div className="ml-9 text-xs space-y-1">
                    {!correct && (
                      <div className="text-red-600">
                        Your answer: <span className="font-bold">{sel ?? '—'}</span>
                        {sel ? ` — ${optLabel(q, sel)}` : ' (not answered)'}
                      </div>
                    )}
                    <div className="font-semibold text-green-700">
                      {correct ? '✓ ' : 'Correct: '}
                      <span className="font-bold">{q.correct_answer}</span>
                      {' — '}{optLabel(q, q.correct_answer)}
                    </div>
                    {(EXPLANATIONS[q.id] ?? q.explanation) && (
                      <p className="text-gray-500 leading-relaxed pt-1 border-t border-gray-100">
                        {EXPLANATIONS[q.id] ?? q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Standard results screen (Test 1 / flat 75%) ──────────────────────────────
function StandardResultsScreen({
  questions,
  answers,
  courseId,
  courseTitle,
}: {
  questions:   QuizQuestion[]
  answers:     AnswerMap
  courseId:    number
  courseTitle: string
}) {
  const [showReview, setShowReview] = useState(false)

  const score  = questions.filter(q => answers[q.id] === q.correct_answer).length
  const total  = questions.length
  const pct    = Math.round((score / total) * 100)
  const passed = pct >= 75

  const optLabel = (q: QuizQuestion, key: Option) =>
    ({ A: q.option_a, B: q.option_b, C: q.option_c }[key])

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className={`rounded-2xl p-10 text-center mb-6 shadow-lg ${passed ? 'bg-green-600' : 'bg-red-500'} text-white`}>
          <div className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-4">{courseTitle}</div>
          <div className="text-7xl font-extrabold mb-2">{pct}%</div>
          <div className="text-2xl font-bold mb-2">
            {passed ? '🎉 You Passed!' : '😔 Keep Practising'}
          </div>
          <div className="text-white/80 text-lg">{score} out of {total} correct</div>
          {!passed && (
            <div className="mt-3 text-sm text-white/70 bg-white/10 rounded-full px-4 py-1 inline-block">
              75% required to pass
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{score}</div>
            <div className="text-xs text-gray-500 mt-1">Correct</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-red-500">{total - score}</div>
            <div className="text-xs text-gray-500 mt-1">Incorrect</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{total}</div>
            <div className="text-xs text-gray-500 mt-1">Total</div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <Link
            href={`/quiz/${courseId}?test=1`}
            className="flex-1 text-center bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href={`/courses/${courseId}`}
            className="flex-1 text-center bg-white text-gray-700 font-semibold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Back to Course
          </Link>
        </div>

        <button
          onClick={() => setShowReview(r => !r)}
          className="w-full text-center text-blue-600 font-semibold py-3 mb-4 hover:underline"
        >
          {showReview ? '▲ Hide Answer Review' : '▼ Review All Answers'}
        </button>

        {showReview && (
          <div className="space-y-3">
            {questions.map((q, i) => {
              const sel     = answers[q.id]
              const correct = sel === q.correct_answer
              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-xl border p-4 ${correct ? 'border-green-200' : 'border-red-200'}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`shrink-0 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-line">{q.question}</p>
                  </div>
                  {q.image_url && (
                    <div className="ml-9 mb-3">
                      <img
                        src={q.image_url}
                        alt=""
                        className="h-16 object-contain rounded border border-gray-100"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}
                  <div className="ml-9 text-xs space-y-1">
                    {!correct && (
                      <div className="text-red-600">
                        Your answer: <span className="font-bold">{sel ?? '—'}</span>
                        {sel ? ` — ${optLabel(q, sel)}` : ' (not answered)'}
                      </div>
                    )}
                    <div className="font-semibold text-green-700">
                      {correct ? '✓ ' : 'Correct: '}
                      <span className="font-bold">{q.correct_answer}</span>
                      {' — '}{optLabel(q, q.correct_answer)}
                    </div>
                    {(EXPLANATIONS[q.id] ?? q.explanation) && (
                      <p className="text-gray-500 leading-relaxed pt-1 border-t border-gray-100">
                        {EXPLANATIONS[q.id] ?? q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main quiz component ───────────────────────────────────────────────────────
export default function QuizClient({ questions, courseTitle, courseId, testNumber, isPremium, initialSeconds, splitScoring = false }: Props) {
  const [current,  setCurrent]  = useState(0)
  const [answers,  setAnswers]  = useState<AnswerMap>({})
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(false)
  const [skipMotorcycle, setSkipMotorcycle] = useState(false)
  const [motorcycleRefresherSeen, setMotorcycleRefresherSeen] = useState(false)
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set())

  // Timer. Paid users get an exam-style limit of 1 minute per question
  // (auto-submits to results on expiry); free users get a 3-minute preview
  // that then hits the paywall. Premium users can restart any time.
  // For free users the starting value comes from the server (initialSeconds)
  // and is reconciled with /api/quiz/session on mount so the window can't be
  // reset by reloading or editing the client timer.
  const totalSeconds = isPremium ? questions.length * 60 : (initialSeconds ?? FREE_SECONDS)
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [lockedOut,   setLockedOut]   = useState(false)

  // Authoritative free-preview timing from the server (start the window if new).
  useEffect(() => {
    if (isPremium) return
    let cancelled = false
    fetch('/api/quiz/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, testNumber }),
    })
      .then(r => r.json())
      .then(d => {
        if (cancelled || d.unlimited) return
        if (d.locked) { setLockedOut(true); return }
        if (typeof d.remaining === 'number') {
          // Trust the server: never allow more time than it reports.
          setSecondsLeft(s => Math.min(s, d.remaining))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [isPremium, courseId, testNumber])

  useEffect(() => {
    if (finished || lockedOut) return
    if (secondsLeft <= 0) {
      if (isPremium) setFinished(true)   // time's up → show results
      else           setLockedOut(true)  // free preview over → paywall
      return
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [isPremium, finished, lockedOut, secondsLeft])

  const isSplitTest = splitScoring

  // For split test: show rules questions first, then signs
  const baseOrdered = isSplitTest
    ? [
        ...questions.filter(q => !q.image_url),
        ...questions.filter(q =>  q.image_url),
      ]
    : questions
  const isFinalTest = courseTitle === FINAL_TEST_TITLE
  const motorcycleCount = isFinalTest ? baseOrdered.filter(isMotorcycleQuestion).length : 0
  const ordered = skipMotorcycle
    ? baseOrdered.filter(question => !isMotorcycleQuestion(question))
    : baseOrdered

  const q        = ordered[current]
  const finalSection = q.question.match(/^Test ([ABC]) · Question (\d+)/)
  const selected = answers[q.id]
  const progress = (current / ordered.length) * 100

  // Section label for split test
  const rulesCount = isSplitTest ? ordered.filter(q => !q.image_url).length : 0
  const isRules    = isSplitTest && current < rulesCount
  const sectionLabel = isSplitTest
    ? isRules
      ? `Rules of the Road · ${current + 1}/${rulesCount}`
      : `Road Signs & Controls · ${current - rulesCount + 1}/${ordered.length - rulesCount}`
    : null

  const options: { key: Option; label: string }[] = [
    { key: 'A', label: q.option_a },
    { key: 'B', label: q.option_b },
    { key: 'C', label: q.option_c },
  ]

  const handleSelect = (opt: Option) => {
    if (revealed) return
    setAnswers(prev => ({ ...prev, [q.id]: opt }))
    setRevealed(true)
  }

  const handleNext = () => {
    if (current === ordered.length - 1) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setRevealed(false)
    }
  }

  const handleMotorcyclePreference = (skip: boolean) => {
    setSkipMotorcycle(skip)
    setCurrent(0)
    setAnswers({})
    setRevealed(false)
    if (isPremium) {
      setSecondsLeft((skip ? baseOrdered.length - motorcycleCount : baseOrdered.length) * 60)
    }
  }

  if (lockedOut) {
    return <QuizPaywall courseId={courseId} />
  }

  if (finished) {
    return isSplitTest ? (
      <SplitResultsScreen
        questions={ordered}
        answers={answers}
        courseId={courseId}
        courseTitle={courseTitle}
      />
    ) : (
      <StandardResultsScreen
        questions={ordered}
        answers={answers}
        courseId={courseId}
        courseTitle={courseTitle}
      />
    )
  }

  if (isFinalTest && !skipMotorcycle && !motorcycleRefresherSeen && isMotorcycleQuestion(q)) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:py-10">
        <main className="mx-auto max-w-3xl">
          <div className="mb-4 text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600">Test A · Motorcycle section</div>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900">Motorcycle controls refresher</h1>
            <p className="mt-2 text-sm text-gray-500">Review the numbered controls and their functions before continuing. This refresher is not scored.</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/final-test/motorcycle-controls-refresher.png"
              alt="Motorcycle controls numbered one to eight with labels and functions"
              className="quiz-image h-auto w-full"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {MOTORCYCLE_CONTROLS.map(([number, name, description]) => (
              <div key={number} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{number}</span>
                <span>
                  <span className="block text-sm font-bold text-gray-900">{name}</span>
                  <span className="block text-xs leading-relaxed text-gray-500">{description}</span>
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMotorcycleRefresherSeen(true)}
            className="mt-6 w-full rounded-xl bg-blue-600 py-4 text-base font-bold text-white transition-colors hover:bg-blue-700"
          >
            Start motorcycle questions →
          </button>
        </main>
      </div>
    )
  }

  const optionStyle = (key: Option) => {
    const base = 'w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-start gap-3'
    if (!revealed) {
      return `${base} border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer active:scale-[0.99]`
    }
    if (key === q.correct_answer) return `${base} border-green-500 bg-green-50 cursor-default`
    if (key === selected)         return `${base} border-red-400  bg-red-50  cursor-default`
    return `${base} border-gray-100 bg-gray-50 opacity-50 cursor-default`
  }

  const optionTextStyle = (key: Option) => {
    if (!revealed)               return 'text-gray-800'
    if (key === q.correct_answer) return 'text-green-800 font-medium'
    if (key === selected)         return 'text-red-700'
    return 'text-gray-400'
  }

  const badgeStyle = (key: Option) => {
    const base = 'shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold'
    if (!revealed)               return `${base} border-gray-300 text-gray-500`
    if (key === q.correct_answer) return `${base} border-green-500 bg-green-500 text-white`
    if (key === selected)         return `${base} border-red-400   bg-red-400   text-white`
    return `${base} border-gray-200 text-gray-300`
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-500 truncate flex-1 min-w-0">
            {sectionLabel ?? (finalSection ? `Test ${finalSection[1]} · Question ${finalSection[2]}` : courseTitle)}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 tabular-nums ${
              secondsLeft <= (isPremium ? 60 : 30)
                ? 'bg-red-100 text-red-700'
                : isPremium ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
            }`}
            title={isPremium ? 'Time remaining' : 'Free preview time remaining'}
          >
            ⏱ {fmtTime(secondsLeft)}
          </span>
          <span className="text-sm font-bold text-gray-700 shrink-0">
            {current + 1} <span className="text-gray-400 font-normal">/ {ordered.length}</span>
          </span>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Final-test scoring preference. This is available before answering so
          changing it can never discard an in-progress attempt unexpectedly. */}
      {isFinalTest && current === 0 && Object.keys(answers).length === 0 && (
        <div className="max-w-2xl mx-auto px-4 pt-5">
          <button
            type="button"
            role="checkbox"
            aria-checked={skipMotorcycle}
            onClick={() => handleMotorcyclePreference(!skipMotorcycle)}
            className="w-full flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left"
          >
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs font-bold ${
              skipMotorcycle ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400 bg-white text-transparent'
            }`} aria-hidden="true">✓</span>
            <span>
              <span className="block text-sm font-bold text-blue-900">Skip motorcycle questions</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-blue-700">
                {skipMotorcycle
                  ? `${motorcycleCount} motorcycle-only questions excluded · score calculated out of ${baseOrdered.length - motorcycleCount}`
                  : `Include all ${baseOrdered.length} questions in the combined score`}
              </span>
            </span>
          </button>
        </div>
      )}

      {/* Section divider shown at the transition point */}
      {isSplitTest && current === rulesCount && (
        <div className="max-w-2xl mx-auto px-4 pt-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-sm text-blue-800 font-medium text-center">
            Section 2 — Road Signs &amp; Controls
          </div>
        </div>
      )}

      {/* Question card */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Image */}
        {q.image_url && (
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 inline-block">
              {failedImages.has(q.image_url) ? (
                <div
                  role="img"
                  aria-label={`Question ${current + 1} image unavailable`}
                  className="flex flex-col items-center justify-center w-64 max-w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-sm gap-1"
                >
                  <span className="text-2xl" aria-hidden="true">&#128444;</span>
                  <span>{q.image_ref ?? 'Image unavailable'}</span>
                </div>
              ) : (
                <img
                  key={q.image_url}
                  src={q.image_url}
                  alt={`Question ${current + 1}`}
                  className="quiz-image max-h-52 max-w-full object-contain rounded-lg"
                  decoding="async"
                  onError={() => setFailedImages(previous => new Set(previous).add(q.image_url!))}
                />
              )}
            </div>
          </div>
        )}

        {/* Question text — supports multi-line (combination questions) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
          <p className="text-base font-semibold text-gray-900 leading-relaxed whitespace-pre-line">{q.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={revealed}
              className={optionStyle(key)}
            >
              <span className={badgeStyle(key)}>{key}</span>
              <span className={`text-sm leading-relaxed pt-0.5 ${optionTextStyle(key)}`}>{label}</span>
            </button>
          ))}
        </div>

        {/* Feedback + next */}
        {revealed && (
          <div className="space-y-3 pt-1">
            <div className={`px-5 py-4 rounded-xl text-sm ${
              selected === q.correct_answer
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50  border border-red-200  text-red-800'
            }`}>
              <div className="flex items-center gap-3 font-medium">
                <span className="text-xl">{selected === q.correct_answer ? '✅' : '❌'}</span>
                <span>
                  {selected === q.correct_answer
                    ? 'Correct! Well done.'
                    : `Incorrect. The correct answer is ${q.correct_answer}.`}
                </span>
              </div>
              {(EXPLANATIONS[q.id] ?? q.explanation) && (
                <p className="mt-2 text-xs leading-relaxed opacity-90 border-t border-current/20 pt-2">
                  {EXPLANATIONS[q.id] ?? q.explanation}
                </p>
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-[0.99] transition-all text-base"
            >
              {current === ordered.length - 1 ? '🏁 See My Results' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
