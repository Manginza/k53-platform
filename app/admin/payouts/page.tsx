/**
 * /admin/payouts — affiliate payouts view (admin only).
 *
 * Lists each affiliate with the amount owed (pending commission), their bank
 * details, and lifetime earned/paid — with a "Mark as paid" action to clear
 * the pending balance after the weekly bank transfer.
 */
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import AffiliatePayouts, { type PayoutRow } from '@/components/admin/AffiliatePayouts'

export const dynamic = 'force-dynamic'

export default async function PayoutsPage() {
  const admin = await getAdminUser()
  if (!admin) redirect('/login')

  const db = createAdminClient()
  const [{ data: affiliates }, { data: pending }] = await Promise.all([
    db.from('affiliates').select('*').order('created_at', { ascending: false }).limit(1000),
    db.from('affiliate_commissions').select('affiliate_id, commission_cents').eq('status', 'pending'),
  ])

  const pendingByAff = new Map<string, number>()
  for (const c of pending ?? []) {
    pendingByAff.set(c.affiliate_id, (pendingByAff.get(c.affiliate_id) ?? 0) + (c.commission_cents ?? 0))
  }

  const rows: PayoutRow[] = (affiliates ?? []).map(a => ({
    id: a.id,
    name: [a.first_name, a.last_name].filter(Boolean).join(' ') || '—',
    email: a.email ?? '',
    code: a.code,
    bankAccountName: a.bank_account_name ?? '',
    bankName: a.bank_name ?? '',
    accountNumber: a.account_number ?? '',
    accountType: a.account_type ?? '',
    pendingCents: pendingByAff.get(a.id) ?? 0,
    earnedCents: a.total_earned_cents ?? 0,
    paidCents: a.total_paid_cents ?? 0,
  }))

  // Owed first, then biggest earners.
  rows.sort((a, b) => b.pendingCents - a.pendingCents || b.earnedCents - a.earnedCents)

  return <AffiliatePayouts adminEmail={admin.email ?? ''} initialRows={rows} />
}
