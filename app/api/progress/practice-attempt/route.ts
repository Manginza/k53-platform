import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { loadLearnerProgress } from '@/lib/learner-progress-server'
import type { CategoryScore } from '@/lib/learner-progress'

type Option = 'A' | 'B' | 'C'

interface CompletionBody {
  courseId: number
  testNumber: number
  submissionKey: string
  answers: Record<string, Option>
  questionIds: number[]
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function categoryFor(question: { question: string; image_url: string | null; image_ref: string | null }) {
  const text = `${question.question} ${question.image_ref ?? ''}`.toLowerCase()
  if (text.includes('control') || text.includes('clutch') || text.includes('brake') || text.includes('motorcycle')) {
    return 'Vehicle Controls'
  }
  return question.image_url ? 'Road Signs & Markings' : 'Rules of the Road'
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Log in to save progress across devices.' }, { status: 401 })

  let body: CompletionBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid completion data.' }, { status: 400 })
  }

  const { courseId, testNumber, submissionKey, answers, questionIds } = body
  if (!Number.isInteger(courseId) || !Number.isInteger(testNumber) || !UUID_RE.test(submissionKey)
      || !answers || !Array.isArray(questionIds) || questionIds.length === 0) {
    return NextResponse.json({ error: 'Incomplete test result.' }, { status: 400 })
  }

  const uniqueQuestionIds = Array.from(new Set(questionIds.filter(Number.isInteger)))
  const [{ data: course }, { data: questions, error: questionsError }] = await Promise.all([
    supabase.from('courses').select('id, title, code').eq('id', courseId).maybeSingle(),
    supabase.from('quiz_questions').select('id, question, correct_answer, image_url, image_ref')
      .eq('course_id', courseId).eq('test_number', testNumber).in('id', uniqueQuestionIds),
  ])
  if (!course || questionsError || !questions || questions.length !== uniqueQuestionIds.length) {
    return NextResponse.json({ error: 'This test result could not be verified.' }, { status: 400 })
  }

  const score = questions.filter(question => answers[String(question.id)] === question.correct_answer).length
  const total = questions.length
  const percentage = total ? Math.round((score / total) * 10000) / 100 : 0
  const categories: Record<string, CategoryScore> = {}
  for (const question of questions) {
    const category = categoryFor(question)
    const current = categories[category] ?? { correct: 0, total: 0, percentage: 0 }
    current.total += 1
    if (answers[String(question.id)] === question.correct_answer) current.correct += 1
    current.percentage = Math.round((current.correct / current.total) * 100)
    categories[category] = current
  }

  const isSplit = testNumber === 2 && ['code8', 'code10'].includes(course.code)
  const resultPassed = isSplit
    ? (categories['Rules of the Road']?.correct ?? 0) >= 22
      && Object.entries(categories).filter(([name]) => name !== 'Rules of the Road')
        .reduce((sum, [, value]) => sum + value.correct, 0) >= 22
    : percentage >= 75
  const isFinal = course.code === 'final-k53'

  let { data: attempt } = await supabase.from('quiz_attempts')
    .select('id').eq('user_id', user.id).eq('submission_key', submissionKey).maybeSingle()

  if (!attempt) {
    const inserted = await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      course_id: courseId,
      test_number: testNumber,
      submission_key: submissionKey,
      test_name: `${course.title} — Test ${testNumber}`,
      licence_code: course.code,
      score,
      total_questions: total,
      percentage,
      result_passed: resultPassed,
      is_final: isFinal,
      category_scores: categories,
      completed_at: new Date().toISOString(),
    }).select('id').maybeSingle()

    if (inserted.error) {
      // A simultaneous duplicate request can win the unique-key race.
      const existing = await supabase.from('quiz_attempts')
        .select('id').eq('user_id', user.id).eq('submission_key', submissionKey).maybeSingle()
      attempt = existing.data
      if (!attempt) {
        console.error('[progress/practice-attempt] insert failed:', inserted.error.message)
        return NextResponse.json({ error: 'Progress storage is not ready. Apply migration 18 and try again.' }, { status: 503 })
      }
    } else {
      attempt = inserted.data
    }
  }

  if (!attempt) return NextResponse.json({ error: 'Unable to save this attempt.' }, { status: 500 })

  const answerRows = questions.map(question => ({
    attempt_id: attempt.id,
    question_id: question.id,
    selected_answer: answers[String(question.id)] ?? null,
    is_correct: answers[String(question.id)] === question.correct_answer,
  }))
  const { error: answersError } = await supabase.from('user_answers')
    .upsert(answerRows, { onConflict: 'attempt_id,question_id', ignoreDuplicates: true })
  if (answersError) console.error('[progress/practice-attempt] answer detail save failed:', answersError.message)

  const progress = await loadLearnerProgress(supabase, user.id)
  const currentAttempts = progress.tests.find(test => test.courseId === courseId && test.testNumber === testNumber)?.attempts
    ?? (isFinal ? progress.practiceAttempts.filter(item => item.course_id === courseId).length : 1)

  return NextResponse.json({
    saved: true,
    attemptId: attempt.id,
    attemptCount: currentAttempts,
    score,
    total,
    percentage,
    passed: resultPassed,
    nextStep: progress.nextStep,
  })
}
