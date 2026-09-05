import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import type { User } from '@supabase/supabase-js'
import { getLatestRecordingUrl, getPromoWindow } from '@/lib/settings'
import { buildDailyCash } from '@/lib/daily-cash'
import AdminDashboard, {
  type AdminGrant, type SignupLink, type PayoutRow, type TrainerRow, type CommissionRow,
} from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

/**
 * Every auth user, not just the first page.
 *
 * listUsers caps perPage at 1000. A single call was fine while it only fed
 * the email lookup, but the daily cash figures count accounts, so one page
 * would start silently undercounting the moment the platform passes a
 * thousand of them. Page until a short page comes back.
 */
async function listAllUsers(db: ReturnType<typeof createAdminClient>) {
  const PER_PAGE = 1000
  const MAX_PAGES = 50          // 50k accounts; a guard against looping forever
  const users: User[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: PER_PAGE })
    if (error) {
      // Without this the page renders a confident R0.00 when the admin API is
      // rejecting us — which is what a SUPABASE_SERVICE_ROLE_KEY holding an
      // anon key looks like from here. Fail loudly in the log instead.
      console.error(`[admin] listUsers page ${page} failed:`, error.message)
      break
    }
    const batch = data?.users ?? []
    users.push(...batch)
    if (batch.length < PER_PAGE) break
  }
  return users
}

export default async function AdminPage() {
  const admin = await getAdminUser()
  if (!admin) {
    const host = headers().get('host')?.split(':')[0].toLowerCase()
    redirect(host === 'skonline.co.za' || host === 'www.skonline.co.za' ? '/admin-login' : '/login')
  }

  const db = createAdminClient()
  const [
    { data: grants }, users, { data: links },
    { data: affiliates }, { data: allCommissions }, { data: trainers },
  ] = await Promise.all([
    db.from('access_grants').select('*').order('updated_at', { ascending: false }).limit(500),
    listAllUsers(db),
    db.from('registration_tokens').select('*').eq('source', 'admin').order('created_at', { ascending: false }).limit(500),
    db.from('affiliates').select('*').order('created_at', { ascending: false }).limit(1000),
    db.from('affiliate_commissions')
      .select('id,affiliate_id,commission_cents,amount_cents,status,created_at,yoco_payment_id')
      .order('created_at', { ascending: false })
      .limit(2000),
    db.from('trainers').select('id,name,email,slug,province,phone,learner_price_cents,is_active,fee_paid_until,created_at').order('created_at', { ascending: false }),
  ])

  const emailById = new Map(users.map(u => [u.id, u.email ?? '']))

  // Values every account added at the full-access price. Pipeline value, not
  // settled cash — see lib/daily-cash.ts.
  const dailyCash = buildDailyCash(users.map(u => u.created_at))

  const grantRows: AdminGrant[] = (grants ?? []).map(g => ({
    user_id: g.user_id,
    email: emailById.get(g.user_id) ?? g.user_id,
    expires_at: g.expires_at,
    source: g.source,
  }))

  const linkRows: SignupLink[] = (links ?? []).map(t => ({
    id: t.id, token: t.token, label: t.label, status: t.status,
    usedByEmail: t.used_by_user_id ? (emailById.get(t.used_by_user_id) ?? null) : null,
    expires_at: t.expires_at,
  }))

  const commissionRows: CommissionRow[] = (allCommissions ?? []).map(c => ({
    id: c.id, affiliate_id: c.affiliate_id,
    amount_cents: c.amount_cents, commission_cents: c.commission_cents,
    status: c.status, created_at: c.created_at,
  }))

  // Derive earned / paid / pending totals from the commissions table
  // instead of the drift-prone denormalised counters. Same rationale as
  // /admin/payouts/page.tsx — see there for the full story.
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

  const payoutRows: PayoutRow[] = (affiliates ?? []).map(a => ({
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
  payoutRows.sort((a, b) => b.pendingCents - a.pendingCents || b.earnedCents - a.earnedCents)

  const trainerRows: TrainerRow[] = (trainers ?? []).map(t => ({
    id: t.id, name: t.name, email: t.email, slug: t.slug,
    province: t.province ?? '', phone: t.phone ?? '',
    learner_price_cents: t.learner_price_cents ?? 0,
    is_active: t.is_active, fee_paid_until: t.fee_paid_until ?? null,
    created_at: t.created_at,
  }))

  return (
    <AdminDashboard
      adminEmail={admin.email ?? ''}
      initialGrants={grantRows}
      initialLinks={linkRows}
      initialPayouts={payoutRows}
      initialCommissions={commissionRows}
      initialRecordingUrl={await getLatestRecordingUrl()}
      initialPromo={await getPromoWindow()}
      dailyCash={dailyCash}
      initialTrainers={trainerRows}
    />
  )
}
