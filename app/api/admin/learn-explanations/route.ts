/**
 * Admin Learn Mode review API.
 *
 *   PATCH — edit and/or approve one explanation
 *           { questionId, reviewed?, why?, practical?, common_mistake?, related_href? }
 *   POST  — toggle the global "show unreviewed explanations to learners" flag
 *           { showUnreviewed: boolean }
 *
 * Admin-only (either tier — this is content, not card-payment data).
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { setShowUnreviewed } from '@/lib/learn-mode'

export const dynamic = 'force-dynamic'

const TEXT_FIELDS = ['why', 'practical', 'common_mistake', 'category', 'how_asked', 'related_href'] as const

export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* handled below */ }

  const questionId = Number(body.questionId)
  if (!questionId || !Number.isFinite(questionId)) {
    return NextResponse.json({ error: 'questionId required' }, { status: 400 })
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const field of TEXT_FIELDS) {
    if (field in body) patch[field] = body[field] === '' ? null : body[field]
  }
  if (typeof body.reviewed === 'boolean') {
    patch.reviewed = body.reviewed
    if (body.reviewed) patch.needs_review = false
  }

  const { error } = await createAdminClient()
    .from('question_explanations')
    .update(patch)
    .eq('question_id', questionId)

  if (error) {
    console.error('[admin/learn-explanations] update failed', error.message)
    return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let showUnreviewed: unknown
  try { ({ showUnreviewed } = await req.json()) } catch { /* handled below */ }
  if (typeof showUnreviewed !== 'boolean') {
    return NextResponse.json({ error: 'showUnreviewed boolean required' }, { status: 400 })
  }

  await setShowUnreviewed(showUnreviewed)
  return NextResponse.json({ ok: true, showUnreviewed })
}
