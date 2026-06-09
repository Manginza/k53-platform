import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { hasFullAccess } from '@/lib/access'
import LockedContent from '@/components/LockedContent'
import ChapterReader from '@/components/live-notes/ChapterReader'

export const dynamic = 'force-dynamic'

interface Props {
  params: { chapter_number: string }
}

export default async function K53ChapterPage({ params }: Props) {
  if (!(await hasFullAccess())) {
    return (
      <LockedContent
        feature="K53 Unpacked"
        description="Study the full K53 Learner's & Driving Licence manual — every chapter with an exam-standard quiz — with full access."
      />
    )
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const chapterNum = parseInt(params.chapter_number, 10)
  if (isNaN(chapterNum)) notFound()

  const { data: chapter, error } = await supabase
    .from('ku_chapters')
    .select('*')
    .eq('chapter_number', chapterNum)
    .eq('is_front_matter', false)
    .single()

  if (error || !chapter) notFound()

  const { data: pages } = await supabase
    .from('ku_pages')
    .select('id, page_number, alt_text')
    .eq('chapter_id', chapter.id)
    .order('page_number')

  const { data: progress } = user
    ? await supabase
        .from('ku_user_chapter_progress')
        .select('marked_complete, pages_read')
        .eq('user_id', user.id)
        .eq('chapter_id', chapter.id)
        .maybeSingle()
    : { data: null }

  // Highest study chapter number, for prev/next bounds
  const { data: lastChapter } = await supabase
    .from('ku_chapters')
    .select('chapter_number')
    .eq('is_front_matter', false)
    .order('chapter_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  const maxChapter = lastChapter?.chapter_number ?? chapterNum

  return (
    <ChapterReader
      chapter={chapter}
      pages={pages ?? []}
      progress={progress ?? null}
      user={user}
      prevChapter={chapterNum > 1 ? chapterNum - 1 : null}
      nextChapter={chapterNum < maxChapter ? chapterNum + 1 : null}
      basePath="/live-notes/k53"
      imageFolder="K53 Unpacked"
      imageExt="png"
      progressTable="ku_user_chapter_progress"
    />
  )
}
