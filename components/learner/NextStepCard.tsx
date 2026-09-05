import Link from 'next/link'
import type { NextStep } from '@/lib/learner-progress'

export default function NextStepCard({ nextStep, attemptCount }: { nextStep: NextStep; attemptCount?: number }) {
  return (
    <section className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 sm:p-6 shadow-sm" aria-labelledby="next-step-title">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl text-white" aria-hidden="true">→</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Recommended next step</p>
          <h2 id="next-step-title" className="mt-1 text-lg font-extrabold text-gray-900">{nextStep.title}</h2>
          {attemptCount != null && nextStep.kind === 'practice' && (
            <p className="mt-1 text-xs font-semibold text-blue-700">This test: {attemptCount} attempt{attemptCount === 1 ? '' : 's'}</p>
          )}
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{nextStep.message}</p>
          {nextStep.secondaryMessage && (
            <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs leading-relaxed text-blue-800">
              {nextStep.secondaryMessage}
            </p>
          )}
          <Link href={nextStep.href} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-blue-800 sm:w-auto">
            {nextStep.buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}

