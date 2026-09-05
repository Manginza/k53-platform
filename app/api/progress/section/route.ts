import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { RULES_CHAPTERS } from '@/lib/rules-of-the-road'
import type { LearnerSection } from '@/lib/learner-progress'

interface SectionBody {
  section: LearnerSection
  action: 'visited' | 'item_completed'
  item?: string
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ saved: false }, { status: 401 })

  let body: SectionBody
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid activity data.' }, { status: 400 })
  }
  if (!['live_notes', 'road_rules'].includes(body.section) || !['visited', 'item_completed'].includes(body.action)) {
    return NextResponse.json({ error: 'Unknown learner activity.' }, { status: 400 })
  }

  const { data: existing, error: readError } = await supabase.from('learner_section_progress')
    .select('visit_count, completed_items, first_visited_at, completed_at')
    .eq('user_id', user.id).eq('section', body.section).maybeSingle()
  if (readError) return NextResponse.json({ error: 'Progress storage is not ready. Apply migration 18.' }, { status: 503 })

  const now = new Date().toISOString()
  const completedItems = new Set<string>(existing?.completed_items ?? [])
  if (body.action === 'item_completed' && body.item) completedItems.add(body.item)
  const complete = body.section === 'road_rules' && completedItems.size >= RULES_CHAPTERS.length

  const { error } = await supabase.from('learner_section_progress').upsert({
    user_id: user.id,
    section: body.section,
    visit_count: (existing?.visit_count ?? 0) + (body.action === 'visited' ? 1 : 0),
    completed_items: Array.from(completedItems),
    first_visited_at: existing?.first_visited_at ?? now,
    last_visited_at: now,
    completed_at: complete ? (existing?.completed_at ?? now) : existing?.completed_at ?? null,
    updated_at: now,
  }, { onConflict: 'user_id,section' })

  if (error) return NextResponse.json({ error: 'Unable to save section progress.' }, { status: 500 })
  return NextResponse.json({ saved: true, completedItems: completedItems.size, complete })
}
