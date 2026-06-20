// Admin-only trainer management
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getAdminUser } from '@/lib/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('trainers')
    .select('id,name,email,slug,province,phone,learner_price_cents,is_active,fee_paid_until,created_at')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ trainers: data })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { name, email, slug, province, phone, learner_price_cents, fee_paid_until } = await req.json()
  if (!name || !email || !slug) return NextResponse.json({ error: 'name, email and slug are required.' }, { status: 400 })

  const db = createAdminClient()

  // Check slug is unique
  const { data: existing } = await db.from('trainers').select('id').eq('slug', slug).single()
  if (existing) return NextResponse.json({ error: 'That page URL is already taken.' }, { status: 409 })

  // Invite the trainer via Supabase — creates auth account and sends invite email
  const { data: invited, error: inviteErr } = await db.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.skdriving.co.za'}/trainer/dashboard`,
  })
  if (inviteErr) return NextResponse.json({ error: inviteErr.message }, { status: 500 })

  const { data: trainer, error: insertErr } = await db
    .from('trainers')
    .insert({
      user_id: invited.user.id,
      name, email, slug,
      province: province || null,
      phone: phone || null,
      learner_price_cents: learner_price_cents ?? 0,
      fee_paid_until: fee_paid_until || null,
      is_active: true,
    })
    .select()
    .single()
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  return NextResponse.json({ trainer })
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { id, is_active, fee_paid_until } = await req.json()
  const db = createAdminClient()
  const { error } = await db
    .from('trainers')
    .update({ is_active, fee_paid_until: fee_paid_until ?? null })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { id } = await req.json()
  const db = createAdminClient()
  const { error } = await db.from('trainers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
