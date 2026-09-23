// PATCH/DELETE /api/t/learners — trainer marks learners paid / removes them,
// or sets a learner's SA ID number (gender is classified from it).
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { saIdDigits, genderFromSaId } from '@/lib/sa-id'

async function getTrainerId(db: ReturnType<typeof createAdminClient>) {
  const browser = createClient()
  const { data: { user } } = await browser.auth.getUser()
  if (!user) return null
  const { data } = await db.from('trainers').select('id').eq('user_id', user.id).single()
  return data?.id ?? null
}

export async function PATCH(req: NextRequest) {
  const db = createAdminClient()
  const trainerId = await getTrainerId(db)
  if (!trainerId) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const body = await req.json()
  const { id } = body

  // Two shapes: a paid toggle, or an ID-number edit (which reclassifies gender).
  let update: Record<string, unknown>
  if ('id_number' in body) {
    const idDigits = saIdDigits(body.id_number)
    update = { id_number: idDigits || null, gender: genderFromSaId(idDigits) }
  } else {
    const { is_paid, amount_cents } = body
    update = { is_paid, paid_at: is_paid ? new Date().toISOString() : null, amount_cents: amount_cents ?? null }
  }

  const { error } = await db
    .from('trainer_learners')
    .update(update)
    .eq('id', id)
    .eq('trainer_id', trainerId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, gender: update.gender ?? null })
}

export async function DELETE(req: NextRequest) {
  const db = createAdminClient()
  const trainerId = await getTrainerId(db)
  if (!trainerId) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { id } = await req.json()
  const { error } = await db
    .from('trainer_learners')
    .delete()
    .eq('id', id)
    .eq('trainer_id', trainerId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
