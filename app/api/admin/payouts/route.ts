/**
 * POST /api/admin/payouts — mark specific pending commissions as paid.
 * Admin only. Used after the weekly bank transfer.
 *
 * Body: { affiliateId: string, commissionIds: string[] }
 *
 * The client passes the exact commission IDs it saw at page render, so any
 * NEW commissions that landed between page render and this click stay
 * pending — the admin can pay them out next week instead of silently
 * clearing them off the books. Previously the endpoint accepted only an
 * affiliateId and marked EVERY pending commission for that affiliate paid,
 * which meant a referral that closed while the admin was reviewing the
 * page got wiped as "paid" without ever hitting the bank transfer.
 *
 * Also stops touching the drift-prone `total_paid_cents` denormalised
 * counter — display code now derives paidCents from the commissions
 * table at read time (see /admin/payouts and /affiliate).
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let affiliateId: string | undefined
  let commissionIds: unknown
  try {
    ({ affiliateId, commissionIds } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  if (!affiliateId) return NextResponse.json({ error: 'affiliateId is required.' }, { status: 400 })
  if (!Array.isArray(commissionIds)) {
    return NextResponse.json({ error: 'commissionIds must be an array.' }, { status: 400 })
  }
  const ids = commissionIds.filter((v): v is string => typeof v === 'string' && v.length > 0)
  if (ids.length === 0) {
    return NextResponse.json({ affiliateId, paidCents: 0, count: 0 })
  }

  const db = createAdminClient()

  // Verify each ID belongs to this affiliate AND is still pending. This
  // guards against a stale client submitting IDs that were already paid
  // (double-payment risk) or that belong to a different affiliate.
  const { data: matched, error: readErr } = await db
    .from('affiliate_commissions')
    .select('id, commission_cents')
    .in('id', ids)
    .eq('affiliate_id', affiliateId)
    .eq('status', 'pending')
  if (readErr) return NextResponse.json({ error: 'Could not read commissions.' }, { status: 500 })

  const matchedIds = (matched ?? []).map(c => c.id)
  const paidCents = (matched ?? []).reduce((s, c) => s + (c.commission_cents ?? 0), 0)
  if (matchedIds.length === 0) {
    return NextResponse.json({ affiliateId, paidCents: 0, count: 0 })
  }

  const { error: updErr } = await db
    .from('affiliate_commissions')
    .update({ status: 'paid' })
    .in('id', matchedIds)
  if (updErr) return NextResponse.json({ error: 'Could not update commissions.' }, { status: 500 })

  return NextResponse.json({ affiliateId, paidCents, count: matchedIds.length })
}
