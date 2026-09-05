import NextStepCard from '@/components/learner/NextStepCard'
import { formatLicenceCode, type LearnerProgress, type ProgressStatus } from '@/lib/learner-progress'

const statusLabel = (status: ProgressStatus | 'passed' | 'failed') => ({
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
  passed: 'Passed',
  failed: 'Review and retry',
}[status])

const statusClass = (status: ProgressStatus | 'passed' | 'failed') =>
  status === 'completed' || status === 'passed'
    ? 'bg-green-100 text-green-700'
    : status === 'in_progress' || status === 'failed'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-gray-100 text-gray-500'

export default function LearnerProgressDashboard({ progress }: { progress: LearnerProgress }) {
  const checklist = [
    { label: 'Repeat practice completed', done: progress.tests.some(test => (test.attempts >= 3 && test.bestPercentage >= 75) || test.recentPasses >= 2) },
    { label: 'Final test attempted', done: progress.finalStatus !== 'not_started' },
    { label: 'Live Notes started', done: progress.liveNotesStatus !== 'not_started' },
    { label: 'K53 quizzes started', done: progress.k53QuizStatus !== 'not_started' },
    { label: 'Rules of the Road completed', done: progress.roadRulesStatus === 'completed' },
  ]

  return (
    <section className="space-y-5" aria-labelledby="learner-progress-heading">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Learner dashboard</p>
            <h2 id="learner-progress-heading" className="mt-1 text-xl font-extrabold text-gray-900">Your K53 progress</h2>
            <p className="mt-1 text-sm text-gray-500">Every completed activity helps shape your next recommendation.</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-3xl font-extrabold text-blue-700">{progress.progressPercentage}%</div>
            <div className="text-xs text-gray-400">course readiness</div>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={progress.progressPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress.progressPercentage}%` }} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {checklist.map(item => (
            <div key={item.label} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.done ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {item.done ? '✓' : '·'}
              </span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <NextStepCard nextStep={progress.nextStep} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatusCard label="Practice tests completed" value={`${progress.practiceAttemptsCompleted}`} detail={`${progress.tests.length} different test${progress.tests.length === 1 ? '' : 's'}`} status={progress.practiceAttemptsCompleted ? 'in_progress' : 'not_started'} />
        <StatusCard label="Final test" value={statusLabel(progress.finalStatus)} detail={progress.finalAttempt ? `${Math.round(progress.finalAttempt.percentage ?? 0)}% most recent` : 'Milestone not attempted'} status={progress.finalStatus} />
        <StatusCard label="Live Notes" value={statusLabel(progress.liveNotesStatus)} detail={`${progress.liveNotesCompleted}/${progress.liveNotesTotal} chapters marked read`} status={progress.liveNotesStatus} />
        <StatusCard label="K53 quizzes" value={statusLabel(progress.k53QuizStatus)} detail={`${progress.k53QuizzesPassed}/${progress.k53QuizzesTotal} quizzes passed`} status={progress.k53QuizStatus} />
        <StatusCard label="Rules of the Road" value={statusLabel(progress.roadRulesStatus)} detail={`${progress.roadRulesCompleted}/${progress.roadRulesTotal} chapter quizzes completed`} status={progress.roadRulesStatus} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-bold text-gray-900">Licence-code practice</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(['code8', 'code10', 'code14'] as const).map(code => (
            <div key={code} className="rounded-xl bg-gray-50 p-3 text-center">
              <div className="text-lg font-extrabold text-gray-900">{progress.codeAttempts[code]}</div>
              <div className="text-xs font-semibold text-gray-500">{formatLicenceCode(code)}</div>
              <div className="mt-0.5 text-[11px] text-gray-400">attempt{progress.codeAttempts[code] === 1 ? '' : 's'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-bold text-gray-900">Repeat attempts by test</h3>
        {progress.tests.length ? (
          <div className="mt-3 space-y-2">
            {progress.tests.map(test => (
              <div key={`${test.courseId}:${test.testNumber}`} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-800">{test.testName}</div>
                  <div className="text-xs text-gray-400">Best score {test.bestPercentage}%</div>
                </div>
                <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  {test.attempts} attempt{test.attempts === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        ) : <p className="mt-2 text-sm text-gray-500">Complete your first practice test to start this history.</p>}
      </div>
    </section>
  )
}

function StatusCard({ label, value, detail, status }: { label: string; value: string; detail: string; status: ProgressStatus | 'passed' | 'failed' }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="font-bold text-gray-900">{value}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(status)}`}>{statusLabel(status)}</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </div>
  )
}
