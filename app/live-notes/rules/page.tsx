/**
 * /live-notes/rules — index of Rules of the Road chapters. Full-access only.
 */
import Link from 'next/link'
import { hasFullAccess } from '@/lib/access'
import LockedContent from '@/components/LockedContent'
import { RULES_CHAPTERS } from '@/lib/rules-of-the-road'

export const dynamic = 'force-dynamic'

export default async function RulesIndexPage() {
  if (!(await hasFullAccess())) {
    return (
      <LockedContent
        feature="Rules of the Road"
        description="Study the full Rules of the Road — every chapter with an end-of-chapter learner's-exam quiz — with full access."
      />
    )
  }

  const totalQuestions = RULES_CHAPTERS.reduce((n, c) => n + c.quiz.length, 0)

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <Link href="/live-notes" className="text-green-700 hover:underline text-sm font-medium mb-6 inline-block">
        ← Back to Live Notes
      </Link>

      <div className="mb-6 sm:mb-8">
        <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Live Notes</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 mb-2">Rules of the Road</h1>
        <p className="text-sm sm:text-base text-gray-500">
          SA Learner Driver Manual — Rules of the Road · {RULES_CHAPTERS.length} chapters · {totalQuestions} exam-style questions.
          Each chapter ends with a quiz.
        </p>
      </div>

      <div className="grid gap-2 sm:gap-3 lg:grid-cols-2">
        {RULES_CHAPTERS.map(ch => (
          <Link
            key={ch.slug}
            href={`/live-notes/rules/${ch.slug}`}
            className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-700">
                {ch.order}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-green-800 text-sm leading-snug">{ch.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{ch.quiz.length} quiz questions</div>
              </div>
            </div>
            <span className="text-gray-300 group-hover:text-green-600 text-lg font-light">›</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
