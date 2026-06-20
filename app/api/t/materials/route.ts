// GET/POST/DELETE /api/t/materials — trainer manages their own materials
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'

async function getTrainerId(db: ReturnType<typeof createAdminClient>) {
  const browser = createClient()
  const { data: { user } } = await browser.auth.getUser()
  if (!user) return null
  const { data } = await db.from('trainers').select('id').eq('user_id', user.id).single()
  return data?.id ?? null
}

export async function GET() {
  const db = createAdminClient()
  const trainerId = await getTrainerId(db)
  if (!trainerId) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { data, error } = await db
    .from('trainer_materials')
    .select('*')
    .eq('trainer_id', trainerId)
    .order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ materials: data })
}

export async function POST(req: NextRequest) {
  const db = createAdminClient()
  const trainerId = await getTrainerId(db)
  if (!trainerId) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const body = await req.json()
  const { title, description, type, url, content } = body
  if (!title || !type) return NextResponse.json({ error: 'title and type are required.' }, { status: 400 })

  const { data: last } = await db
    .from('trainer_materials')
    .select('sort_order')
    .eq('trainer_id', trainerId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const { data, error } = await db
    .from('trainer_materials')
    .insert({ trainer_id: trainerId, title, description, type, url, content, sort_order: (last?.sort_order ?? 0) + 1 })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ material: data })
}

export async function DELETE(req: NextRequest) {
  const db = createAdminClient()
  const trainerId = await getTrainerId(db)
  if (!trainerId) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { id } = await req.json()
  const { error } = await db
    .from('trainer_materials')
    .delete()
    .eq('id', id)
    .eq('trainer_id', trainerId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
