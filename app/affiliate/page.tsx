/**
 * /affiliate — affiliate programme.
 *
 * - Logged-in affiliate → dashboard (link, earnings, payout/bank info)
 * - Otherwise → registration form (self-register, or enrol an existing login)
 */
import { createClient } from '@/lib/supabase-server'
import { getAffiliateForUser, getAffiliateStats } from '@/lib/affiliate'
import AffiliateRegister from '@/components/affiliate/AffiliateRegister'
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard'
import type { AffiliateCommission } from '@/lib/types'

export const dynamic = 'force-dynamic'

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

  const [stats, { data: commissions }] = await Promise.all([
    getAffiliateStats(affiliate),
    createClient()
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <AffiliateDashboard
        affiliate={affiliate}
        stats={stats}
        commissions={(commissions as AffiliateCommission[]) ?? []}
      />
    </main>
  )
}
