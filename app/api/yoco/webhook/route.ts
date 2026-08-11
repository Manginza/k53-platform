/**
 * POST /api/yoco/webhook  (backup to the synchronous /api/yoco/confirm)
 *
 * On payment.succeeded, grant the buyer's account 60 days of access and record
 * the affiliate commission. Idempotent: access is an upsert by user, and the
 * commission is deduped by the checkout id (shared with the confirm route).
 *
 * Register this URL in Yoco Dashboard → Developers → Webhooks.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import {
  getYocoCheckout,
  isYocoCheckoutPaid,
  verifyYocoSignature,
  type YocoCheckoutDetail,
} from '@/lib/yoco'
import { grantAccess } from '@/lib/access'
import { ACCESS_DURATION_DAYS, ACCESS_PRICE_CENTS } from '@/lib/contact'

interface YocoEventPayload {
  id?: string
  checkoutId?: string
  amount?: number
  amountInCents?: number
  metadata?: Record<string, string>
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const secret = process.env.YOCO_WEBHOOK_SECRET
  if (!secret) {
    console.error('[yoco-webhook] YOCO_WEBHOOK_SECRET is not configured — rejected.')
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 })
  }
  const webhookId = req.headers.get('webhook-id') ?? undefined
  const webhookTimestamp = req.headers.get('webhook-timestamp') ?? undefined
  const sig = req.headers.get('webhook-signature')
    ?? req.headers.get('X-Yoco-Signature')
    ?? ''
  if (!verifyYocoSignature(rawBody, sig, secret, webhookId, webhookTimestamp)) {
    console.warn('[yoco-webhook] Invalid signature — rejected.')
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  let event: { type: string; payload: YocoEventPayload }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const { type, payload } = event
  console.log(`[yoco-webhook] ${type} — payment ${payload?.id ?? 'n/a'}`)

  if (type === 'payment.succeeded') {
    // Current Yoco payment events only carry the checkout ID in the payment
    // metadata. Fetch the checkout to recover our original buyer metadata.
    const checkoutId = payload?.metadata?.checkoutId ?? payload?.checkoutId
    if (!checkoutId) {
      console.error('[yoco-webhook] payment.succeeded has no checkoutId.', { paymentId: payload?.id })
      return NextResponse.json({ error: 'Payment has no checkout identity.' }, { status: 422 })
    }

    const checkout = await getYocoCheckout(checkoutId)
    if (!isYocoCheckoutPaid(checkout)) {
      // A transient Yoco read should be retried instead of acknowledging the
      // webhook and permanently losing the independent access-grant backup.
      console.error('[yoco-webhook] checkout is not yet verifiably paid.', { checkoutId })
      return NextResponse.json({ error: 'Checkout could not be verified.' }, { status: 503 })
    }
    if (checkout?.amount !== ACCESS_PRICE_CENTS || checkout?.currency !== 'ZAR') {
      console.error('[yoco-webhook] paid checkout amount/currency mismatch.', {
        checkoutId, amount: checkout?.amount, currency: checkout?.currency,
      })
      return NextResponse.json({ error: 'Checkout amount does not match the product.' }, { status: 422 })
    }

    const admin = createAdminClient()
    const { data: mappedSession } = await admin
      .from('checkout_sessions')
      .select('user_id')
      .eq('checkout_id', checkoutId)
      .maybeSingle()
    const metadataUserId = checkout?.metadata?.userId
    if (metadataUserId && mappedSession?.user_id && metadataUserId !== mappedSession.user_id) {
      console.error('[yoco-webhook] checkout identity mismatch.', { checkoutId })
      return NextResponse.json({ error: 'Checkout identity mismatch.' }, { status: 422 })
    }
    const userId = metadataUserId ?? mappedSession?.user_id

    if (userId) {
      const days = Number(checkout?.metadata?.durationDays) || ACCESS_DURATION_DAYS
      try {
        await grantAccess(userId, days, 'payment')
        console.log(`[yoco-webhook] Access granted to ${userId} for ${days} days (checkout=${checkoutId}).`)
      } catch (err) {
        // Return a failure so Yoco can retry instead of acknowledging a paid
        // event whose access grant did not persist.
        console.error('[yoco-webhook] grantAccess FAILED — paid user may lack access!', {
          userId, checkoutId, days,
          error: err instanceof Error ? err.message : String(err),
        })
        return NextResponse.json({ error: 'Access grant failed.' }, { status: 500 })
      }
    } else {
      console.error('[yoco-webhook] payment.succeeded with no userId in metadata.', { checkoutId })
      return NextResponse.json({ error: 'Payment has no account identity.' }, { status: 422 })
    }
    try { await recordAffiliateCommission(checkout, checkoutId, payload?.id) }
    catch (err) { console.error('[yoco-webhook] recordAffiliateCommission failed', err) }
  } else {
    console.log(`[yoco-webhook] Unhandled event type: ${type}`)
  }

  return NextResponse.json({ received: true })
}

async function recordAffiliateCommission(
  checkout: YocoCheckoutDetail,
  checkoutId: string,
  paymentId?: string,
) {
  const affiliateId = checkout.metadata?.affiliateId
  const rate = Number(checkout.metadata?.commissionRate) || 0
  if (!affiliateId || rate <= 0) return

  const amountCents = checkout.amount ?? ACCESS_PRICE_CENTS
  const commissionCents = Math.round(amountCents * rate)
  if (commissionCents <= 0) return

  const admin = createAdminClient()
  const { error } = await admin
    .from('affiliate_commissions')
    .insert({
      affiliate_id:     affiliateId,
      yoco_checkout_id: checkoutId,   // shared dedupe key with confirm
      yoco_payment_id:  checkout.paymentId ?? paymentId ?? null,
      amount_cents:     amountCents,
      commission_cents: commissionCents,
      status:           'pending',
    })
  // 23505 = the synchronous /api/yoco/confirm (or a retry) already
  // credited this checkout — safe to ignore. See yoco/confirm for why
  // we intentionally no longer bump affiliates.total_earned_cents here.
  if (error && error.code !== '23505') {
    console.error('[yoco-webhook] commission insert error:', error.message)
  }
}
