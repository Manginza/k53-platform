/**
 * /live-notes/rules/[slug] — a Rules of the Road chapter: study content
 * followed by an end-of-chapter quiz. Full-access only.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hasFullAccess } from '@/lib/access'
import LockedContent from '@/components/LockedContent'
import RulesChapterQuiz from '@/components/live-notes/RulesChapterQuiz'
import { RULES_CHAPTERS, getRuleChapter } from '@/lib/rules-of-the-road'
import ProgressVisit from '@/components/ProgressVisit'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const RULES_DESC = "Study the full Rules of the Road — every chapter with an end-of-chapter learner's-exam quiz — with full access."

export function generateStaticParams() {
  return RULES_CHAPTERS.map(c => ({ slug: c.slug }))
}

interface Props {
  params: { slug: string }
}

export default async function RulesChapterPage({ params }: Props) {
  const chapter = getRuleChapter(params.slug)
  if (!chapter) notFound()

  if (!(await hasFullAccess())) {
    return <LockedContent feature="Rules of the Road" description={RULES_DESC} />
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const idx  = RULES_CHAPTERS.findIndex(c => c.slug === chapter.slug)
  const prev = idx > 0 ? RULES_CHAPTERS[idx - 1] : null
  const next = idx < RULES_CHAPTERS.length - 1 ? RULES_CHAPTERS[idx + 1] : null

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {user && <ProgressVisit section="road_rules" />}
      <Link href="/live-notes/rules" className="text-green-700 hover:underline text-sm font-medium mb-6 inline-block">
        ← All Rules of the Road chapters
      </Link>

      <div className="mb-6">
        <span className="text-xs font-bold text-green-600 uppercase tracking-widest">
          Rules of the Road · Chapter {chapter.order}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 mb-2">{chapter.title}</h1>
        <p className="text-gray-500 text-sm sm:text-base">{chapter.summary}</p>
      </div>

      {/* Study content */}
      <article className="space-y-6">
        {chapter.sections.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <h2 className="font-bold text-gray-900 mb-3">{s.heading}</h2>
            <ul className="space-y-2">
              {s.points.map((p, j) => (
                <li key={j} className="flex gap-2.5 text-sm text-gray-700 leading-relaxed">
                  <span className="text-green-500 mt-1 shrink-0">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </article>

      {/* End-of-chapter quiz */}
      <RulesChapterQuiz questions={chapter.quiz} chapterSlug={chapter.slug} />

      {/* Prev / next */}
      <div className="flex items-center justify-between gap-3 mt-10 pt-6 border-t border-gray-200">
        {prev ? (
          <Link href={`/live-notes/rules/${prev.slug}`} className="flex-1 text-left text-sm text-gray-600 hover:text-green-700">
            ← {prev.title}
          </Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link href={`/live-notes/rules/${next.slug}`} className="flex-1 text-right text-sm font-semibold text-green-700 hover:underline">
            {next.title} →
          </Link>
        ) : (
          <Link href="/live-notes/rules" className="flex-1 text-right text-sm font-semibold text-green-700 hover:underline">
            Finish →
          </Link>
        )}
      </div>
    </main>
  )
}
