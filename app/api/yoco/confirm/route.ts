/**
 * POST /api/yoco/confirm
 *
 * Called by the success page after the buyer returns from Yoco. Verifies the
 * checkout was paid (directly with Yoco) and that it belongs to the current
 * user, then grants their account 60 days of access — synchronously, so it
 * does NOT depend on the webhook landing. Also records the affiliate
 * commission (idempotent on the checkout id).
 *
 * Body: { checkoutId: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getYocoCheckout, isYocoCheckoutPaid } from '@/lib/yoco'
import { grantAccess } from '@/lib/access'
import { ACCESS_DURATION_DAYS, ACCESS_PRICE_CENTS } from '@/lib/contact'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 })

  let checkoutId: string | undefined
  try {
    ({ checkoutId } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  if (!checkoutId) return NextResponse.json({ granted: false, error: 'Missing checkout.' }, { status: 400 })

  const checkout = await getYocoCheckout(checkoutId)
  if (!isYocoCheckoutPaid(checkout)) {
    return NextResponse.json({ granted: false, pending: true })
  }
  // The checkout must belong to this user.
  if (checkout?.metadata?.userId && checkout.metadata.userId !== user.id) {
    return NextResponse.json({ granted: false, error: 'This payment is linked to a different account.' }, { status: 403 })
  }

  const days = Number(checkout?.metadata?.durationDays) || ACCESS_DURATION_DAYS
  await grantAccess(user.id, days, 'payment')

  // Affiliate commission (idempotent on checkout id).
  const affiliateId = checkout?.metadata?.affiliateId
  const rate = Number(checkout?.metadata?.commissionRate) || 0
  if (affiliateId && rate > 0) {
    const admin = createAdminClient()
    const commissionCents = Math.round(ACCESS_PRICE_CENTS * rate)
    const { data: inserted, error } = await admin
      .from('affiliate_commissions')
      .insert({
        affiliate_id: affiliateId,
        yoco_checkout_id: checkoutId,
        yoco_payment_id: checkout?.paymentId ?? null,
        amount_cents: ACCESS_PRICE_CENTS,
        commission_cents: commissionCents,
        status: 'pending',
      })
      .select('id')
      .maybeSingle()
    if (!error && inserted) {
      const { data: aff } = await admin.from('affiliates').select('total_earned_cents').eq('id', affiliateId).maybeSingle()
      if (aff) await admin.from('affiliates').update({ total_earned_cents: (aff.total_earned_cents ?? 0) + commissionCents }).eq('id', affiliateId)
    }
  }

  return NextResponse.json({ granted: true })
}
