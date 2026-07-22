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
import { verifyYocoSignature } from '@/lib/yoco'
import { grantAccess } from '@/lib/access'
import { ACCESS_DURATION_DAYS, ACCESS_PRICE_CENTS } from '@/lib/contact'

interface YocoEventPayload {
  id?: string
  checkoutId?: string
  amountInCents?: number
  metadata?: Record<string, string>
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const secret = process.env.YOCO_WEBHOOK_SECRET
  if (secret) {
    const sig = req.headers.get('X-Yoco-Signature') ?? ''
    if (!verifyYocoSignature(rawBody, sig, secret)) {
      console.warn('[yoco-webhook] Invalid signature — rejected.')
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
    }
  } else {
    console.warn('[yoco-webhook] YOCO_WEBHOOK_SECRET not set — skipping signature check.')
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
    const userId = payload?.metadata?.userId
    const checkoutId = payload?.checkoutId ?? payload?.id
    if (userId) {
      const days = Number(payload?.metadata?.durationDays) || ACCESS_DURATION_DAYS
      try {
        await grantAccess(userId, days, 'payment')
        console.log(`[yoco-webhook] Access granted to ${userId} for ${days} days (checkout=${checkoutId}).`)
      } catch (err) {
        // grantAccess now throws instead of silently swallowing errors. Log
        // loudly so support/ops can find affected users. The synchronous
        // /api/yoco/confirm route will retry on the buyer's return, and any
        // future visit to a gated page can trigger recovery — but this log
        // is the trail if the buyer never comes back.
        console.error('[yoco-webhook] grantAccess FAILED — paid user may lack access!', {
          userId, checkoutId, days,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    } else {
      console.error('[yoco-webhook] payment.succeeded with no userId in metadata.', { checkoutId })
    }
    try { await recordAffiliateCommission(payload) }
    catch (err) { console.error('[yoco-webhook] recordAffiliateCommission failed', err) }
  } else {
    console.log(`[yoco-webhook] Unhandled event type: ${type}`)
  }

  return NextResponse.json({ received: true })
}

async function recordAffiliateCommission(payload: YocoEventPayload) {
  const affiliateId = payload?.metadata?.affiliateId
  const rate = Number(payload?.metadata?.commissionRate) || 0
  if (!affiliateId || rate <= 0) return

  const amountCents = payload.amountInCents ?? ACCESS_PRICE_CENTS
  const commissionCents = Math.round(amountCents * rate)
  if (commissionCents <= 0) return

  const admin = createAdminClient()
  const { error } = await admin
    .from('affiliate_commissions')
    .insert({
      affiliate_id:     affiliateId,
      yoco_checkout_id: payload.checkoutId ?? null,   // shared dedupe key with confirm
      yoco_payment_id:  payload.id ?? null,
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
