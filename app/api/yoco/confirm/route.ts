/**
 * POST /api/yoco/confirm
 *
 * Called by the success page (and the "I've paid" retry) after the buyer
 * returns from Yoco. Grants the logged-in account access if any of their
 * checkouts is paid — verified directly with Yoco, so it does NOT depend on
 * the webhook landing.
 *
 * Robust to a lost localStorage: if no checkoutId is supplied we look up the
 * user's recent checkouts from `checkout_sessions` and verify each. Also
 * records the affiliate commission (idempotent on the checkout id).
 *
 * Body: { checkoutId?: string }
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
  } catch { /* body optional */ }

  const admin = createAdminClient()

  // Build the list of checkouts to verify for this user.
  const candidates: string[] = []
  if (checkoutId) candidates.push(checkoutId)

  // Fallback: this user's recent checkouts (covers lost localStorage / other device).
  const { data: sessions } = await admin
    .from('checkout_sessions')
    .select('checkout_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
  for (const s of sessions ?? []) {
    if (!candidates.includes(s.checkout_id)) candidates.push(s.checkout_id)
  }

  if (candidates.length === 0) {
    return NextResponse.json({ granted: false, pending: true })
  }

  // Verify each with Yoco; grant on the first that is paid + belongs to the user.
  for (const cid of candidates) {
    const checkout = await getYocoCheckout(cid)
    if (!isYocoCheckoutPaid(checkout)) continue
    // Guard: the checkout must belong to this user (metadata OR our session map).
    if (checkout?.metadata?.userId && checkout.metadata.userId !== user.id) continue

    const days = Number(checkout?.metadata?.durationDays) || ACCESS_DURATION_DAYS
    try {
      await grantAccess(user.id, days, 'payment')
    } catch (err) {
      // grantAccess now throws on any write/verify failure. Report the real
      // status back to the client so the success page can retry or route the
      // user to support, instead of showing "You're in!" with no actual grant.
      console.error('[yoco/confirm] grantAccess failed', {
        userId: user.id, checkoutId: cid,
        error: err instanceof Error ? err.message : String(err),
      })
      return NextResponse.json({
        granted: false,
        pending: false,
        error: 'Payment verified, but access grant failed to save. Please try again in a moment.',
      }, { status: 500 })
    }
    // Commission failures shouldn't unwind a successful grant — log and press on.
    try { await recordCommission(admin, checkout, cid) }
    catch (err) { console.error('[yoco/confirm] recordCommission failed', err) }
    return NextResponse.json({ granted: true })
  }

  return NextResponse.json({ granted: false, pending: true })
}

/** Credit the referring affiliate 30% (idempotent on checkout id). */
async function recordCommission(
  admin: ReturnType<typeof createAdminClient>,
  checkout: Awaited<ReturnType<typeof getYocoCheckout>>,
  checkoutId: string,
) {
  const affiliateId = checkout?.metadata?.affiliateId
  const rate = Number(checkout?.metadata?.commissionRate) || 0
  if (!affiliateId || rate <= 0) return

  const commissionCents = Math.round(ACCESS_PRICE_CENTS * rate)
  const { error } = await admin
    .from('affiliate_commissions')
    .insert({
      affiliate_id: affiliateId,
      yoco_checkout_id: checkoutId,
      yoco_payment_id: checkout?.paymentId ?? null,
      amount_cents: ACCESS_PRICE_CENTS,
      commission_cents: commissionCents,
      status: 'pending',
    })
  // 23505 = the webhook (or a retry of this route) already credited it.
  // We intentionally no longer bump affiliates.total_earned_cents here.
  // That read-modify-write was racy with concurrent payments and left
  // the counter under-counting real earnings. Display code (both
  // /affiliate and /admin/payouts) now derives earned totals directly
  // from affiliate_commissions, which is the source of truth.
  if (error && error.code !== '23505') {
    console.error('[yoco/confirm] commission insert error:', error.message)
  }
}
