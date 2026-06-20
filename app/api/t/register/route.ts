// POST /api/t/register — creates trainer profile row after Supabase auth signup
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { user_id, name, email, phone, province, bio, slug, learner_price_cents } = await req.json()
  if (!user_id || !name || !email || !slug)
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })

  const db = createAdminClient()

  // Check slug uniqueness
  const { data: existing } = await db.from('trainers').select('id').eq('slug', slug).single()
  if (existing) return NextResponse.json({ error: 'That page URL is already taken. Try a different one.' }, { status: 409 })

  const { error } = await db.from('trainers').insert({
    user_id, name, email, phone, province, bio, slug,
    learner_price_cents: learner_price_cents ?? 0,
    is_active: false,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
