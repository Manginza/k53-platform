import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import QuizPlayer from '@/components/live-notes/QuizPlayer'

export const dynamic = 'force-dynamic'

interface Props {
  params: { chapter_number: string }
}

export default async function QuizPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login`)

  const chapterNum = parseInt(params.chapter_number, 10)
  if (isNaN(chapterNum)) notFound()

  // Fetch chapter
  const { data: chapter, error: chErr } = await supabase
    .from('ln_chapters')
    .select('id, chapter_number, title')
    .eq('chapter_number', chapterNum)
    .eq('is_front_matter', false)
    .single()

  if (chErr || !chapter) notFound()

  // Fetch quiz
  const { data: quiz, error: qzErr } = await supabase
    .from('ln_quizzes')
    .select('id, title, instructions, time_limit_seconds')
    .eq('chapter_id', chapter.id)
    .single()

  if (qzErr || !quiz) notFound()

  // Fetch questions (no is_correct — use safe view for options)
  const { data: questions } = await supabase
    .from('ln_questions')
    .select('id, question_number, question_text, question_type')
    .eq('quiz_id', quiz.id)
    .order('question_number')

  if (!questions || questions.length === 0) notFound()

  const questionIds = questions.map(q => q.id)

  // Fetch options WITHOUT is_correct via the public view
  const { data: options } = await supabase
    .from('ln_question_options_public')
    .select('id, question_id, option_label, option_text')
    .in('question_id', questionIds)
    .order('option_label')

  // Merge options into questions
  const questionsWithOptions = questions.map(q => ({
    ...q,
    options: (options ?? []).filter(o => o.question_id === q.id),
  }))

  return (
    <QuizPlayer
      quiz={quiz}
      questions={questionsWithOptions}
      chapterNumber={chapterNum}
    />
  )
}
