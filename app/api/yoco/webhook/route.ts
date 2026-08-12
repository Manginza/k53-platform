/**
 * POST /api/yoco/webhook — independent backup to synchronous confirmation.
 * Verifies Yoco, grants account access, and records any linked commission.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getYocoCheckout, isYocoCheckoutPaid, verifyYocoSignature } from '@/lib/yoco'
import { grantAccess } from '@/lib/access'
import { ACCESS_DURATION_DAYS, ACCESS_PRICE_CENTS } from '@/lib/contact'
import { recordAffiliateCommission } from '@/lib/affiliate-attribution'

interface YocoEventPayload {
  id?: string
  checkoutId?: string
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
  const signature = req.headers.get('webhook-signature')
    ?? req.headers.get('X-Yoco-Signature')
    ?? ''
  if (!verifyYocoSignature(rawBody, signature, secret, webhookId, webhookTimestamp)) {
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
  if (type !== 'payment.succeeded') {
    console.log(`[yoco-webhook] Unhandled event type: ${type}`)
    return NextResponse.json({ received: true })
  }

  const checkoutId = payload?.metadata?.checkoutId ?? payload?.checkoutId
  if (!checkoutId) {
    console.error('[yoco-webhook] payment.succeeded has no checkoutId.', { paymentId: payload?.id })
    return NextResponse.json({ error: 'Payment has no checkout identity.' }, { status: 422 })
  }

  const checkout = await getYocoCheckout(checkoutId)
  if (!isYocoCheckoutPaid(checkout)) {
    console.error('[yoco-webhook] checkout is not yet verifiably paid.', { checkoutId })
    return NextResponse.json({ error: 'Checkout could not be verified.' }, { status: 503 })
  }
  if (checkout?.amount !== ACCESS_PRICE_CENTS || checkout.currency !== 'ZAR') {
    console.error('[yoco-webhook] paid checkout amount/currency mismatch.', {
      checkoutId, amount: checkout?.amount, currency: checkout?.currency,
    })
    return NextResponse.json({ error: 'Checkout amount does not match the product.' }, { status: 422 })
  }

  const admin = createAdminClient()
  const { data: mappedSession, error: mappingError } = await admin
    .from('checkout_sessions')
    .select('user_id')
    .eq('checkout_id', checkoutId)
    .maybeSingle()
  if (mappingError) {
    console.error('[yoco-webhook] checkout mapping read failed.', { checkoutId, error: mappingError.message })
    return NextResponse.json({ error: 'Checkout identity could not be verified.' }, { status: 503 })
  }

  const metadataUserId = checkout.metadata?.userId
  if (metadataUserId && mappedSession?.user_id && metadataUserId !== mappedSession.user_id) {
    console.error('[yoco-webhook] checkout identity mismatch.', { checkoutId })
    return NextResponse.json({ error: 'Checkout identity mismatch.' }, { status: 422 })
  }
  const userId = metadataUserId ?? mappedSession?.user_id
  if (!userId) {
    console.error('[yoco-webhook] payment.succeeded has no account identity.', { checkoutId })
    return NextResponse.json({ error: 'Payment has no account identity.' }, { status: 422 })
  }

  const days = Number(checkout.metadata?.durationDays) || ACCESS_DURATION_DAYS
  try {
    await grantAccess(userId, days, 'payment')
    console.log(`[yoco-webhook] Access granted to ${userId} for ${days} days (checkout=${checkoutId}).`)
  } catch (error) {
    console.error('[yoco-webhook] grantAccess failed.', {
      userId, checkoutId, days,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Access grant failed.' }, { status: 500 })
  }

  try {
    await recordAffiliateCommission(admin, checkout, checkoutId, payload?.id)
  } catch (error) {
    // Yoco retries non-2xx responses. Both the access grant and commission
    // insert are idempotent, so a transient referral error cannot lose a sale.
    console.error('[yoco-webhook] affiliate commission failed.', error)
    return NextResponse.json({ error: 'Affiliate commission failed.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
