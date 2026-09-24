/**
 * /api/admin/affiliates — affiliate programme management.
 *
 *   GET    list affiliates with their referrals and commissions
 *   POST   add an affiliate and email them an invite
 *   PATCH  edit one affiliate (name, contact, bank details, rate, status)
 *   DELETE remove one affiliate, archiving their records first
 *
 * Used by both the platform admin dashboard (/admin) and the programme
 * admin's own dashboard (/affiliate). Access is requireAffiliateAdmin():
 * an affiliate flagged `is_admin`, or a primary platform admin.
 *
 * `is_admin` itself is deliberately NOT editable here. Granting programme
 * admin hands over every affiliate's bank details, so it is done in SQL
 * (migration 21) rather than through a dashboard button.
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireAffiliateAdmin } from '@/lib/affiliate-admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { generateAffiliateCode, COMMISSION_RATE } from '@/lib/affiliate'

const FORBIDDEN = NextResponse.json(
  { error: 'This area is restricted to the affiliate programme admin.' },
  { status: 403 },
)

export async function GET() {
  if (!await requireAffiliateAdmin()) return FORBIDDEN

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
  if (!await requireAffiliateAdmin()) return FORBIDDEN

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

/** Fields the programme admin may change, mapped to their database columns. */
function buildPatch(body: Record<string, unknown>): { patch: Record<string, unknown> } | { error: string } {
  const patch: Record<string, unknown> = {}

  const text = (key: string, column: string) => {
    if (!(key in body)) return
    const value = body[key]
    if (typeof value !== 'string') return
    patch[column] = value.trim() || null
  }
  text('firstName', 'first_name')
  text('lastName', 'last_name')
  text('email', 'email')
  text('bankAccountName', 'bank_account_name')
  text('bankName', 'bank_name')
  text('accountNumber', 'account_number')

  if ('accountType' in body) {
    const v = String(body.accountType ?? '').trim().toLowerCase()
    if (v && v !== 'cheque' && v !== 'savings') return { error: 'Account type must be Cheque or Savings.' }
    patch.account_type = v || null
  }

  if ('commissionRate' in body) {
    const rate = Number(body.commissionRate)
    if (!Number.isFinite(rate) || rate <= 0 || rate > 1) {
      return { error: 'Commission rate must be between 0 and 100%.' }
    }
    // Column is numeric(4,3): three decimals, so 0.3 not 0.3333.
    patch.commission_rate = Math.round(rate * 1000) / 1000
  }

  if ('status' in body) {
    const v = String(body.status ?? '').trim().toLowerCase()
    if (v !== 'active' && v !== 'suspended') return { error: 'Status must be active or suspended.' }
    patch.status = v
  }

  if (Object.keys(patch).length === 0) return { error: 'Nothing to update.' }
  return { patch }
}

export async function PATCH(req: NextRequest) {
  if (!await requireAffiliateAdmin()) return FORBIDDEN

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }

  const id = typeof body.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ error: 'Affiliate id is required.' }, { status: 400 })

  const built = buildPatch(body)
  if ('error' in built) return NextResponse.json({ error: built.error }, { status: 400 })

  const { data, error } = await createAdminClient()
    .from('affiliates')
    .update(built.patch)
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) {
    // A duplicate here means the email is already on another affiliate row.
    const message = error.code === '23505'
      ? 'Another affiliate already uses that email.'
      : error.message
    return NextResponse.json({ error: message }, { status: 400 })
  }
  if (!data) return NextResponse.json({ error: 'That affiliate no longer exists.' }, { status: 404 })

  return NextResponse.json({ affiliate: data })
}

export async function DELETE(req: NextRequest) {
  if (!await requireAffiliateAdmin()) return FORBIDDEN

  let id: string | undefined
  try { ({ id } = await req.json()) } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  if (!id) return NextResponse.json({ error: 'Affiliate id is required.' }, { status: 400 })

  const db = createAdminClient()

  // Refuse to remove a programme admin: it would drop whoever is running the
  // programme out of their own dashboard, and it is never what a stray click
  // on a row meant.
  const { data: target, error: readError } = await db
    .from('affiliates').select('id, is_admin').eq('id', id).maybeSingle()
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })
  if (!target) return NextResponse.json({ error: 'That affiliate no longer exists.' }, { status: 404 })
  if (target.is_admin) {
    return NextResponse.json({ error: 'This affiliate runs the programme and cannot be removed here.' }, { status: 409 })
  }

  // Archives referrals, commissions and clicks, then deletes — one transaction,
  // so a removal never destroys a commission record (see migration 22).
  const { error } = await db.rpc('archive_affiliate', { p_affiliate_id: id, p_reason: 'admin removal' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
