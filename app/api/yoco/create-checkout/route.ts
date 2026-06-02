/**
 * POST /api/yoco/create-checkout
 *
 * Creates a Yoco Hosted Checkout for the R150 / 60-day pass. Requires a
 * logged-in account (register-before-pay). The buyer's user id is put in the
 * Yoco metadata so the payment can be tied back to their account and access
 * granted on return. Affiliate attribution (30%) is included if a ref cookie
 * is present.
 *
 * Returns { redirectUrl, checkoutId } or 401 if not logged in.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createYocoCheckout } from '@/lib/yoco'
import { REF_COOKIE } from '@/lib/affiliate'
import { ACCESS_PRICE_CENTS, ACCESS_DURATION_DAYS } from '@/lib/contact'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.skdriving.co.za'

export async function POST() {
  if (!process.env.YOCO_SECRET_KEY) {
    return NextResponse.json({ error: 'Online payment is not available right now. Please use WhatsApp.' }, { status: 503 })
  }

  // Must be registered + logged in.
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Please create an account or log in before paying.' }, { status: 401 })
  }

  // Affiliate attribution from the referral cookie (no self-referrals).
  const refCode = cookies().get(REF_COOKIE)?.value
  const affiliateMeta: Record<string, string> = {}
  if (refCode) {
    const { data: aff } = await createAdminClient()
      .from('affiliates').select('id, user_id, commission_rate').eq('code', refCode).eq('status', 'active').maybeSingle()
    if (aff && aff.user_id !== user.id) {
      affiliateMeta.affiliateId = aff.id
      affiliateMeta.commissionRate = String(aff.commission_rate)
    }
  }

  try {
    const checkout = await createYocoCheckout({
      amountInCents: ACCESS_PRICE_CENTS,
      successUrl: `${BASE_URL}/subscribe/success`,
      cancelUrl:  `${BASE_URL}/pricing`,
      failureUrl: `${BASE_URL}/subscribe/failed`,
      metadata: { userId: user.id, durationDays: String(ACCESS_DURATION_DAYS), product: 'full-access-60day', ...affiliateMeta },
    })
    return NextResponse.json({ redirectUrl: checkout.redirectUrl, checkoutId: checkout.id })
  } catch (err) {
    console.error('[create-checkout] Yoco error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Payment service is temporarily unavailable. Please try WhatsApp instead.' }, { status: 502 })
  }
}
