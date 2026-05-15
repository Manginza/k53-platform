'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { QuizQuestion } from '@/lib/types'

type Option = 'A' | 'B' | 'C'
type AnswerMap = Record<number, Option>

interface Props {
  questions: QuizQuestion[]
  courseTitle: string
  courseId: number
}

// ── Results screen ────────────────────────────────────────────────────────
function ResultsScreen({
  questions,
  answers,
  courseId,
  courseTitle,
}: {
  questions: QuizQuestion[]
  answers: AnswerMap
  courseId: number
  courseTitle: string
}) {
  const [showReview, setShowReview] = useState(false)

  const score   = questions.filter(q => answers[q.id] === q.correct_answer).length
  const total   = questions.length
  const pct     = Math.round((score / total) * 100)
  const passed  = pct >= 75

  const optLabel = (q: QuizQuestion, key: Option) =>
    ({ A: q.option_a, B: q.option_b, C: q.option_c }[key])

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Score card */}
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

        {/* Quick stats */}
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

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Link
            href={`/quiz/${courseId}`}
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

        {/* Review list */}
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
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className={`shrink-0 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.question}</p>
                  </div>

                  {/* Image thumbnail in review */}
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

                  {/* Answer breakdown */}
                  <div className="ml-9 text-xs space-y-1">
                    {!correct && (
                      <div className="text-red-600">
                        Your answer: <span className="font-bold">{sel ?? '—'}</span>
                        {sel ? ` — ${optLabel(q, sel)}` : ' (not answered)'}
                      </div>
                    )}
                    <div className={`font-semibold ${correct ? 'text-green-700' : 'text-green-700'}`}>
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

// ── Main quiz component ───────────────────────────────────────────────────
export default function QuizClient({ questions, courseTitle, courseId }: Props) {
  const [current,  setCurrent]  = useState(0)
  const [answers,  setAnswers]  = useState<AnswerMap>({})
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(false)

  const q        = questions[current]
  const selected = answers[q.id]
  const progress = ((current) / questions.length) * 100

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
    if (current === questions.length - 1) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setRevealed(false)
    }
  }

  if (finished) {
    return (
      <ResultsScreen
        questions={questions}
        answers={answers}
        courseId={courseId}
        courseTitle={courseTitle}
      />
    )
  }

  // Option button styles
  const optionStyle = (key: Option) => {
    const base = 'w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-start gap-3'
    if (!revealed) {
      return `${base} border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer active:scale-[0.99]`
    }
    if (key === q.correct_answer) {
      return `${base} border-green-500 bg-green-50 cursor-default`
    }
    if (key === selected) {
      return `${base} border-red-400 bg-red-50 cursor-default`
    }
    return `${base} border-gray-100 bg-gray-50 opacity-50 cursor-default`
  }

  const optionTextStyle = (key: Option) => {
    if (!revealed)              return 'text-gray-800'
    if (key === q.correct_answer) return 'text-green-800 font-medium'
    if (key === selected)         return 'text-red-700'
    return 'text-gray-400'
  }

  const badgeStyle = (key: Option) => {
    const base = 'shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold'
    if (!revealed)              return `${base} border-gray-300 text-gray-500`
    if (key === q.correct_answer) return `${base} border-green-500 bg-green-500 text-white`
    if (key === selected)         return `${base} border-red-400 bg-red-400 text-white`
    return `${base} border-gray-200 text-gray-300`
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 truncate max-w-[60%]">{courseTitle}</span>
          <span className="text-sm font-bold text-gray-700 shrink-0">
            {current + 1} <span className="text-gray-400 font-normal">/ {questions.length}</span>
          </span>
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

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
                onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
              />
            </div>
          </div>
        )}

        {/* Question text */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
          <p className="text-base font-semibold text-gray-900 leading-relaxed">{q.question}</p>
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
            <div
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-medium text-sm ${
                selected === q.correct_answer
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
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
              {current === questions.length - 1 ? '🏁 See My Results' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
