import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getAdminUser, isPrimaryAdminEmail } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { getLatestRecordingUrl, getPromoWindow } from '@/lib/settings'
import AdminDashboard, {
  type AdminGrant, type SignupLink, type PayoutRow, type TrainerRow, type CommissionRow,
} from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

/**
 * Grant sources that originate from a card payment. A secondary admin manages
 * admin-added members only and must never see card-payment customers, so these
 * are filtered out of the member list at the query, not just hidden in the UI.
 */
const CARD_PAYMENT_SOURCES = '("payment","access_code")'

export default async function AdminPage() {
  const admin = await getAdminUser()
  if (!admin) {
    const host = headers().get('host')?.split(':')[0].toLowerCase()
    redirect(host === 'skonline.co.za' || host === 'www.skonline.co.za' ? '/admin-login' : '/login')
  }

  // Primary (super) admin sees everything, including card payments. Every other
  // admin is a secondary admin: admin-added members only, no card payments.
  const isPrimary = isPrimaryAdminEmail(admin.email)

  const db = createAdminClient()

  // Members + signup links load for both tiers. A secondary admin's member
  // list excludes card-payment grants at the query, so the 500-row cap counts
  // only the admin-added members they are allowed to see.
  let grantsQuery = db.from('access_grants').select('*').order('updated_at', { ascending: false }).limit(500)
  if (!isPrimary) grantsQuery = grantsQuery.not('source', 'in', CARD_PAYMENT_SOURCES)

  const [{ data: grants }, { data: list }, { data: links }] = await Promise.all([
    grantsQuery,
    db.auth.admin.listUsers({ perPage: 1000 }),
    db.from('registration_tokens').select('*').eq('source', 'admin').order('created_at', { ascending: false }).limit(500),
  ])

  const emailById = new Map((list?.users ?? []).map(u => [u.id, u.email ?? '']))

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

  // ── Card-payment data + site config: primary admin only ──────────────────
  // A secondary admin gets none of this — not loaded here, not sent to the
  // browser, and the dashboard hides the sections entirely. Leaving these as
  // empty defaults is what a secondary admin receives.
  let payoutRows: PayoutRow[] = []
  let commissionRows: CommissionRow[] = []
  let trainerRows: TrainerRow[] = []
  let recordingUrl = ''
  let promo = { from: '', until: '' }

  if (isPrimary) {
    const [
      { data: affiliates }, { data: allCommissions }, { data: trainers },
    ] = await Promise.all([
      db.from('affiliates').select('*').order('created_at', { ascending: false }).limit(1000),
      db.from('affiliate_commissions')
        .select('id,affiliate_id,commission_cents,amount_cents,status,created_at,yoco_payment_id')
        .order('created_at', { ascending: false })
        .limit(2000),
      db.from('trainers').select('id,name,email,slug,province,phone,learner_price_cents,is_active,fee_paid_until,created_at').order('created_at', { ascending: false }),
    ])

    recordingUrl = await getLatestRecordingUrl()
    promo = await getPromoWindow()

    commissionRows = (allCommissions ?? []).map(c => ({
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

    payoutRows = (affiliates ?? []).map(a => ({
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

    trainerRows = (trainers ?? []).map(t => ({
      id: t.id, name: t.name, email: t.email, slug: t.slug,
      province: t.province ?? '', phone: t.phone ?? '',
      learner_price_cents: t.learner_price_cents ?? 0,
      is_active: t.is_active, fee_paid_until: t.fee_paid_until ?? null,
      created_at: t.created_at,
    }))
  }

  return (
    <AdminDashboard
      adminEmail={admin.email ?? ''}
      isPrimary={isPrimary}
      initialGrants={grantRows}
      initialLinks={linkRows}
      initialPayouts={payoutRows}
      initialCommissions={commissionRows}
      initialRecordingUrl={recordingUrl}
      initialPromo={promo}
      initialTrainers={trainerRows}
    />
  )
}
