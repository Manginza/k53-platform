/**
 * lib/affiliate.ts — affiliate programme helpers.
 *
 * Affiliates self-register (name, email, bank details), get a referral code,
 * and earn 30% of every successful card payment made through their link.
 * Reads use the RLS-scoped server client; writes use the service-role client.
 */
import { createClient } from '@/lib/supabase-server'
import type { Affiliate, AffiliateStats } from '@/lib/types'
export { REF_COOKIE, REF_COOKIE_MAX_AGE } from '@/lib/referral'

/** Cookie that carries a referral code from landing → checkout. */
/** Affiliates earn 30% of every successful payment. */
export const COMMISSION_RATE = 0.30

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no easily-confused chars

/** Generates an 8-char referral code, e.g. "SK7F3A2K". */
export function generateAffiliateCode(): string {
  let code = 'SK'
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}

/** The current user's affiliate row, or null if they aren't an affiliate. */
export async function getAffiliateForUser(): Promise<Affiliate | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return (data as Affiliate) ?? null
}

/** Aggregated dashboard figures for an affiliate. */
export async function getAffiliateStats(affiliate: Affiliate): Promise<AffiliateStats> {
  const supabase = createClient()

  const [{ count: clicks }, { count: signups }, commissions] = await Promise.all([
    supabase.from('affiliate_clicks').select('*', { count: 'exact', head: true }).eq('affiliate_id', affiliate.id),
    supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('affiliate_id', affiliate.id),
    supabase.from('affiliate_commissions').select('commission_cents, status').eq('affiliate_id', affiliate.id),
  ])

  const rows = commissions.data ?? []
  // Derive earned / paid / pending straight from the commissions table.
  // The `affiliates.total_earned_cents` and `total_paid_cents` counters
  // used to be authoritative here but they drifted due to read-modify-
  // write races (concurrent webhook grants + concurrent payouts), so
  // affiliates would sometimes see under-counted "total earned" figures.
  // Summing here is O(n) per dashboard load — n is small (one row per
  // conversion) so this is fine.
  let earnedCents = 0
  let paidCents = 0
  let pendingCents = 0
  for (const c of rows) {
    const cents = c.commission_cents ?? 0
    earnedCents += cents
    if (c.status === 'paid') paidCents += cents
    else pendingCents += cents
  }

  return {
    clicks:      clicks ?? 0,
    signups:     signups ?? 0,
    conversions: rows.length,
    earnedCents,
    paidCents,
    pendingCents,
  }
}
