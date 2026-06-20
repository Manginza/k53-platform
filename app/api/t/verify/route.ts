// POST /api/t/verify — learner enters email to access paid materials
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { trainer_id, email } = await req.json()
  if (!trainer_id || !email)
    return NextResponse.json({ error: 'trainer_id and email are required.' }, { status: 400 })

  const db = createAdminClient()
  const { data } = await db
    .from('trainer_learners')
    .select('is_paid')
    .eq('trainer_id', trainer_id)
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!data) return NextResponse.json({ access: false, reason: 'not_registered' })
  if (!data.is_paid) return NextResponse.json({ access: false, reason: 'not_paid' })

  // Fetch materials for this trainer
  const { data: materials } = await db
    .from('trainer_materials')
    .select('id,title,description,type,url,content,sort_order')
    .eq('trainer_id', trainer_id)
    .eq('is_active', true)
    .order('sort_order')

  return NextResponse.json({ access: true, materials: materials ?? [] })
}
