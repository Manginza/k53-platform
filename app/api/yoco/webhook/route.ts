/**
 * POST /api/yoco/webhook
 *
 * On payment.succeeded, mark the registration token 'ready' so the buyer can
 * create their account at /register?token=…. Idempotent and resilient: if the
 * token row is missing (e.g. the create-checkout insert failed) it is created.
 *
 * Register this URL in Yoco Dashboard → Developers → Webhooks.
 * Uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) — keep it secret.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { verifyYocoSignature } from '@/lib/yoco'
import { REG_DURATION_DAYS } from '@/lib/registration'

interface YocoEventPayload {
  id?: string
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

  try {
    if (type === 'payment.succeeded') {
      const token = payload?.metadata?.token
      if (!token) {
        console.error('[yoco-webhook] payment.succeeded with no token in metadata.')
      } else {
        await markTokenReady(token, Number(payload?.metadata?.durationDays) || REG_DURATION_DAYS, payload?.id)
        console.log(`[yoco-webhook] Registration token ${token} marked ready.`)
      }

      // Affiliate commission (30% of the payment), if attributed to one.
      await recordAffiliateCommission(payload)
    } else {
      console.log(`[yoco-webhook] Unhandled event type: ${type}`)
    }
  } catch (err) {
    console.error('[yoco-webhook] Processing error:', err instanceof Error ? err.message : err)
  }

  return NextResponse.json({ received: true })
}

async function markTokenReady(token: string, durationDays: number, checkoutId?: string) {
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('registration_tokens')
    .select('id, status')
    .eq('token', token)
    .maybeSingle()

  if (existing) {
    // Don't downgrade an already-used token.
    if (existing.status === 'pending') {
      await admin.from('registration_tokens').update({ status: 'ready' }).eq('id', existing.id)
    }
    return
  }

  await admin.from('registration_tokens').insert({
    token,
    source: 'payment',
    status: 'ready',
    duration_days: durationDays,
    label: 'Online payment (Yoco)',
    yoco_checkout_id: checkoutId ?? null,
    created_by: 'yoco',
  })
}

/** Credit the referring affiliate 30% of the payment (idempotent per payment). */
async function recordAffiliateCommission(payload: YocoEventPayload) {
  const affiliateId = payload?.metadata?.affiliateId
  if (!affiliateId) return

  const amountCents = payload.amountInCents ?? 0
  const rate = Number(payload?.metadata?.commissionRate) || 0
  const commissionCents = Math.round(amountCents * rate)
  if (commissionCents <= 0) return

  const admin = createAdminClient()

  // Idempotent: unique yoco_payment_id stops a retried webhook double-crediting.
  const { data: inserted, error } = await admin
    .from('affiliate_commissions')
    .insert({
      affiliate_id:     affiliateId,
      yoco_payment_id:  payload.id,
      amount_cents:     amountCents,
      commission_cents: commissionCents,
      status:           'pending',
    })
    .select('id')
    .maybeSingle()

  if (error) {
    if (error.code !== '23505') console.error('[yoco-webhook] commission insert error:', error.message)
    return
  }
  if (!inserted) return

  // Bump the affiliate's lifetime earned total.
  const { data: aff } = await admin.from('affiliates').select('total_earned_cents').eq('id', affiliateId).maybeSingle()
  if (aff) {
    await admin.from('affiliates')
      .update({ total_earned_cents: (aff.total_earned_cents ?? 0) + commissionCents })
      .eq('id', affiliateId)
  }
  console.log(`[yoco-webhook] Commission ${commissionCents}c credited to affiliate ${affiliateId}.`)
}
