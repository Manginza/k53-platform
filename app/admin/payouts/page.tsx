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
  // Read ALL commissions once and derive earned / paid / pending per
  // affiliate from them. Using the source-of-truth commissions table
  // instead of the denormalised total_earned_cents / total_paid_cents
  // columns eliminates the drift that read-modify-write races on those
  // counters have caused (concurrent Yoco webhooks / payouts). The
  // pending IDs are then passed to the "Mark paid" action so only those
  // specific IDs are cleared — new commissions arriving after page
  // render stay pending for next week's payout.
  const [{ data: affiliates }, { data: allCommissions }] = await Promise.all([
    db.from('affiliates').select('*').order('created_at', { ascending: false }).limit(1000),
    db.from('affiliate_commissions').select('id, affiliate_id, commission_cents, status'),
  ])

  const pendingByAff = new Map<string, { cents: number; ids: string[] }>()
  const earnedByAff  = new Map<string, number>()
  const paidByAff    = new Map<string, number>()
  for (const c of allCommissions ?? []) {
    const cents = c.commission_cents ?? 0
    earnedByAff.set(c.affiliate_id, (earnedByAff.get(c.affiliate_id) ?? 0) + cents)
    if (c.status === 'paid') {
      paidByAff.set(c.affiliate_id, (paidByAff.get(c.affiliate_id) ?? 0) + cents)
    } else {
      const cur = pendingByAff.get(c.affiliate_id) ?? { cents: 0, ids: [] }
      cur.cents += cents
      cur.ids.push(c.id)
      pendingByAff.set(c.affiliate_id, cur)
    }
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
    pendingCents: pendingByAff.get(a.id)?.cents ?? 0,
    pendingCommissionIds: pendingByAff.get(a.id)?.ids ?? [],
    earnedCents: earnedByAff.get(a.id) ?? 0,
    paidCents: paidByAff.get(a.id) ?? 0,
  }))

  // Owed first, then biggest earners.
  rows.sort((a, b) => b.pendingCents - a.pendingCents || b.earnedCents - a.earnedCents)

  return <AffiliatePayouts adminEmail={admin.email ?? ''} initialRows={rows} />
}
