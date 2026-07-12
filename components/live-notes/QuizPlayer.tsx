'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

interface Option   { id: string; option_label: string; option_text: string }
interface Question {
  id: string; question_number: number; question_text: string; options: Option[]
  image_url?: string | null   // exam-style sign/signal picture (K53 Unpacked)
}
interface Quiz     { id: string; title: string; instructions: string | null }

interface Props {
  quiz:          Quiz
  questions:     Question[]
  chapterNumber: number
  // Manual config — defaults preserve the original Road Signs "Live Notes" behaviour
  basePath?:   string   // route prefix, e.g. '/live-notes' or '/live-notes/k53'
  submitRpc?:  string   // server-side scoring RPC name
}

export default function QuizPlayer({
  quiz, questions, chapterNumber,
  basePath = '/live-notes',
  submitRpc = 'ln_submit_quiz',
}: Props) {
  const router   = useRouter()
  const supabase = createClient()
  const startedAt = useRef(new Date())

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers]       = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set())

  const total    = questions.length
  const current  = questions[currentIdx]
  const isLast   = currentIdx === total - 1
  const selected = current ? answers[current.id] : undefined
  const answeredCount = Object.keys(answers).length

  const select = (optionId: string) => {
    if (submitting) return
    setAnswers(prev => ({ ...prev, [current.id]: optionId }))
  }

  const submit = async () => {
    const unanswered = questions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      setError(`Please answer all questions — ${unanswered.length} remaining.`)
      setCurrentIdx(questions.findIndex(q => !answers[q.id]))
      return
    }

    setSubmitting(true)
    setError(null)

    const payload = questions.map(q => ({ question_id: q.id, option_id: answers[q.id] }))
    const durationSeconds = Math.floor((Date.now() - startedAt.current.getTime()) / 1000)

    const { data, error: rpcError } = await supabase.rpc(submitRpc, {
      p_quiz_id:          quiz.id,
      p_answers:          payload,
      p_started_at:       startedAt.current.toISOString(),
      p_duration_seconds: durationSeconds,
    })

    if (rpcError || !data || data.length === 0) {
      setError(rpcError?.message ?? 'Submission failed. Please try again.')
      setSubmitting(false)
      return
    }

    router.push(`${basePath}/chapter/${chapterNumber}/results/${data[0].attempt_id}`)
  }

  if (!current) return <div className="p-8 text-center text-gray-500">No questions found.</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-green-700 text-white sticky top-14 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-widest text-green-200 mb-0.5">
                Chapter {chapterNumber} Quiz
              </div>
              <div className="font-bold text-sm sm:text-base leading-snug line-clamp-1">
                {quiz.title.replace(/^Chapter \d+ Quiz — /, '')}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-green-200 text-xs">{answeredCount}/{total} done</div>
              <div className="text-white font-bold text-sm">{currentIdx + 1}/{total}</div>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="bg-green-800 h-1">
          <div
            className="bg-green-300 h-1 transition-all duration-300"
            style={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Question area ───────────────────────────────────────── */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-6">

        {/* Question dots — tap to jump */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              aria-label={`Question ${i + 1}`}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-bold transition-colors ${
                i === currentIdx
                  ? 'bg-green-600 text-white shadow'
                  : answers[q.id]
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-4">
          <div className="text-xs font-semibold text-green-600 mb-2 sm:mb-3 uppercase tracking-wide">
            Question {currentIdx + 1} of {total}
          </div>

          {/* Exam-style picture (road sign / signal / hand signal) */}
          {current.image_url && !failedImages.has(current.image_url) && (
            <div className="flex justify-center mb-4 sm:mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.image_url}
                alt="Road sign or signal referred to in this question"
                className="quiz-image h-28 sm:h-36 max-w-full object-contain"
                decoding="async"
                onError={() => setFailedImages(previous => new Set(previous).add(current.image_url!))}
              />
            </div>
          )}

          <p className="text-gray-900 font-semibold text-base sm:text-lg leading-relaxed mb-5 sm:mb-6">
            {current.question_text}
          </p>

          <div className="space-y-2 sm:space-y-3">
            {current.options.map(opt => {
              const isSelected = selected === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => select(opt.id)}
                  disabled={submitting}
                  className={`w-full text-left px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border-2 transition-all text-sm sm:text-base min-h-[52px] flex items-center gap-3 ${
                    isSelected
                      ? 'border-green-600 bg-green-50 text-green-900 font-semibold'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-green-400 hover:bg-green-50 active:scale-[0.99]'
                  }`}
                >
                  <span className={`flex-shrink-0 inline-flex w-7 h-7 rounded-full text-xs font-bold items-center justify-center ${
                    isSelected ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {opt.option_label}
                  </span>
                  <span className="leading-snug">{opt.option_text}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-2 sm:gap-3">
          {currentIdx > 0 && (
            <button
              onClick={() => setCurrentIdx(i => i - 1)}
              disabled={submitting}
              className="flex-1 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-400 transition-colors text-sm"
            >
              ‹ Prev
            </button>
          )}
          {!isLast ? (
            <button
              onClick={() => setCurrentIdx(i => i + 1)}
              disabled={!selected}
              className="flex-1 py-3 sm:py-3.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-40 transition-colors text-sm"
            >
              Next ›
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || answeredCount < total}
              className="flex-1 py-3 sm:py-3.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-40 transition-colors text-sm"
            >
              {submitting
                ? 'Submitting…'
                : answeredCount < total
                ? `${total - answeredCount} unanswered`
                : 'Submit Quiz ✓'}
            </button>
          )}
        </div>

        {/* Hint text */}
        {!selected && !isLast && (
          <p className="text-center text-gray-400 text-xs mt-3">Select an answer to continue</p>
        )}
      </div>
    </div>
  )
}
