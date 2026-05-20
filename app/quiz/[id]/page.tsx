import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import QuizClient from '@/components/QuizClient'
import type { Course, QuizQuestion } from '@/lib/types'

export const revalidate = 86400

interface Props {
  params:      { id: string }
  searchParams: { test?: string }
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('courses')
    .select('id')
    .not('code', 'is', null)

  return (data ?? []).map(c => ({ id: String(c.id) }))
}

export default async function QuizPage({ params, searchParams }: Props) {
  const testNumber = Number(searchParams.test ?? 1)

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (courseError || !course) notFound()

  const { data: questions, error: qError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('course_id', params.id)
    .eq('test_number', testNumber)
    .order('id')

  if (qError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-500 text-center">Failed to load questions: {qError.message}</p>
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No questions found for this test.</p>
          <a href={`/courses/${params.id}`} className="text-blue-600 hover:underline">← Back to Course</a>
        </div>
      </div>
    )
  }

  const c = course as Course

  return (
    <QuizClient
      questions={questions as QuizQuestion[]}
      courseTitle={c.title}
      courseId={c.id}
      testNumber={testNumber}
    />
  )
}
