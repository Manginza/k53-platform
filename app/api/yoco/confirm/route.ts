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
import { recordAffiliateCommission } from '@/lib/affiliate-attribution'

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
  // Fallback: this user's recent checkouts (covers lost localStorage / other device).
  const { data: sessions, error: sessionsError } = await admin
    .from('checkout_sessions')
    .select('checkout_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
  if (sessionsError) {
    console.error('[yoco/confirm] checkout session lookup failed', {
      userId: user.id,
      suppliedCheckoutId: Boolean(checkoutId),
      error: sessionsError.message,
    })
    if (!checkoutId) {
      return NextResponse.json({
        granted: false,
        pending: false,
        error: 'We could not find your checkout. Please try again in a moment.',
      }, { status: 500 })
    }
  }
  const mappedCheckoutIds = new Set<string>((sessions ?? []).map(s => s.checkout_id))
  const candidates = Array.from(mappedCheckoutIds)
  if (checkoutId && !candidates.includes(checkoutId)) candidates.unshift(checkoutId)

  if (candidates.length === 0) {
    return NextResponse.json({ granted: false, pending: true })
  }

  // Verify each with Yoco; grant on the first that is paid + belongs to the user.
  for (const cid of candidates) {
    let checkout
    try {
      checkout = await getYocoCheckout(cid)
    } catch (error) {
      console.error('[yoco/confirm] Yoco checkout lookup failed', {
        userId: user.id,
        checkoutId: cid,
        error: error instanceof Error ? error.message : String(error),
      })
      continue
    }
    if (!isYocoCheckoutPaid(checkout)) {
      console.warn('[yoco/confirm] checkout is not yet paid', {
        userId: user.id,
        checkoutId: cid,
        found: Boolean(checkout),
        status: checkout?.status ?? null,
        hasPaymentId: Boolean(checkout?.paymentId),
      })
      continue
    }
    if (checkout?.amount !== ACCESS_PRICE_CENTS || checkout?.currency !== 'ZAR') {
      console.error('[yoco/confirm] paid checkout amount/currency mismatch', {
        userId: user.id, checkoutId: cid,
        amount: checkout?.amount, currency: checkout?.currency,
      })
      continue
    }
    // Guard: require an exact identity match in Yoco metadata or in our
    // durable checkout map. Merely knowing a paid checkout id is not enough.
    const metadataMatches = checkout?.metadata?.userId === user.id
    if (!metadataMatches && !mappedCheckoutIds.has(cid)) continue

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
    try { await recordAffiliateCommission(admin, checkout, cid) }
    catch (err) { console.error('[yoco/confirm] recordCommission failed', err) }
    return NextResponse.json({ granted: true })
  }

  console.warn('[yoco/confirm] no paid checkout matched the signed-in account', {
    userId: user.id,
    candidateCount: candidates.length,
    suppliedCheckoutId: Boolean(checkoutId),
  })
  return NextResponse.json({ granted: false, pending: true })
}
