/**
 * /affiliate — affiliate programme.
 *
 * - Programme admin (affiliates.is_admin) → management dashboard: full
 *   scoreboard plus editing and removing every affiliate.
 * - Logged-in affiliate → earner dashboard (link, earnings, scoreboard, bank)
 * - Otherwise → registration form (self-register, or enrol an existing login)
 */
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getAffiliateForUser, getAffiliateStats } from '@/lib/affiliate'
import { getScoreboard, SCOREBOARD_ADMIN_SIZE } from '@/lib/affiliate-scoreboard'
import AffiliateRegister from '@/components/affiliate/AffiliateRegister'
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard'
import AdminAffiliateDashboard from '@/components/affiliate/AdminAffiliateDashboard'
import type { Affiliate, AffiliateCommission, ManagedAffiliate } from '@/lib/types'

export const dynamic = 'force-dynamic'

/** The roster the programme admin manages: every affiliate, with their figures. */
async function loadRoster(): Promise<ManagedAffiliate[]> {
  const db = createAdminClient()
  const [{ data: affiliates, error }, { data: stats }] = await Promise.all([
    db.from('affiliates').select('*').order('created_at', { ascending: false }).limit(1000),
    db.from('affiliate_admin_stats').select('*').limit(1000),
  ])
  if (error) {
    console.error('[affiliate] could not load the admin roster', error.message)
    return []
  }

  const statsById = new Map((stats ?? []).map(s => [s.affiliate_id as string, s]))

  return (affiliates ?? []).map(a => {
    const s = statsById.get(a.id)
    return {
      id: a.id,
      code: a.code,
      firstName: a.first_name ?? '',
      lastName: a.last_name ?? '',
      email: a.email ?? '',
      bankAccountName: a.bank_account_name ?? '',
      bankName: a.bank_name ?? '',
      accountNumber: a.account_number ?? '',
      accountType: (a.account_type ?? '') as ManagedAffiliate['accountType'],
      commissionRate: Number(a.commission_rate),
      status: a.status,
      isAdmin: !!a.is_admin,
      sales: Number(s?.sales ?? 0),
      earnedCents: Number(s?.earned_cents ?? 0),
      pendingCents: Number(s?.pending_cents ?? 0),
      clicks: Number(s?.clicks ?? 0),
      signups: Number(s?.signups ?? 0),
      joined: new Date(a.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
  })
}

export default async function AffiliatePage() {
  const affiliate = await getAffiliateForUser()

  if (!affiliate) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <AffiliateRegister loggedIn={!!user} />
      </main>
    )
  }

  // ── Programme admin: manage everyone, see the whole board ────────────────
  if (affiliate.is_admin) {
    const [scoreboard, roster] = await Promise.all([
      getScoreboard(affiliate.id, SCOREBOARD_ADMIN_SIZE),
      loadRoster(),
    ])
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <AdminAffiliateDashboard
          affiliate={affiliate as Affiliate}
          scoreboard={scoreboard}
          initialAffiliates={roster}
        />
      </main>
    )
  }

  // ── Ordinary affiliate: their own figures, top of the board ──────────────
  // The scoreboard reads every affiliate's earnings, so it is only ever built
  // for a confirmed affiliate — `affiliate` above is that check.
  const [stats, { data: commissions }, scoreboard] = await Promise.all([
    getAffiliateStats(affiliate),
    createClient()
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
      .limit(50),
    getScoreboard(affiliate.id),
  ])

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <AffiliateDashboard
        affiliate={affiliate}
        stats={stats}
        commissions={(commissions as AffiliateCommission[]) ?? []}
        scoreboard={scoreboard}
      />
    </main>
  )
}
