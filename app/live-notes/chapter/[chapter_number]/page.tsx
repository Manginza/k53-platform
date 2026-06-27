import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { hasFullAccess } from '@/lib/access'
import LockedContent from '@/components/LockedContent'
import ChapterReader from '@/components/live-notes/ChapterReader'

export const dynamic = 'force-dynamic'

const LIVE_NOTES_DESC = 'Read the full Road Traffic Signs Manual — all 18 chapters with chapter quizzes — with full access.'

interface Props {
  params: { chapter_number: string }
}

export default async function ChapterPage({ params }: Props) {
  if (!(await hasFullAccess())) {
    return <LockedContent feature="Live Notes" description={LIVE_NOTES_DESC} />
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const chapterNum = parseInt(params.chapter_number, 10)
  if (isNaN(chapterNum)) notFound()

  const { data: chapter, error } = await supabase
    .from('ln_chapters')
    .select('*')
    .eq('chapter_number', chapterNum)
    .eq('is_front_matter', false)
    .single()

  if (error || !chapter) notFound()

  const { data: pages } = await supabase
    .from('ln_pages')
    .select('id, page_number, alt_text')
    .eq('chapter_id', chapter.id)
    .order('page_number')

  const { data: progress } = user
    ? await supabase
        .from('ln_user_chapter_progress')
        .select('marked_complete, pages_read')
        .eq('user_id', user.id)
        .eq('chapter_id', chapter.id)
        .maybeSingle()
    : { data: null }

  return (
    <ChapterReader
      chapter={chapter}
      pages={pages ?? []}
      progress={progress ?? null}
      user={user}
      prevChapter={chapterNum > 1 ? chapterNum - 1 : null}
      nextChapter={chapterNum < 18 ? chapterNum + 1 : null}
    />
  )
}
