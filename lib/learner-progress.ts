export type LicenceCode = 'code8' | 'code10' | 'code14'
export type LearnerSection = 'live_notes' | 'road_rules'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface CategoryScore {
  correct: number
  total: number
  percentage: number
}

export interface PracticeAttempt {
  id: number
  course_id: number
  test_number: number
  test_name: string | null
  licence_code: string | null
  score: number
  total_questions: number
  percentage: number | null
  passed: boolean
  result_passed: boolean | null
  is_final: boolean
  category_scores: Record<string, CategoryScore> | null
  completed_at: string | null
}

export interface TestProgress {
  courseId: number
  testNumber: number
  testName: string
  licenceCode: string
  attempts: number
  bestPercentage: number
  recentPasses: number
  lastCompletedAt: string | null
}

export interface NextStep {
  kind: 'practice' | 'final_test' | 'live_notes' | 'k53_quizzes' | 'road_rules' | 'revision'
  title: string
  message: string
  buttonLabel: string
  href: string
  secondaryMessage?: string
}

export interface LearnerProgress {
  practiceAttempts: PracticeAttempt[]
  tests: TestProgress[]
  practiceAttemptsCompleted: number
  codeAttempts: Record<LicenceCode, number>
  mainLicenceCode: LicenceCode | null
  finalStatus: ProgressStatus | 'passed' | 'failed'
  finalAttempt: PracticeAttempt | null
  liveNotesStatus: ProgressStatus
  liveNotesCompleted: number
  liveNotesTotal: number
  k53QuizStatus: ProgressStatus
  k53QuizzesAttempted: number
  k53QuizzesPassed: number
  k53QuizzesTotal: number
  roadRulesStatus: ProgressStatus
  roadRulesCompleted: number
  roadRulesTotal: number
  progressPercentage: number
  nextStep: NextStep
}

export interface ProgressSource {
  attempts: PracticeAttempt[]
  liveNotesVisited: boolean
  liveNotesCompleted: number
  liveNotesTotal: number
  k53QuizzesAttempted: number
  k53QuizzesPassed: number
  k53QuizzesTotal: number
  roadRulesVisited: boolean
  roadRulesCompleted: number
  roadRulesTotal: number
  finalCourseId: number | null
  courseIdsByCode: Partial<Record<LicenceCode, number>>
}

const pct = (attempt: PracticeAttempt) =>
  attempt.percentage ?? (attempt.total_questions ? Math.round((attempt.score / attempt.total_questions) * 100) : 0)

const didPass = (attempt: PracticeAttempt) => attempt.result_passed ?? attempt.passed

