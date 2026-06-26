import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import LockedContent from '@/components/LockedContent'
import ContentPreviewGate from '@/components/ContentPreviewGate'
import { readContentTiming } from '@/lib/content-session'

const LIVE_NOTES_DESC = 'Read the full Road Traffic Signs Manual — all 18 chapters with chapter quizzes — with full access.'

export const metadata: Metadata = {
  title: "K53 Study Notes — Road Signs Manual & Rules of the Road",
  description: "Study the full South African K53 Road Traffic Signs Manual and Rules of the Road chapter by chapter. 18 chapters, 56 pages, with a quiz after each chapter to test your knowledge.",
  keywords: [
    "K53 road signs manual", "learners licence study notes", "K53 study guide South Africa",
    "road traffic signs South Africa", "learners licence road signs", "K53 rules of the road",
    "South African road signs", "K53 learner driver manual", "learners licence chapters",
    "K53 chapter quiz",
  ],
  alternates: { canonical: 'https://www.skdriving.co.za/live-notes' },
  openGraph: {
    title: "K53 Study Notes — Road Signs Manual & Rules of the Road | SK Driving",
    description: "Study the full South African K53 manual chapter by chapter. Road signs, rules of the road — with a quiz after each chapter.",
    url: 'https://www.skdriving.co.za/live-notes',
  },
}

export const dynamic = 'force-dynamic'

export default async function LiveNotesPage() {
  const timing = await readContentTiming()
  // Free preview expired → paywall. During the 3-min preview, free users see the content.
  if (!timing.premium && timing.locked) {
    return <LockedContent feature="Live Notes" description={LIVE_NOTES_DESC} />
  }

  const supabase = createClient()
  // Progress/attempts are per logged-in user (admins). Code-based members
  // have no account, so those simply come back empty (read-only).
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: chapters }, { data: quizzes }] = await Promise.all([
    supabase.from('ln_chapters').select('*').eq('is_front_matter', false).order('display_order'),
    supabase.from('ln_quizzes').select('id, chapter_id'),
  ])

  const progressData = user
    ? (await supabase.from('ln_user_chapter_progress').select('chapter_id, marked_complete, pages_read').eq('user_id', user.id)).data
    : []
  const attempts = user
    ? (await supabase.from('ln_quiz_attempts').select('quiz_id, score_percent, passed').eq('user_id', user.id).order('completed_at', { ascending: false })).data
    : []

  const chapterList = (chapters ?? []).map(ch => {
    const progress    = progressData?.find(p => p.chapter_id === ch.id) ?? null
    const quiz        = quizzes?.find(q => q.chapter_id === ch.id) ?? null
    const quizAttempts = quiz ? (attempts?.filter(a => a.quiz_id === quiz.id) ?? []) : []
    const bestScore   = quizAttempts.length ? Math.max(...quizAttempts.map(a => Number(a.score_percent))) : null
    const passed      = quizAttempts.some(a => a.passed)
    return { ...ch, progress, quiz, bestScore, passed }
  })

  const totalChapters = chapterList.length
  const readCount     = chapterList.filter(c => c.progress?.marked_complete).length
  const passedCount   = chapterList.filter(c => c.passed).length

  const body = (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Live Notes</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 mb-2">
          Road Traffic Signs Manual
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          SA Learner Driver Manual — Dept. of Transport, June 2012 · 18 chapters · 56 study pages
        </p>
      </div>

      {/* Rules of the Road callout */}
      <Link
        href="/live-notes/rules"
        className="flex items-center justify-between gap-4 bg-green-600 text-white rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4 hover:bg-green-700 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl shrink-0">📜</span>
          <div className="min-w-0">
            <div className="font-bold leading-snug">Rules of the Road</div>
            <div className="text-green-100 text-sm">8 chapters · exam-style quiz at the end of each</div>
          </div>
        </div>
        <span className="bg-white/20 rounded-full px-4 py-2 text-sm font-semibold shrink-0">Study →</span>
      </Link>

      {/* K53 Unpacked callout */}
      <Link
        href="/live-notes/k53"
        className="flex items-center justify-between gap-4 bg-gray-900 text-white rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 hover:bg-black transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl shrink-0">🚗</span>
          <div className="min-w-0">
            <div className="font-bold leading-snug">K53 Unpacked</div>
            <div className="text-gray-300 text-sm">Full Learner&apos;s &amp; K53 driving manual · quiz after every chapter</div>
          </div>
        </div>
        <span className="bg-white/20 rounded-full px-4 py-2 text-sm font-semibold shrink-0">Study →</span>
      </Link>

      {/* Progress card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-6 sm:mb-8">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="font-semibold text-gray-700">Your Progress</span>
          <span className="text-gray-400">{passedCount}/{totalChapters} quizzes passed</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all"
            style={{ width: `${totalChapters ? (passedCount / totalChapters) * 100 : 0}%` }}
          />
        </div>
        <div className="flex gap-4 sm:gap-6 text-sm text-gray-500 flex-wrap">
          <span>📖 <strong className="text-gray-900">{readCount}</strong> read</span>
          <span>✅ <strong className="text-gray-900">{passedCount}</strong> passed</span>
          <span>📚 <strong className="text-gray-900">{totalChapters - readCount}</strong> remaining</span>
        </div>
      </div>

      {/* Chapter list — single col on mobile, 2-col on large desktop */}
      <div className="grid gap-2 sm:gap-3 lg:grid-cols-2">
        {chapterList.map(ch => {
          const isRead   = ch.progress?.marked_complete ?? false
          const isPassed = ch.passed
          const hasScore = ch.bestScore !== null

          let statusEl: React.ReactNode
          if (isPassed)        statusEl = <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">✓ Passed</span>
          else if (hasScore)   statusEl = <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Retry</span>
          else if (isRead)     statusEl = <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Read ✓</span>
          else if (ch.progress) statusEl = <span className="text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Started</span>
          else                  statusEl = <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">Not started</span>

          return (
            <Link
              key={ch.id}
              href={`/live-notes/chapter/${ch.chapter_number}`}
              className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              {/* Left: number + text */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                  isPassed ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-700'
                }`}>
                  {ch.chapter_number}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 group-hover:text-green-800 text-sm leading-snug line-clamp-2 sm:line-clamp-1">
                    {ch.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                    Pages {ch.page_start}–{ch.page_end}
                    {ch.section_reference ? ` · ${ch.section_reference}` : ''}
                  </div>
                </div>
              </div>

              {/* Right: score + status + arrow */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {hasScore && (
                  <span className={`text-xs font-bold hidden sm:block ${isPassed ? 'text-green-700' : 'text-yellow-700'}`}>
                    {Math.round(ch.bestScore!)}%
                  </span>
                )}
                <div className="hidden xs:block sm:block">{statusEl}</div>
                <span className="text-gray-300 group-hover:text-green-600 text-lg font-light">›</span>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )

  if (timing.premium) return body
  return (
    <ContentPreviewGate initialSeconds={timing.remaining} feature="Live Notes" description={LIVE_NOTES_DESC}>
      {body}
    </ContentPreviewGate>
  )
}
