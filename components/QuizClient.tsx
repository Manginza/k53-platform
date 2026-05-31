'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { QuizQuestion } from '@/lib/types'

type Option    = 'A' | 'B' | 'C'
type AnswerMap = Record<number, Option>

/** Free preview length (seconds) before non-premium users hit the paywall. */
const FREE_SECONDS = 180

interface Props {
  questions:   QuizQuestion[]
  courseTitle: string
  courseId:    number
  testNumber:  number
  isPremium:   boolean
  isLoggedIn:  boolean
}

// ── Paywall overlay (free preview expired) ───────────────────────────────────
function PaywallOverlay({ courseId, isLoggedIn }: { courseId: number; isLoggedIn: boolean }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="text-5xl mb-4">⏱️</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Your free preview is up</h1>
        <p className="text-sm text-gray-500 mb-6">
          You&apos;ve used your free 3 minutes on this test. Get an access pass to keep practising —
          unlimited timed tests, plus Live Notes, resources and videos.
        </p>

        <div className="grid grid-cols-3 gap-2 mb-6 text-sm">
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="font-extrabold text-gray-900">R49</div>
            <div className="text-xs text-gray-400">14 days</div>
          </div>
          <div className="rounded-xl border-2 border-blue-600 p-3">
            <div className="font-extrabold text-blue-700">R150</div>
            <div className="text-xs text-gray-400">50 days</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="font-extrabold text-gray-900">R399</div>
            <div className="text-xs text-gray-400">lifetime</div>
          </div>
        </div>

        <Link
          href="/pricing"
          className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors"
        >
          View access passes
        </Link>
        <Link
          href={`/courses/${courseId}`}
          className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 transition-colors text-sm"
        >
          Back to course
        </Link>

        {!isLoggedIn && (
          <p className="text-sm text-gray-500 mt-2">
            Already paid?{' '}
            <Link href="/login" className="text-blue-700 font-medium hover:underline">Log in</Link>
          </p>
        )}
      </div>
    </div>
  )
}

/** mm:ss formatter for the countdown pill. */
function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
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
export default function QuizClient({ questions, courseTitle, courseId, testNumber, isPremium, isLoggedIn }: Props) {
  const [current,  setCurrent]  = useState(0)
  const [answers,  setAnswers]  = useState<AnswerMap>({})
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(false)

  // Timer. Paid users get an exam-style limit of 1 minute per question
  // (auto-submits to results on expiry); free users get a 3-minute preview
  // that then hits the paywall. Premium users can restart any time.
  const totalSeconds = isPremium ? questions.length * 60 : FREE_SECONDS
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [lockedOut,   setLockedOut]   = useState(false)

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

  const isSplitTest = testNumber === 2

  // For split test: show rules questions first, then signs
  const ordered = isSplitTest
    ? [
        ...questions.filter(q => !q.image_url),
        ...questions.filter(q =>  q.image_url),
      ]
    : questions

  const q        = ordered[current]
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

  if (lockedOut) {
    return <PaywallOverlay courseId={courseId} isLoggedIn={isLoggedIn} />
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
            {sectionLabel ?? courseTitle}
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
              <img
                src={q.image_url}
                alt={`Question ${current + 1}`}
                className="max-h-52 max-w-full object-contain rounded-lg"
                onError={e => {
                  const el = e.target as HTMLImageElement
                  el.parentElement!.innerHTML =
                    `<div class="flex flex-col items-center justify-center w-64 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 text-sm gap-1">
                      <span class="text-2xl">🖼</span>
                      <span>${q.image_ref ?? 'image'}</span>
                    </div>`
                }}
              />
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
            <div className={`flex items-center gap-3 px-5 py-4 rounded-xl font-medium text-sm ${
              selected === q.correct_answer
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50  border border-red-200  text-red-800'
            }`}>
              <span className="text-xl">{selected === q.correct_answer ? '✅' : '❌'}</span>
              <span>
                {selected === q.correct_answer
                  ? 'Correct! Well done.'
                  : `Incorrect. The correct answer is ${q.correct_answer}.`}
              </span>
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
