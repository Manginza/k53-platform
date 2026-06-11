import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import QuizPlayer from '@/components/live-notes/QuizPlayer'

export const dynamic = 'force-dynamic'

interface Props {
  params: { chapter_number: string }
}

export default async function K53QuizPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login`)

  const chapterNum = parseInt(params.chapter_number, 10)
  if (isNaN(chapterNum)) notFound()

  const { data: chapter, error: chErr } = await supabase
    .from('ku_chapters')
    .select('id, chapter_number, title')
    .eq('chapter_number', chapterNum)
    .eq('is_front_matter', false)
    .single()

  if (chErr || !chapter) notFound()

  const { data: quiz, error: qzErr } = await supabase
    .from('ku_quizzes')
    .select('id, title, instructions, time_limit_seconds')
    .eq('chapter_id', chapter.id)
    .single()

  if (qzErr || !quiz) notFound()

  // image_url requires migration 16; fall back to a select without it so the
  // quiz keeps working if the column hasn't been added yet.
  type QuestionRow = {
    id: string; question_number: number; question_text: string
    question_type: string; image_url?: string | null
  }
  let questions = (await supabase
    .from('ku_questions')
    .select('id, question_number, question_text, question_type, image_url')
    .eq('quiz_id', quiz.id)
    .order('question_number')).data as QuestionRow[] | null

  if (!questions) {
    questions = (await supabase
      .from('ku_questions')
      .select('id, question_number, question_text, question_type')
      .eq('quiz_id', quiz.id)
      .order('question_number')).data as QuestionRow[] | null
  }

  if (!questions || questions.length === 0) notFound()

  const questionIds = questions.map(q => q.id)

  const { data: options } = await supabase
    .from('ku_question_options_public')
    .select('id, question_id, option_label, option_text')
    .in('question_id', questionIds)
    .order('option_label')

  // Question pictures: prefer the image_url column (migration 16). If it isn't
  // populated, fall back to the seed-written map stored alongside the images.
  const IMG_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resources/K53%20Unpacked/signs/`
  let imageMap: Record<string, string> = {}
  if (!questions.some(q => q.image_url)) {
    try {
      const res = await fetch(IMG_BASE + 'question-images.json', { cache: 'no-store' })
      if (res.ok) imageMap = await res.json()
    } catch {}
  }

  const questionsWithOptions = questions.map(q => {
    const mapped = imageMap[`${chapterNum}:${q.question_number}`]
    return {
      ...q,
      image_url: q.image_url ?? (mapped ? IMG_BASE + mapped : null),
      options: (options ?? []).filter(o => o.question_id === q.id),
    }
  })

  return (
    <QuizPlayer
      quiz={quiz}
      questions={questionsWithOptions}
      chapterNumber={chapterNum}
      basePath="/live-notes/k53"
      submitRpc="ku_submit_quiz"
    />
  )
}
