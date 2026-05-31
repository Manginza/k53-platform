/**
 * lib/affiliate.ts — affiliate / referral helpers.
 *
 * Reads (dashboard) use the RLS-scoped server client.
 * Writes (enrol, record referral, record commission) use the service-role
 * admin client and live in API routes / the Yoco webhook.
 */
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import type { Affiliate, AffiliateStats } from '@/lib/types'

/** Cookie that carries a referral code from landing → signup → checkout. */
export const REF_COOKIE = 'sk_ref'
export const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/** Default share of each successful payment paid to the referring affiliate. */
export const DEFAULT_COMMISSION_RATE = 0.2

// ─── Code generation ────────────────────────────────────────────────────────

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no easily-confused chars

/** Generates an 8-char referral code, e.g. "SK7F3A2K". */
export function generateAffiliateCode(): string {
  let code = 'SK'
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}

// ─── Reads (RLS-scoped) ─────────────────────────────────────────────────────

/** Returns the current user's affiliate row, or null if not enrolled. */
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

/** Aggregated dashboard figures for a given affiliate. */
export async function getAffiliateStats(affiliate: Affiliate): Promise<AffiliateStats> {
  const supabase = createClient()

  const [{ count: clicks }, referrals, commissions] = await Promise.all([
    supabase
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('affiliate_id', affiliate.id),
    supabase
      .from('referrals')
      .select('status')
      .eq('affiliate_id', affiliate.id),
    supabase
      .from('affiliate_commissions')
      .select('commission_cents, status')
      .eq('affiliate_id', affiliate.id),
  ])

  const refRows = referrals.data ?? []
  const commRows = commissions.data ?? []

  const pendingCents = commRows
    .filter(c => c.status !== 'paid')
    .reduce((sum, c) => sum + (c.commission_cents ?? 0), 0)

  return {
    clicks:      clicks ?? 0,
    signups:     refRows.length,
    conversions: refRows.filter(r => r.status === 'converted').length,
    earnedCents: affiliate.total_earned_cents,
    paidCents:   affiliate.total_paid_cents,
    pendingCents,
  }
}

// ─── Writes (service-role) ──────────────────────────────────────────────────

/**
 * Enrols a user as an affiliate, generating a unique code.
 * Idempotent: returns the existing affiliate if already enrolled.
 */
export async function enrollAffiliate(userId: string): Promise<Affiliate> {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('affiliates')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (existing) return existing as Affiliate

  // Retry on the (very unlikely) code collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAffiliateCode()
    const { data, error } = await admin
      .from('affiliates')
      .insert({ user_id: userId, code, commission_rate: DEFAULT_COMMISSION_RATE })
      .select('*')
      .single()

    if (!error && data) return data as Affiliate
    // 23505 = unique_violation; retry only on a code clash
    if (error && error.code !== '23505') throw new Error(error.message)
  }
  throw new Error('Could not generate a unique affiliate code. Please try again.')
}
