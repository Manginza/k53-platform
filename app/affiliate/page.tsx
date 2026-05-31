/**
 * /affiliate — affiliate programme dashboard.
 *
 * - Not logged in  → prompt to log in
 * - Logged in, not enrolled → <JoinAffiliate> CTA
 * - Enrolled → <AffiliateDashboard> with link, stats and commissions
 */
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getAffiliateForUser, getAffiliateStats } from '@/lib/affiliate'
import JoinAffiliate from '@/components/affiliate/JoinAffiliate'
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard'
import type { AffiliateCommission } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AffiliatePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Log in to access the affiliate programme</h1>
          <p className="text-sm text-gray-500 mb-6">
            Earn 20% commission for every friend who subscribes through your link.
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Log in
          </Link>
        </div>
      </main>
    )
  }

  const affiliate = await getAffiliateForUser()

  if (!affiliate) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <JoinAffiliate />
      </main>
    )
  }

  const [stats, { data: commissions }] = await Promise.all([
    getAffiliateStats(affiliate),
    supabase
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
