// POST /api/t/join — learner signs up on a trainer's public page
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { saIdDigits, genderFromSaId } from '@/lib/sa-id'

export async function POST(req: NextRequest) {
  const { trainer_id, name, email, phone, id_number } = await req.json()
  if (!trainer_id || !name || !email)
    return NextResponse.json({ error: 'trainer_id, name and email are required.' }, { status: 400 })

  const db = createAdminClient()

  // Confirm trainer exists and is active
  const { data: trainer } = await db.from('trainers').select('id').eq('id', trainer_id).eq('is_active', true).single()
  if (!trainer) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 })

  // Gender is classified from the SA ID rather than asked, when the ID is given.
  const idDigits = saIdDigits(id_number)
  const gender = genderFromSaId(idDigits)

  const { error } = await db.from('trainer_learners').upsert(
    {
      trainer_id, name, email: email.toLowerCase().trim(), phone: phone || null,
      id_number: idDigits || null, gender,
    },
    { onConflict: 'trainer_id,email', ignoreDuplicates: true },
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
