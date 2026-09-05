/**
 * POST /api/yoco/webhook — independent backup to synchronous confirmation.
 * Verifies Yoco, grants account access, and records any linked commission.
 *
 * Applying the checkout goes through the payment ledger (lib/payments.ts),
 * so Yoco retries and the confirm route racing this handler cannot grant the
 * same payment twice.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getYocoCheckout, verifyYocoSignature } from '@/lib/yoco'
import { recordAffiliateCommission } from '@/lib/affiliate-attribution'
import { applyPaidCheckout, checkoutRejection } from '@/lib/payments'

interface YocoEventPayload {
  id?: string
  amount?: number
  currency?: string
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
  if (!signature || (!req.headers.get('X-Yoco-Signature') && (!webhookId || !webhookTimestamp))) {
    console.error('[yoco-webhook] Missing signature headers — rejected.', {
      hasWebhookId: Boolean(webhookId),
      hasWebhookTimestamp: Boolean(webhookTimestamp),
      hasSignature: Boolean(signature),
    })
    return NextResponse.json({ error: 'Missing signature headers.' }, { status: 400 })
  }
  if (!verifyYocoSignature(rawBody, signature, secret, webhookId, webhookTimestamp)) {
    console.warn('[yoco-webhook] Invalid signature — rejected.')
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 403 })
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
  const rejection = checkoutRejection(checkout)
  if (rejection === 'not_paid' || !checkout) {
    console.error('[yoco-webhook] checkout is not yet verifiably paid.', { checkoutId })
    return NextResponse.json({ error: 'Checkout could not be verified.' }, { status: 503 })
  }
  if (rejection === 'amount_mismatch') {
    console.error('[yoco-webhook] paid checkout amount/currency mismatch.', {
      checkoutId, amount: checkout.amount, currency: checkout.currency,
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

  let result
  try {
    result = await applyPaidCheckout(admin, {
      checkout, checkoutId, userId, eventType: type, rawPayload: event, fallbackPaymentId: payload?.id,
    })
  } catch (error) {
    // Non-2xx → Yoco retries, which is what we want for a transient DB failure.
    console.error('[yoco-webhook] applyPaidCheckout failed.', {
      userId, checkoutId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Access grant failed.' }, { status: 500 })
  }
  if (result.status === 'already_applied') {
    // Retry of an event we already handled, or the confirm route got there first.
    console.log(`[yoco-webhook] checkout already applied (checkout=${checkoutId}).`)
    return NextResponse.json({ received: true })
  }
  console.log(`[yoco-webhook] Access granted to ${userId} until ${result.expiresAt} (checkout=${checkoutId}).`)

  try {
    await recordAffiliateCommission(admin, checkout, checkoutId, payload?.id)
  } catch (error) {
    // Access grant already succeeded — don't return 500 or Yoco will keep
    // retrying a webhook whose critical work is done, and may eventually
    // exhaust its retry budget.
    console.error('[yoco-webhook] affiliate commission failed (non-fatal, access already granted).', error)
  }

  return NextResponse.json({ received: true })
}
