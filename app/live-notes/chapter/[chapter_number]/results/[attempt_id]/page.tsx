import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

interface Props {
  params: { chapter_number: string; attempt_id: string }
}

interface AnswerDetail {
  question_id: string
  selected_option_id: string
  correct_option_id: string
  is_correct: boolean
}

export default async function ResultsPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const chapterNum = parseInt(params.chapter_number, 10)
  if (isNaN(chapterNum)) notFound()

  // Fetch attempt (RLS ensures it belongs to this user)
  const { data: attempt, error: attErr } = await supabase
    .from('ln_quiz_attempts')
    .select('*')
    .eq('id', params.attempt_id)
    .single()

  if (attErr || !attempt) notFound()

  const detail: AnswerDetail[] = attempt.answers ?? []
  const questionIds = detail.map(d => d.question_id)
  const optionIds   = Array.from(new Set([...detail.map(d => d.selected_option_id), ...detail.map(d => d.correct_option_id)]))

  const [{ data: questions }, { data: options }] = await Promise.all([
    supabase.from('ln_questions').select('id, question_number, question_text, explanation').in('id', questionIds),
    supabase.from('ln_question_options').select('id, option_label, option_text').in('id', optionIds),
  ])

  // Build review items
  const review = detail
    .map(d => {
      const question      = questions?.find(q => q.id === d.question_id)
      const selectedOption = options?.find(o => o.id === d.selected_option_id)
      const correctOption  = options?.find(o => o.id === d.correct_option_id)
      if (!question) return null
      return {
        number:        question.question_number,
        text:          question.question_text,
        explanation:   question.explanation,
        selectedLabel: selectedOption?.option_label ?? '?',
        selectedText:  selectedOption?.option_text ?? 'Not answered',
        correctLabel:  correctOption?.option_label ?? '?',
        correctText:   correctOption?.option_text ?? '',
        isCorrect:     d.is_correct,
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a!.number - b!.number)) as NonNullable<ReturnType<typeof review.find>>[]

  const score   = Math.round(Number(attempt.score_percent))
  const passed  = attempt.passed
  const correct = attempt.correct_count
  const total   = attempt.total_questions

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Score card */}
      <div className={`rounded-2xl p-6 text-center mb-8 ${passed ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-400'}`}>
        <div className="text-5xl font-extrabold mb-2" style={{ color: passed ? '#16a34a' : '#dc2626' }}>
          {score}%
        </div>
        <div className={`text-lg font-bold mb-1 ${passed ? 'text-green-700' : 'text-red-700'}`}>
          {passed ? '🎉 Passed!' : '❌ Not Passed'}
        </div>
        <div className="text-gray-500 text-sm">
          {correct} / {total} correct · Pass mark: 70%
        </div>

        {/* Animated score ring */}
        <div className="flex justify-center mt-4">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke={passed ? '#16a34a' : '#dc2626'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - score / 100)}`}
              transform="rotate(-90 40 40)"
            />
            <text x="40" y="46" textAnchor="middle" fontSize="14" fontWeight="bold" fill={passed ? '#16a34a' : '#dc2626'}>
              {correct}/{total}
            </text>
          </svg>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href={`/live-notes/chapter/${chapterNum}/quiz`}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-center text-sm hover:border-gray-400 transition-colors"
        >
          Retake Quiz
        </Link>
        {chapterNum < 18 ? (
          <Link
            href={`/live-notes/chapter/${chapterNum + 1}`}
            className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold text-center text-sm hover:bg-green-700 transition-colors"
          >
            Ch {chapterNum + 1} →
          </Link>
        ) : (
          <Link
            href="/live-notes"
            className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold text-center text-sm hover:bg-green-700 transition-colors"
          >
            All Chapters
          </Link>
        )}
      </div>

      {/* Question review */}
      <h2 className="font-bold text-lg text-gray-900 mb-4">Review ({review.length} questions)</h2>
      <div className="space-y-4">
        {review.map((item, i) => (
          <div
            key={i}
            className={`rounded-xl border-2 p-4 ${item.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
          >
            <div className="flex items-start gap-2 mb-3">
              <span className={`flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${item.isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {item.isCorrect ? '✓' : '✗'}
              </span>
              <p className="font-semibold text-gray-900 text-sm leading-snug">
                {item.number}. {item.text}
              </p>
            </div>

            <div className="ml-7 space-y-1 text-sm">
              {!item.isCorrect && (
                <div className="text-red-700">
                  <span className="font-semibold">Your answer ({item.selectedLabel}):</span> {item.selectedText}
                </div>
              )}
              <div className="text-green-700 font-semibold">
                ✓ Correct ({item.correctLabel}): {item.correctText}
              </div>
              <div className="text-gray-500 text-xs mt-2 italic leading-relaxed">
                {item.explanation}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link href="/live-notes" className="text-green-600 hover:underline text-sm font-medium">
          ← Back to all chapters
        </Link>
      </div>
    </main>
  )
}
