// Admin affiliate management — GET (list with commissions), POST (add manually), DELETE
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { generateAffiliateCode, COMMISSION_RATE } from '@/lib/affiliate'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const db = createAdminClient()
  const [{ data: affiliates }, { data: referrals }, { data: commissions }] = await Promise.all([
    db.from('affiliates').select('*').order('created_at', { ascending: false }),
    db.from('referrals')
      .select('id, affiliate_id, referred_user_id, code, status, converted_at, created_at')
      .order('created_at', { ascending: false }),
    db.from('affiliate_commissions')
      .select('affiliate_id, commission_cents, amount_cents, status, created_at, yoco_payment_id')
      .order('created_at', { ascending: false }),
  ])

  return NextResponse.json({ affiliates: affiliates ?? [], referrals: referrals ?? [], commissions: commissions ?? [] })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { firstName, lastName, email, bankAccountName, bankName, accountNumber, accountType } = await req.json()
  if (!firstName || !lastName || !email) return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })

  const db = createAdminClient()

  // Create auth user and send invite
  const { data: invited, error: invErr } = await db.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.skdriving.co.za'}/affiliate`,
  })
  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 })

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAffiliateCode()
    const { data, error } = await db.from('affiliates').insert({
      user_id: invited.user.id,
      code, first_name: firstName, last_name: lastName, email,
      bank_account_name: bankAccountName || null,
      bank_name: bankName || null,
      account_number: accountNumber || null,
      account_type: accountType || null,
      commission_rate: COMMISSION_RATE,
    }).select().single()
    if (!error) return NextResponse.json({ affiliate: data })
    if (error.code !== '23505') return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ error: 'Could not generate unique code.' }, { status: 500 })
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { id } = await req.json()
  const db = createAdminClient()
  const { error } = await db.from('affiliates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
