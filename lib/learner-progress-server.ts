import { RULES_CHAPTERS } from '@/lib/rules-of-the-road'
import { buildLearnerProgress, type LearnerProgress, type PracticeAttempt } from '@/lib/learner-progress'
import type { SupabaseClient } from '@supabase/supabase-js'

interface CourseRow { id: number; code: string; title: string }
interface LegacyAttemptRow {
  id: number; course_id: number; test_number: number; score: number
  total_questions: number; passed: boolean; completed_at: string | null
}
interface StudyAttemptRow { quiz_id: string; passed: boolean }
interface SectionRow {
  section: string; visit_count: number; completed_items: string[]; completed_at: string | null
}
interface ChapterProgressRow { chapter_id: string; marked_complete: boolean }

export async function loadLearnerProgress(supabase: SupabaseClient, userId: string): Promise<LearnerProgress> {
  const [
    coursesResult,
    attemptsResult,
    lnChaptersResult,
    lnProgressResult,
    lnQuizzesResult,
    kuQuizzesResult,
    lnAttemptsResult,
    kuAttemptsResult,
    sectionsResult,
  ] = await Promise.all([
    supabase.from('courses').select('id, code, title').not('code', 'is', null),
    supabase.from('quiz_attempts').select(
      'id, course_id, test_number, test_name, licence_code, score, total_questions, percentage, passed, result_passed, is_final, category_scores, completed_at',
    ).eq('user_id', userId).not('completed_at', 'is', null).order('completed_at', { ascending: false }),
    supabase.from('ln_chapters').select('id').eq('is_front_matter', false),
    supabase.from('ln_user_chapter_progress').select('chapter_id, marked_complete').eq('user_id', userId),
    supabase.from('ln_quizzes').select('id'),
    supabase.from('ku_quizzes').select('id'),
    supabase.from('ln_quiz_attempts').select('quiz_id, passed').eq('user_id', userId),
    supabase.from('ku_quiz_attempts').select('quiz_id, passed').eq('user_id', userId),
    supabase.from('learner_section_progress').select('section, visit_count, completed_items, completed_at').eq('user_id', userId),
  ])

  const courses = (coursesResult.data ?? []) as CourseRow[]
  let attempts = (attemptsResult.data ?? []) as PracticeAttempt[]

  // Keeps the account page usable during a rolling deploy before migration 18
  // reaches Supabase. New writes still require the migration.
  if (attemptsResult.error) {
    const legacy = await supabase.from('quiz_attempts')
      .select('id, course_id, test_number, score, total_questions, passed, completed_at')
      .eq('user_id', userId).not('completed_at', 'is', null).order('completed_at', { ascending: false })
    attempts = ((legacy.data ?? []) as LegacyAttemptRow[]).map(attempt => {
      const course = courses.find(item => item.id === attempt.course_id)
      return {
        ...attempt,
        test_name: `${course?.title ?? 'Practice Test'} — Test ${attempt.test_number}`,
        licence_code: course?.code ?? null,
        percentage: attempt.total_questions ? Math.round((attempt.score / attempt.total_questions) * 100) : 0,
        result_passed: attempt.passed,
        is_final: course?.code === 'final-k53',
        category_scores: {},
      }
    })
  }

  const lnAttempts = (lnAttemptsResult.data ?? []) as StudyAttemptRow[]
  const kuAttempts = (kuAttemptsResult.data ?? []) as StudyAttemptRow[]
  const allStudyAttempts = [...lnAttempts, ...kuAttempts]
  const uniqueAttempted = new Set(allStudyAttempts.map(attempt => attempt.quiz_id))
  const uniquePassed = new Set(allStudyAttempts.filter(attempt => attempt.passed).map(attempt => attempt.quiz_id))
  const sections = (sectionsResult.data ?? []) as SectionRow[]
  const liveNotesSection = sections.find(row => row.section === 'live_notes')
  const rulesSection = sections.find(row => row.section === 'road_rules')
  const completedRules = new Set<string>(rulesSection?.completed_items ?? []).size

  const courseIdsByCode = Object.fromEntries(
    courses.filter(course => ['code8', 'code10', 'code14'].includes(course.code))
      .map(course => [course.code, course.id]),
  )
  const finalCourse = courses.find(course => course.code === 'final-k53')
  const chapterProgress = (lnProgressResult.data ?? []) as ChapterProgressRow[]
  const liveNotesCompleted = chapterProgress.filter(row => row.marked_complete).length
  const liveNotesTotal = (lnChaptersResult.data ?? []).length

  return buildLearnerProgress({
    attempts,
    liveNotesVisited: (liveNotesSection?.visit_count ?? 0) > 0 || chapterProgress.length > 0,
    liveNotesCompleted,
    liveNotesTotal,
    k53QuizzesAttempted: uniqueAttempted.size,
    k53QuizzesPassed: uniquePassed.size,
    k53QuizzesTotal: (lnQuizzesResult.data ?? []).length + (kuQuizzesResult.data ?? []).length,
    roadRulesVisited: (rulesSection?.visit_count ?? 0) > 0,
    roadRulesCompleted: completedRules,
    roadRulesTotal: RULES_CHAPTERS.length,
    finalCourseId: finalCourse?.id ?? null,
    courseIdsByCode,
  })
}