export function buildLearnerProgress(source: ProgressSource): LearnerProgress {
  const sorted = [...source.attempts].sort((a, b) =>
    new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime(),
  )
  const practice = sorted.filter(attempt => !attempt.is_final && attempt.licence_code !== 'final-k53')
  const finals = sorted.filter(attempt => attempt.is_final || attempt.licence_code === 'final-k53')

  const grouped = new Map<string, PracticeAttempt[]>()
  for (const attempt of practice) {
    const key = `${attempt.course_id}:${attempt.test_number}`
    grouped.set(key, [...(grouped.get(key) ?? []), attempt])
  }
  const tests: TestProgress[] = Array.from(grouped.values()).map(attempts => {
    const latest = attempts[0]
    return {
      courseId: latest.course_id,
      testNumber: latest.test_number,
      testName: latest.test_name ?? `Test ${latest.test_number}`,
      licenceCode: latest.licence_code ?? 'practice',
      attempts: attempts.length,
      bestPercentage: Math.max(...attempts.map(pct)),
      recentPasses: attempts.slice(0, 3).filter(didPass).length,
      lastCompletedAt: latest.completed_at,
    }
  }).sort((a, b) => new Date(b.lastCompletedAt ?? 0).getTime() - new Date(a.lastCompletedAt ?? 0).getTime())

  const codeAttempts: Record<LicenceCode, number> = { code8: 0, code10: 0, code14: 0 }
  for (const attempt of practice) {
    if (attempt.licence_code === 'code8' || attempt.licence_code === 'code10' || attempt.licence_code === 'code14') {
      codeAttempts[attempt.licence_code] += 1
    }
  }
  const mainLicenceCode = (Object.entries(codeAttempts) as [LicenceCode, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const finalAttempt = finals[0] ?? null
  const finalStatus = !finalAttempt ? 'not_started' : didPass(finalAttempt) ? 'passed' : 'failed'
  const liveNotesStatus: ProgressStatus = source.liveNotesCompleted >= source.liveNotesTotal && source.liveNotesTotal > 0
    ? 'completed' : source.liveNotesVisited || source.liveNotesCompleted > 0 ? 'in_progress' : 'not_started'
  const k53QuizStatus: ProgressStatus = source.k53QuizzesPassed >= source.k53QuizzesTotal && source.k53QuizzesTotal > 0
    ? 'completed' : source.k53QuizzesAttempted > 0 ? 'in_progress' : 'not_started'
  const roadRulesStatus: ProgressStatus = source.roadRulesCompleted >= source.roadRulesTotal && source.roadRulesTotal > 0
    ? 'completed' : source.roadRulesVisited || source.roadRulesCompleted > 0 ? 'in_progress' : 'not_started'

  const practiceReady = tests.some(test => (test.attempts >= 3 && test.bestPercentage >= 75) || test.recentPasses >= 2)
  const milestones = [practiceReady, !!finalAttempt, liveNotesStatus !== 'not_started', k53QuizStatus !== 'not_started', roadRulesStatus === 'completed']
  const progressPercentage = Math.round((milestones.filter(Boolean).length / milestones.length) * 100)

  let nextStep: NextStep
  if (finalAttempt) {
    const weak = weakestCategory(finalAttempt)
    if (liveNotesStatus === 'not_started') {
      nextStep = {
        kind: 'live_notes',
        title: didPass(finalAttempt) ? 'Excellent work — keep building your knowledge' : 'Your next step: review and rebuild',
        message: didPass(finalAttempt)
          ? 'You passed the final test. Continue with the Live Notes so every major study area is covered.'
          : `The final test is useful feedback, not a setback. ${weak ? `Your lowest area was ${weak}. ` : ''}Study the Live Notes, review your incorrect answers, and retry the final test when you feel ready.`,
        buttonLabel: 'Study Live Notes',
        href: '/live-notes',
      }
    } else if (k53QuizStatus === 'not_started') {
      nextStep = {
        kind: 'k53_quizzes',
        title: 'Turn your study into recall',
        message: 'You have started the Live Notes. Use the related K53 quizzes to check what you can remember and identify topics to revisit.',
        buttonLabel: 'Take K53 Quizzes',
        href: '/live-notes/k53',
      }
    } else if (roadRulesStatus !== 'completed') {
      nextStep = {
        kind: 'road_rules',
        title: 'Complete your full revision',
        message: 'Good progress. Work through Rules of the Road next and complete each chapter quiz as part of your final preparation.',
        buttonLabel: 'Study Rules of the Road',
        href: '/live-notes/rules',
      }
    } else {
      const weakest = weakestAcrossAttempts(sorted)
      nextStep = {
        kind: 'revision',
        title: 'You are ready for final revision',
        message: `You have covered every major section. Before booking or writing the official test, repeat ${weakest ? `your weakest area (${weakest}) and ` : ''}any practice tests below 80%.`,
        buttonLabel: 'Review Practice Tests',
        href: '/courses',
      }
    }
  } else if (practiceReady && source.finalCourseId) {
    nextStep = {
      kind: 'final_test',
      title: 'You are ready for the final-test milestone',
      message: 'You have completed enough repeat practice to check your overall readiness. Take the final test and use the result to guide your next revision.',
      buttonLabel: 'Take the Final Test',
      href: `/quiz/${source.finalCourseId}?test=1`,
      secondaryMessage: crossCodeMessage(mainLicenceCode, codeAttempts, !!source.courseIdsByCode.code14),
    }
  } else if (tests.length > 0) {
    const latest = tests[0]
    const remaining = Math.max(0, 3 - latest.attempts)
    const lowAfterRepeats = latest.attempts >= 3 && latest.bestPercentage < 75
    nextStep = {
      kind: 'practice',
      title: lowAfterRepeats ? 'Review, then try this test again' : 'Your next step',
      message: lowAfterRepeats
        ? `You have completed ${latest.testName} ${latest.attempts} times. Review your incorrect answers and study the related material before another calm attempt.`
        : `You have completed this test ${Math.min(latest.attempts, 3)} of 3 times. We recommend writing the same test at least three times. Review your incorrect answers, then try again to strengthen your confidence.${remaining === 0 ? ' You are building strong consistency.' : ''}`,
      buttonLabel: lowAfterRepeats ? 'Review and Retry Test' : latest.attempts === 2 ? 'Complete Third Attempt' : 'Repeat This Test',
      href: `/quiz/${latest.courseId}?test=${latest.testNumber}`,
      secondaryMessage: latest.attempts >= 3 ? crossCodeMessage(mainLicenceCode, codeAttempts, !!source.courseIdsByCode.code14) : undefined,
    }
  } else {
    const code = mainLicenceCode ?? 'code8'
    const courseId = source.courseIdsByCode[code]
    nextStep = {
      kind: 'practice',
      title: 'Start with a practice test',
      message: 'Complete a practice test to establish your starting point. We will use your result to recommend the most useful next step.',
      buttonLabel: 'Start Practising',
      href: courseId ? `/courses/${courseId}` : '/courses',
    }
  }

  return {
    practiceAttempts: practice,
    tests,
    practiceAttemptsCompleted: practice.length,
    codeAttempts,
    mainLicenceCode,
    finalStatus,
    finalAttempt,
    liveNotesStatus,
    liveNotesCompleted: source.liveNotesCompleted,
    liveNotesTotal: source.liveNotesTotal,
    k53QuizStatus,
    k53QuizzesAttempted: source.k53QuizzesAttempted,
    k53QuizzesPassed: source.k53QuizzesPassed,
    k53QuizzesTotal: source.k53QuizzesTotal,
    roadRulesStatus,
    roadRulesCompleted: source.roadRulesCompleted,
    roadRulesTotal: source.roadRulesTotal,
    progressPercentage,
    nextStep,
  }
}

function crossCodeMessage(main: LicenceCode | null, counts: Record<LicenceCode, number>, hasCode14: boolean): string | undefined {
  const advanced = hasCode14 && counts.code14 === 0
    ? ' Code 14 is also available as optional advanced practice; keep your selected code as your main path.'
    : ''
  if (main === 'code8' && counts.code10 === 0) {
    return `Extra preparation: try a Code 10 practice test too. Road-sign and rules-of-the-road knowledge overlaps, while some vehicle-control questions differ.${advanced}`
  }
  if (main === 'code10' && counts.code8 === 0) {
    return `Extra preparation: try a Code 8 practice test too. Road-sign and rules-of-the-road knowledge overlaps, while some vehicle-control questions differ.${advanced}`
  }
  return advanced.trim() || undefined
}

function weakestCategory(attempt: PracticeAttempt): string | null {
  const entries = Object.entries(attempt.category_scores ?? {}).filter(([, score]) => score.total > 0)
  return entries.sort((a, b) => a[1].percentage - b[1].percentage)[0]?.[0] ?? null
}

function weakestAcrossAttempts(attempts: PracticeAttempt[]): string | null {
  const combined = new Map<string, { correct: number; total: number }>()
  for (const attempt of attempts) {
    for (const [name, score] of Object.entries(attempt.category_scores ?? {})) {
      const current = combined.get(name) ?? { correct: 0, total: 0 }
      combined.set(name, { correct: current.correct + score.correct, total: current.total + score.total })
    }
  }
  return Array.from(combined.entries()).filter(([, score]) => score.total > 0)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0]?.[0] ?? null
}

export const formatLicenceCode = (code: string) => code.replace('code', 'Code ')
