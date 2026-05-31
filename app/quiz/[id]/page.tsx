import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'
import { getUserSubscription, isPremium } from '@/lib/subscription'
import QuizClient from '@/components/QuizClient'
import type { Course, QuizQuestion } from '@/lib/types'

// Per-user paywall state (reads auth cookies) — must render dynamically.
export const dynamic = 'force-dynamic'

interface Props {
  params:      { id: string }
  searchParams: { test?: string }
}

export default async function QuizPage({ params, searchParams }: Props) {
  const testNumber = Number(searchParams.test ?? 1)

  // Paywall state: premium users skip the timer; everyone else gets 3 free minutes.
  const ssr = createClient()
  const { data: { user } } = await ssr.auth.getUser()
  const sub = await getUserSubscription()
  const premium = isPremium(sub.status)

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
      isPremium={premium}
      isLoggedIn={!!user}
    />
  )
}
