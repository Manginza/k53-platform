import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function LiveNotesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: chapters }, { data: quizzes }, { data: progressData }, { data: attempts }] = await Promise.all([
    supabase.from('ln_chapters').select('*').eq('is_front_matter', false).order('display_order'),
    supabase.from('ln_quizzes').select('id, chapter_id'),
    supabase.from('ln_user_chapter_progress').select('chapter_id, marked_complete, pages_read').eq('user_id', user.id),
    supabase.from('ln_quiz_attempts').select('quiz_id, score_percent, passed').eq('user_id', user.id).order('completed_at', { ascending: false }),
  ])

  const chapterList = (chapters ?? []).map(ch => {
    const progress = progressData?.find(p => p.chapter_id === ch.id) ?? null
    const quiz = quizzes?.find(q => q.chapter_id === ch.id) ?? null
    const quizAttempts = quiz ? (attempts?.filter(a => a.quiz_id === quiz.id) ?? []) : []
    const bestScore = quizAttempts.length ? Math.max(...quizAttempts.map(a => Number(a.score_percent))) : null
    const passed = quizAttempts.some(a => a.passed)
    return { ...ch, progress, quiz, bestScore, passed }
  })

  const totalChapters   = chapterList.length
  const readCount       = chapterList.filter(c => c.progress?.marked_complete).length
  const passedCount     = chapterList.filter(c => c.passed).length

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Live Notes</span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1 mb-2">Road Traffic Signs Manual</h1>
        <p className="text-gray-500">SA Learner Driver Manual — Dept. of Transport, June 2012 · 18 chapters · 56 study pages</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-8">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="font-semibold text-gray-700">Your Progress</span>
          <span className="text-gray-400">{passedCount}/{totalChapters} quizzes passed</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${totalChapters ? (passedCount / totalChapters) * 100 : 0}%` }}
          />
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          <span>📖 <strong className="text-gray-900">{readCount}</strong> chapters read</span>
          <span>✅ <strong className="text-gray-900">{passedCount}</strong> quizzes passed</span>
        </div>
      </div>

      {/* Chapter grid */}
      <div className="space-y-3">
        {chapterList.map(ch => {
          const isRead    = ch.progress?.marked_complete ?? false
          const isPassed  = ch.passed
          const hasScore  = ch.bestScore !== null

          let statusBadge = <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Not started</span>
          if (isPassed)   statusBadge = <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">✓ Passed</span>
          else if (hasScore) statusBadge = <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full font-medium">Retry</span>
          else if (isRead) statusBadge = <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium">Read ✓</span>
          else if (ch.progress) statusBadge = <span className="text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full font-medium">In progress</span>

          return (
            <Link
              key={ch.id}
              href={`/live-notes/chapter/${ch.chapter_number}`}
              className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isPassed ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-700'}`}>
                  {ch.chapter_number}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 group-hover:text-green-800 truncate text-sm sm:text-base">
                    {ch.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Pages {ch.page_start}–{ch.page_end} · {ch.total_pages} page{ch.total_pages !== 1 ? 's' : ''}
                    {ch.section_reference && ` · ${ch.section_reference}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                {hasScore && (
                  <span className={`text-xs font-bold ${isPassed ? 'text-green-700' : 'text-yellow-700'}`}>
                    {Math.round(ch.bestScore!)}%
                  </span>
                )}
                {statusBadge}
                <span className="text-gray-300 group-hover:text-green-600 text-lg">›</span>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
