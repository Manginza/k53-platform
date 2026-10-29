import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { showUnreviewedEnabled } from '@/lib/learn-mode'
import LearnReview, { type ReviewItem } from '@/components/admin/LearnReview'

export const dynamic = 'force-dynamic'

interface QuestionRow {
  id: number
  question: string
  option_a: string
  option_b: string
  option_c: string
  correct_answer: string
  image_url: string | null
}
interface ExplanationRow {
  question_id: number
  why: string | null
  practical: string | null
  common_mistake: string | null
  category: string | null
  how_asked: string | null
  related_href: string | null
  needs_review: boolean
}

export default async function LearnReviewPage() {
  const admin = await getAdminUser()
  if (!admin) {
    const host = headers().get('host')?.split(':')[0].toLowerCase()
    redirect(host === 'skonline.co.za' || host === 'www.skonline.co.za' ? '/admin-login' : '/login')
  }

  const db = createAdminClient()
  const { data: exps } = await db
    .from('question_explanations')
    .select('question_id, why, practical, common_mistake, category, how_asked, related_href, needs_review')
    .eq('reviewed', false)
    .order('needs_review', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(200)

  const rows = (exps ?? []) as ExplanationRow[]
  const ids = rows.map(r => r.question_id)

  const questionsById = new Map<number, QuestionRow>()
  if (ids.length) {
    const { data: qs } = await db
      .from('quiz_questions')
      .select('id, question, option_a, option_b, option_c, correct_answer, image_url')
      .in('id', ids)
    for (const q of (qs ?? []) as QuestionRow[]) questionsById.set(q.id, q)
  }

  const items: ReviewItem[] = rows.map(r => {
    const q = questionsById.get(r.question_id)
    return {
      questionId: r.question_id,
      question: q?.question ?? `Question #${r.question_id}`,
      options: [q?.option_a ?? '', q?.option_b ?? '', q?.option_c ?? ''],
      correctAnswer: q?.correct_answer ?? '',
      imageUrl: q?.image_url ?? null,
      why: r.why,
      practical: r.practical,
      common_mistake: r.common_mistake,
      category: r.category,
      how_asked: r.how_asked,
      related_href: r.related_href,
      needsReview: r.needs_review,
    }
  })

  return <LearnReview items={items} initialShowUnreviewed={await showUnreviewedEnabled(db)} />
}
