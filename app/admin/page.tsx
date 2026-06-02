/**
 * /admin — admin hub (allowlisted accounts only). Three sections:
 *   1. Member access (grant by email + signup links)
 *   2. Signup links (unique single-use registration links)
 *   3. Affiliate payouts (affiliates, bank details, amount owed, mark paid)
 */
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import AdminDashboard, {
  type AdminGrant, type SignupLink, type PayoutRow,
} from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = await getAdminUser()
  if (!admin) redirect('/login')

  const db = createAdminClient()
  const [{ data: grants }, { data: list }, { data: links }, { data: affiliates }, { data: pending }] =
    await Promise.all([
      db.from('access_grants').select('*').order('updated_at', { ascending: false }).limit(500),
      db.auth.admin.listUsers({ perPage: 1000 }),
      db.from('registration_tokens').select('*').eq('source', 'admin').order('created_at', { ascending: false }).limit(500),
      db.from('affiliates').select('*').order('created_at', { ascending: false }).limit(1000),
      db.from('affiliate_commissions').select('affiliate_id, commission_cents').eq('status', 'pending'),
    ])

  const emailById = new Map((list?.users ?? []).map(u => [u.id, u.email ?? '']))

  const grantRows: AdminGrant[] = (grants ?? []).map(g => ({
    user_id: g.user_id,
    email: emailById.get(g.user_id) ?? g.user_id,
    expires_at: g.expires_at,
    source: g.source,
  }))

  const linkRows: SignupLink[] = (links ?? []).map(t => ({
    id: t.id,
    token: t.token,
    label: t.label,
    status: t.status,
    usedByEmail: t.used_by_user_id ? (emailById.get(t.used_by_user_id) ?? null) : null,
    expires_at: t.expires_at,
  }))

  const pendingByAff = new Map<string, number>()
  for (const c of pending ?? []) {
    pendingByAff.set(c.affiliate_id, (pendingByAff.get(c.affiliate_id) ?? 0) + (c.commission_cents ?? 0))
  }
  const payoutRows: PayoutRow[] = (affiliates ?? []).map(a => ({
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
  payoutRows.sort((a, b) => b.pendingCents - a.pendingCents || b.earnedCents - a.earnedCents)

  return (
    <AdminDashboard
      adminEmail={admin.email ?? ''}
      initialGrants={grantRows}
      initialLinks={linkRows}
      initialPayouts={payoutRows}
    />
  )
}
