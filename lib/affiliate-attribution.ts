import type { createAdminClient } from '@/lib/supabase-admin'
import type { YocoCheckoutDetail } from '@/lib/yoco'
import { normalizeReferralCode } from '@/lib/referral'

type AdminClient = ReturnType<typeof createAdminClient>

export interface AffiliateAttribution {
  affiliateId: string
  affiliateUserId: string
  commissionRate: number
  referralId: string
  referredUserId: string
  referralCode: string
}

async function loadAttribution(
  admin: AdminClient,
  referral: { id: string; affiliate_id: string; referred_user_id: string; code: string },
): Promise<AffiliateAttribution | null> {
  const { data: affiliate, error } = await admin
    .from('affiliates')
    .select('id, user_id, commission_rate, status')
    .eq('id', referral.affiliate_id)
    .maybeSingle()
  if (error) throw new Error(`Could not verify referral affiliate: ${error.message}`)
  if (!affiliate || affiliate.status !== 'active' || affiliate.user_id === referral.referred_user_id) return null

  return {
    affiliateId: affiliate.id,
    affiliateUserId: affiliate.user_id,
    commissionRate: Number(affiliate.commission_rate),
    referralId: referral.id,
    referredUserId: referral.referred_user_id,
    referralCode: referral.code,
  }
}

/**
 * Return the learner's durable attribution, creating it from the referral
 * cookie when needed. First attribution wins so a later link cannot steal an
 * already-referred learner.
 */
export async function resolveAffiliateAttribution(
  admin: AdminClient,
  referredUserId: string,
  rawCode?: string | null,
): Promise<AffiliateAttribution | null> {
  const { data: existing, error: existingError } = await admin
    .from('referrals')
    .select('id, affiliate_id, referred_user_id, code')
    .eq('referred_user_id', referredUserId)
    .maybeSingle()
  if (existingError) throw new Error(`Could not read referral attribution: ${existingError.message}`)
  if (existing) return loadAttribution(admin, existing)

  const code = normalizeReferralCode(rawCode)
  if (!code) return null

  const { data: affiliate, error: affiliateError } = await admin
    .from('affiliates')
    .select('id, user_id, commission_rate, status')
    .eq('code', code)
    .eq('status', 'active')
    .maybeSingle()
  if (affiliateError) throw new Error(`Could not verify referral code: ${affiliateError.message}`)
  if (!affiliate || affiliate.user_id === referredUserId) return null

  const { data: inserted, error: insertError } = await admin
    .from('referrals')
    .insert({ affiliate_id: affiliate.id, referred_user_id: referredUserId, code, status: 'signed_up' })
    .select('id, affiliate_id, referred_user_id, code')
    .single()

  if (!insertError && inserted) return loadAttribution(admin, inserted)

  if (insertError?.code === '23505') {
    const { data: raced, error: raceError } = await admin
      .from('referrals')
      .select('id, affiliate_id, referred_user_id, code')
      .eq('referred_user_id', referredUserId)
      .single()
    if (raceError) throw new Error(`Could not recover referral attribution: ${raceError.message}`)
    return loadAttribution(admin, raced)
  }

  throw new Error(`Could not save referral attribution: ${insertError?.message ?? 'unknown error'}`)
}

export function attributionMetadata(attribution: AffiliateAttribution): Record<string, string> {
  return {
    affiliateId: attribution.affiliateId,
    commissionRate: String(attribution.commissionRate),
    referralId: attribution.referralId,
    referredUserId: attribution.referredUserId,
    referralCode: attribution.referralCode,
  }
}

export function calculateCommissionCents(amountCents: number, rate: number): number {
  if (!Number.isInteger(amountCents) || amountCents <= 0) return 0
  if (!Number.isFinite(rate) || rate <= 0 || rate > 1) return 0
  return Math.round(amountCents * rate)
}

/** Record one commission per paid checkout and mark its referral converted. */
export async function recordAffiliateCommission(
  admin: AdminClient,
  checkout: YocoCheckoutDetail,
  checkoutId: string,
  fallbackPaymentId?: string,
): Promise<void> {
  const affiliateId = checkout.metadata?.affiliateId
  if (!affiliateId) return

  const { data: affiliate, error: affiliateError } = await admin
    .from('affiliates')
    .select('id, commission_rate, status')
    .eq('id', affiliateId)
    .maybeSingle()
  if (affiliateError) throw new Error(`Could not verify commission affiliate: ${affiliateError.message}`)
  if (!affiliate || affiliate.status !== 'active') return

  const snapshotRate = Number(checkout.metadata?.commissionRate)
  const rate = Number.isFinite(snapshotRate) && snapshotRate > 0 && snapshotRate <= 1
    ? snapshotRate
    : Number(affiliate.commission_rate)
  const amountCents = checkout.amount ?? 0
  const commissionCents = calculateCommissionCents(amountCents, rate)
  if (amountCents <= 0 || commissionCents <= 0) return

  const referralId = checkout.metadata?.referralId || null
  const referredUserId = checkout.metadata?.referredUserId || checkout.metadata?.userId || null

  if (referralId) {
    const { data: referral, error: referralError } = await admin
      .from('referrals')
      .select('id, affiliate_id, referred_user_id')
      .eq('id', referralId)
      .maybeSingle()
    if (referralError) throw new Error(`Could not verify commission referral: ${referralError.message}`)
    if (!referral || referral.affiliate_id !== affiliateId || referral.referred_user_id !== referredUserId) {
      throw new Error('Commission referral identity mismatch')
    }
  }

  const { error: insertError } = await admin
    .from('affiliate_commissions')
    .insert({
      affiliate_id: affiliateId,
      referral_id: referralId,
      referred_user_id: referredUserId,
      yoco_checkout_id: checkoutId,
      yoco_payment_id: checkout.paymentId ?? fallbackPaymentId ?? null,
      amount_cents: amountCents,
      commission_cents: commissionCents,
      status: 'pending',
    })
  if (insertError && insertError.code !== '23505') {
    throw new Error(`Could not record affiliate commission: ${insertError.message}`)
  }

  if (referralId) {
    const { error: conversionError } = await admin
      .from('referrals')
      .update({ status: 'converted', converted_at: new Date().toISOString() })
      .eq('id', referralId)
      .eq('affiliate_id', affiliateId)
    if (conversionError) throw new Error(`Could not mark referral converted: ${conversionError.message}`)
  }
}
