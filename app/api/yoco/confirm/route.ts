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
 * Each checkout is applied at most once (see lib/payments.ts): a checkout
 * already in the payment ledger reports granted without touching the grant,
 * so revisiting this page never extends access, and a new checkout extends
 * an active window instead of resetting it.
 *
 * Body: { checkoutId?: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getYocoCheckout } from '@/lib/yoco'
import { recordAffiliateCommission } from '@/lib/affiliate-attribution'
import {
  appliedCheckoutIds, applyPaidCheckout, checkoutDurationDays, checkoutRejection, legacyCutoff,
} from '@/lib/payments'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 })

  let checkoutId: string | undefined
  try {
    ({ checkoutId } = await req.json())
  } catch { /* body optional */ }

  console.log('[yoco/confirm] called', { userId: user.id, suppliedCheckoutId: Boolean(checkoutId) })

  const admin = createAdminClient()

  // Build the list of checkouts to verify for this user.
  // Fallback: this user's recent checkouts (covers lost localStorage / other device).
  const { data: sessions, error: sessionsError } = await admin
    .from('checkout_sessions')
    .select('checkout_id, created_at')
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
  const mappedCreatedAt = new Map<string, number>(
    (sessions ?? []).map(s => [s.checkout_id as string, Date.parse(s.created_at)]),
  )
  const candidates = Array.from(mappedCreatedAt.keys())
  if (checkoutId && !candidates.includes(checkoutId)) candidates.unshift(checkoutId)

  if (candidates.length === 0) {
    return NextResponse.json({ granted: false, pending: true })
  }

  // Ledger + legacy cutoff: which of these checkouts may still be applied?
  let applied: Set<string>
  let cutoff: number
  try {
    ;[applied, cutoff] = await Promise.all([
      appliedCheckoutIds(admin, candidates),
      legacyCutoff(admin, user.id),
    ])
  } catch (error) {
    console.error('[yoco/confirm] ledger lookup failed', {
      userId: user.id, error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({
      granted: false,
      pending: false,
      error: 'We could not check your payment record. Please try again in a moment.',
    }, { status: 500 })
  }

  // Already applied (by the webhook, or an earlier visit here): the grant
  // exists — report success without extending it. The success page still
  // verifies /api/me/access before showing "You're in!".
  const alreadyApplied = candidates.find(cid => applied.has(cid))
  if (alreadyApplied) {
    console.log('[yoco/confirm] checkout already applied', { userId: user.id, checkoutId: alreadyApplied })
    return NextResponse.json({ granted: true })
  }

  // Verify each with Yoco; grant on the first that is paid + belongs to the user.
  for (const cid of candidates) {
    const createdAt = mappedCreatedAt.get(cid)
    if (createdAt !== undefined && createdAt < cutoff) {
      // Pre-ledger checkout, already applied when the grant was last written.
      continue
    }

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
    const rejection = checkoutRejection(checkout)
    if (rejection === 'not_paid') {
      console.warn('[yoco/confirm] checkout is not yet paid', {
        userId: user.id,
        checkoutId: cid,
        found: Boolean(checkout),
        status: checkout?.status ?? null,
        hasPaymentId: Boolean(checkout?.paymentId),
      })
      continue
    }
    if (rejection === 'amount_mismatch' || !checkout) {
      console.error('[yoco/confirm] paid checkout amount/currency mismatch', {
        userId: user.id, checkoutId: cid,
        amount: checkout?.amount, currency: checkout?.currency,
      })
      continue
    }
    // Guard: require an exact identity match in Yoco metadata or in our
    // durable checkout map. Merely knowing a paid checkout id is not enough.
    const metadataMatches = checkout.metadata?.userId === user.id
    if (!metadataMatches && !mappedCreatedAt.has(cid)) continue

    console.log('[yoco/confirm] verified paid checkout — applying', {
      userId: user.id, checkoutId: cid, days: checkoutDurationDays(checkout),
    })
    let result
    try {
      result = await applyPaidCheckout(admin, {
        checkout, checkoutId: cid, userId: user.id, eventType: 'confirm',
        rawPayload: { source: 'confirm', checkout },
      })
    } catch (err) {
      // applyPaidCheckout throws on any write/verify failure. Report the real
      // status back to the client so the success page can retry or route the
      // user to support, instead of showing "You're in!" with no actual grant.
      console.error('[yoco/confirm] applyPaidCheckout failed', {
        userId: user.id, checkoutId: cid,
        error: err instanceof Error ? err.message : String(err),
      })
      return NextResponse.json({
        granted: false,
        pending: false,
        error: 'Payment verified, but access grant failed to save. Please try again in a moment.',
      }, { status: 500 })
    }
    if (result.status === 'already_applied') {
      // The webhook won the race a moment ago — access is being granted there.
      console.log('[yoco/confirm] checkout applied concurrently by another route', { userId: user.id, checkoutId: cid })
      return NextResponse.json({ granted: true })
    }
    console.log('[yoco/confirm] access granted', { userId: user.id, checkoutId: cid, expiresAt: result.expiresAt })
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
