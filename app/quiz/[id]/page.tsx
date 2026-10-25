import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { hasFullAccess } from '@/lib/access'
import { readQuizTiming } from '@/lib/quiz-session'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getClientIp, getTrialState, getTrialSummary, isTrialCourse, isTrialTest } from '@/lib/trial'
import { TrialBlockedScreen, TrialUsedScreen } from '@/components/trial/TrialScreens'
import QuizClient from '@/components/QuizClient'
import QuizPaywall from '@/components/QuizPaywall'
import type { Course, QuizQuestion } from '@/lib/types'

// Per-visitor paywall state (reads cookies) — must render dynamically.
export const dynamic = 'force-dynamic'

interface Props {
  params:      { id: string }
  searchParams: { test?: string }
}

export default async function QuizPage({ params, searchParams }: Props) {
  const testNumber = Number(searchParams.test ?? 1)

  // Full-access visitors skip the timer; everyone else gets a 2-minute sample.
  const premium = await hasFullAccess()

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

  // Server-side free-preview enforcement: if a non-premium visitor's window
  // has already expired, render the paywall here — a reload or a tampered
  // client timer can't get past this.
  let initialSeconds: number | undefined
  // Each Once: a registered learner without paid access takes each Code 8 /
  // Code 10 test once, full length, instead of the 2-minute sample.
  let trialSeconds: number | undefined
  const trialCourse = isTrialCourse(c.code)
  if (!premium) {
    const user = isTrialTest(c.code, testNumber) ? (await createClient().auth.getUser()).data.user : null
    if (user) {
      const admin = createAdminClient()
      const state = await getTrialState(admin, user.id, c.id, testNumber, questions.length, getClientIp(headers()))
      if (state.status === 'used') {
        return <TrialUsedScreen summary={await getTrialSummary(admin, user.id, c.id)} testNumber={testNumber} />
      }
      if (state.status === 'blocked_ip') return <TrialBlockedScreen courseId={c.id} />
      trialSeconds = state.seconds
    } else {
      const timing = await readQuizTiming(c.id, testNumber)
      if (timing.locked) {
        return <QuizPaywall courseId={c.id} trialCta={trialCourse} />
      }
      initialSeconds = timing.remaining
    }
  }

  return (
    <QuizClient
      questions={questions as QuizQuestion[]}
      courseTitle={c.title}
      courseId={c.id}
      testNumber={testNumber}
      isPremium={premium}
      initialSeconds={initialSeconds}
      trialSeconds={trialSeconds}
      trialCta={trialCourse}
      splitScoring={testNumber === 2 && ['code8', 'code10'].includes(c.code)}
    />
  )
}
