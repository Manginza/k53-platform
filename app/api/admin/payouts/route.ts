/**
 * POST /api/admin/payouts — mark an affiliate's pending commissions as paid
 * (admin only). Used after the weekly bank transfer. Moves every 'pending'
 * commission for the affiliate to 'paid' and bumps their total_paid_cents.
 *
 * Body: { affiliateId: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let affiliateId: string | undefined
  try {
    ({ affiliateId } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  if (!affiliateId) return NextResponse.json({ error: 'affiliateId is required.' }, { status: 400 })

  const db = createAdminClient()

  // Sum the affiliate's pending commissions.
  const { data: pending, error: pErr } = await db
    .from('affiliate_commissions')
    .select('id, commission_cents')
    .eq('affiliate_id', affiliateId)
    .eq('status', 'pending')
  if (pErr) return NextResponse.json({ error: 'Could not read commissions.' }, { status: 500 })

  const paidCents = (pending ?? []).reduce((s, c) => s + (c.commission_cents ?? 0), 0)
  if (!pending || pending.length === 0) {
    return NextResponse.json({ affiliateId, paidCents: 0, count: 0 })
  }

  // Mark them paid.
  const { error: uErr } = await db
    .from('affiliate_commissions')
    .update({ status: 'paid' })
    .eq('affiliate_id', affiliateId)
    .eq('status', 'pending')
  if (uErr) return NextResponse.json({ error: 'Could not update commissions.' }, { status: 500 })

  // Bump the affiliate's lifetime paid total.
  const { data: aff } = await db.from('affiliates').select('total_paid_cents').eq('id', affiliateId).maybeSingle()
  await db
    .from('affiliates')
    .update({ total_paid_cents: (aff?.total_paid_cents ?? 0) + paidCents })
    .eq('id', affiliateId)

  return NextResponse.json({ affiliateId, paidCents, count: pending.length })
}
