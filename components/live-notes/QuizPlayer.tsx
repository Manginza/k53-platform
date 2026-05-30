'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

interface Option   { id: string; option_label: string; option_text: string }
interface Question { id: string; question_number: number; question_text: string; options: Option[] }
interface Quiz     { id: string; title: string; instructions: string | null }

interface Props {
  quiz: Quiz
  questions: Question[]
  user: User
  chapterNumber: number
}

export default function QuizPlayer({ quiz, questions, user, chapterNumber }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const startedAt = useRef(new Date())

  const [currentIdx, setCurrentIdx]   = useState(0)
  const [answers, setAnswers]         = useState<Record<string, string>>({}) // question_id → option_id
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const total   = questions.length
  const current = questions[currentIdx]
  const isLast  = currentIdx === total - 1
  const selected = current ? answers[current.id] : undefined

  const select = (optionId: string) => {
    if (submitting) return
    setAnswers(prev => ({ ...prev, [current.id]: optionId }))
  }

  const next = () => {
    if (currentIdx < total - 1) setCurrentIdx(i => i + 1)
  }

  const submit = async () => {
    // Check all questions answered
    const unanswered = questions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} question(s) remaining.`)
      // Jump to first unanswered
      const firstIdx = questions.findIndex(q => !answers[q.id])
      if (firstIdx >= 0) setCurrentIdx(firstIdx)
      return
    }

    setSubmitting(true)
    setError(null)

    const payload = questions.map(q => ({
      question_id: q.id,
      option_id: answers[q.id],
    }))

    const durationSeconds = Math.floor((Date.now() - startedAt.current.getTime()) / 1000)

    const { data, error: rpcError } = await supabase.rpc('ln_submit_quiz', {
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

    const result = data[0]
    router.push(`/live-notes/chapter/${chapterNumber}/results/${result.attempt_id}`)
  }

  if (!current) return <div className="p-8 text-center text-gray-500">No questions found.</div>

  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-green-200 mb-1">
            Chapter {chapterNumber} Quiz
          </div>
          <div className="font-bold text-lg leading-tight">{quiz.title.replace(/^Chapter \d+ Quiz — /, '')}</div>
          {quiz.instructions && (
            <div className="text-green-200 text-xs mt-1">{quiz.instructions}</div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-green-800">
        <div
          className="bg-green-400 h-1 transition-all duration-300"
          style={{ width: `${(answeredCount / total) * 100}%` }}
        />
      </div>
      <div className="bg-green-700 text-green-200 text-xs px-4 pb-2">
        <div className="max-w-2xl mx-auto flex justify-between">
          <span>Question {currentIdx + 1} of {total}</span>
          <span>{answeredCount}/{total} answered</span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Question dots */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                i === currentIdx
                  ? 'bg-green-600 text-white'
                  : answers[q.id]
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-4">
          <div className="text-xs font-semibold text-green-600 mb-3 uppercase tracking-wide">
            Question {currentIdx + 1}
          </div>
          <p className="text-gray-900 font-semibold text-base sm:text-lg leading-relaxed mb-6">
            {current.question_text}
          </p>

          <div className="space-y-3">
            {current.options.map(opt => {
              const isSelected = selected === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => select(opt.id)}
                  disabled={submitting}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all min-h-[52px] text-sm sm:text-base ${
                    isSelected
                      ? 'border-green-600 bg-green-50 text-green-900 font-semibold'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  <span className={`inline-block w-6 h-6 rounded-full text-xs font-bold mr-3 text-center leading-6 flex-shrink-0 ${
                    isSelected ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {opt.option_label}
                  </span>
                  {opt.option_text}
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {currentIdx > 0 && (
            <button
              onClick={() => setCurrentIdx(i => i - 1)}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-400 transition-colors text-sm"
            >
              ‹ Previous
            </button>
          )}
          {!isLast ? (
            <button
              onClick={next}
              disabled={!selected}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-40 transition-colors text-sm"
            >
              Next ›
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || answeredCount < total}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-40 transition-colors text-sm"
            >
              {submitting ? 'Submitting…' : answeredCount < total ? `Answer all (${total - answeredCount} left)` : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
