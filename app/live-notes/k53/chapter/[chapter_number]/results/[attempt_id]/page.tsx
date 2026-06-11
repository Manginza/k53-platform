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

type ReviewItem = {
  number: number; text: string; explanation: string
  imageUrl: string | null
  selectedLabel: string; selectedText: string
  correctLabel: string; correctText: string
  isCorrect: boolean
}

export default async function K53ResultsPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const chapterNum = parseInt(params.chapter_number, 10)
  if (isNaN(chapterNum)) notFound()

  const { data: attempt, error: attErr } = await supabase
    .from('ku_quiz_attempts')
    .select('*')
    .eq('id', params.attempt_id)
    .single()

  if (attErr || !attempt) notFound()

  const detail: AnswerDetail[] = attempt.answers ?? []
  const questionIds = detail.map(d => d.question_id)
  const optionIds   = Array.from(new Set([
    ...detail.map(d => d.selected_option_id),
    ...detail.map(d => d.correct_option_id),
  ]))

  // image_url requires migration 16 — fall back to a select without it.
  type QuestionRow = {
    id: string; question_number: number; question_text: string
    explanation: string; image_url?: string | null
  }
  const [qRes, { data: options }] = await Promise.all([
    supabase.from('ku_questions').select('id, question_number, question_text, explanation, image_url').in('id', questionIds),
    supabase.from('ku_question_options').select('id, option_label, option_text').in('id', optionIds),
  ])
  let questions = qRes.data as QuestionRow[] | null
  if (!questions) {
    questions = (await supabase
      .from('ku_questions').select('id, question_number, question_text, explanation').in('id', questionIds)).data as QuestionRow[] | null
  }

  // Question pictures: prefer the image_url column (migration 16); otherwise
  // fall back to the seed-written map stored alongside the images.
  const IMG_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resources/K53%20Unpacked/signs/`
  let imageMap: Record<string, string> = {}
  if (!questions?.some(q => q.image_url)) {
    try {
      const res = await fetch(IMG_BASE + 'question-images.json', { cache: 'no-store' })
      if (res.ok) imageMap = await res.json()
    } catch {}
  }

  const review: ReviewItem[] = detail
    .map((d): ReviewItem | null => {
      const question       = questions?.find(q => q.id === d.question_id)
      const selectedOption = options?.find(o => o.id === d.selected_option_id)
      const correctOption  = options?.find(o => o.id === d.correct_option_id)
      if (!question) return null
      const mapped = imageMap[`${chapterNum}:${question.question_number}`]
      return {
        number:        question.question_number,
        text:          question.question_text,
        explanation:   question.explanation,
        imageUrl:      question.image_url ?? (mapped ? IMG_BASE + mapped : null),
        selectedLabel: selectedOption?.option_label ?? '?',
        selectedText:  selectedOption?.option_text ?? 'Not answered',
        correctLabel:  correctOption?.option_label ?? '?',
        correctText:   correctOption?.option_text ?? '',
        isCorrect:     d.is_correct,
      }
    })
    .filter((x): x is ReviewItem => x !== null)
    .sort((a, b) => a.number - b.number)

  const score   = Math.round(Number(attempt.score_percent))
  const passed  = attempt.passed
  const correct = attempt.correct_count
  const total   = attempt.total_questions

  // Highest study chapter number, for the "next chapter" button
  const { data: lastChapter } = await supabase
    .from('ku_chapters')
    .select('chapter_number')
    .eq('is_front_matter', false)
    .order('chapter_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  const maxChapter = lastChapter?.chapter_number ?? chapterNum

  // This chapter's actual pass mark (exam-level thresholds vary per chapter)
  const { data: thisChapter } = await supabase
    .from('ku_chapters')
    .select('pass_threshold')
    .eq('chapter_number', chapterNum)
    .eq('is_front_matter', false)
    .maybeSingle()
  const passMark = thisChapter?.pass_threshold ?? 70

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

      {/* Score card */}
      <div className={`rounded-2xl p-5 sm:p-8 text-center mb-6 sm:mb-8 ${
        passed ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-400'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <svg width="90" height="90" viewBox="0 0 90 90" className="shrink-0">
            <circle cx="45" cy="45" r="38" fill="none" stroke="#e5e7eb" strokeWidth="9" />
            <circle
              cx="45" cy="45" r="38"
              fill="none"
              stroke={passed ? '#16a34a' : '#dc2626'}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - score / 100)}`}
              transform="rotate(-90 45 45)"
            />
            <text x="45" y="50" textAnchor="middle" fontSize="16" fontWeight="bold" fill={passed ? '#16a34a' : '#dc2626'}>
              {score}%
            </text>
          </svg>

          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold mb-1 ${passed ? 'text-green-700' : 'text-red-700'}`}>
              {passed ? '🎉 Passed!' : '❌ Not Passed'}
            </div>
            <div className="text-gray-500 text-sm sm:text-base">
              {correct} / {total} correct
            </div>
            <div className="text-xs text-gray-400 mt-1">Pass mark: {passMark}%</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6 sm:mb-8">
        <Link
          href={`/live-notes/k53/chapter/${chapterNum}/quiz`}
          className="flex-1 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-center text-sm hover:border-gray-400 transition-colors"
        >
          Retake Quiz
        </Link>
        {chapterNum < maxChapter ? (
          <Link
            href={`/live-notes/k53/chapter/${chapterNum + 1}`}
            className="flex-1 py-3 sm:py-3.5 rounded-xl bg-green-600 text-white font-bold text-center text-sm hover:bg-green-700 transition-colors"
          >
            Ch {chapterNum + 1} →
          </Link>
        ) : (
          <Link
            href="/live-notes/k53"
            className="flex-1 py-3 sm:py-3.5 rounded-xl bg-green-600 text-white font-bold text-center text-sm hover:bg-green-700 transition-colors"
          >
            All Chapters
          </Link>
        )}
      </div>

      {/* Review */}
      <h2 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">
        Review — {review.length} questions
      </h2>
      <div className="space-y-3 sm:space-y-4">
        {review.map((item, i) => (
          <div
            key={i}
            className={`rounded-xl border-2 p-3 sm:p-4 ${
              item.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start gap-2 mb-2 sm:mb-3">
              <span className={`flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${
                item.isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {item.isCorrect ? '✓' : '✗'}
              </span>
              <p className="font-semibold text-gray-900 text-sm leading-snug">
                {item.number}. {item.text}
              </p>
            </div>

            {item.imageUrl && (
              <div className="ml-7 mb-2 flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt="Road sign or signal referred to in this question"
                  className="h-20 object-contain"
                />
              </div>
            )}

            <div className="ml-7 space-y-1 text-xs sm:text-sm">
              {!item.isCorrect && (
                <div className="text-red-700">
                  <span className="font-semibold">Your answer ({item.selectedLabel}):</span> {item.selectedText}
                </div>
              )}
              <div className="text-green-700 font-semibold">
                ✓ Correct ({item.correctLabel}): {item.correctText}
              </div>
              <div className="text-gray-500 text-xs mt-1.5 italic leading-relaxed">
                {item.explanation}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/live-notes/k53" className="text-green-600 hover:underline text-sm font-medium">
          ← Back to all chapters
        </Link>
      </div>
    </main>
  )
}
