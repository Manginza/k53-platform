/**
 * POST /api/yoco/webhook
 *
 * Receives and processes Yoco payment events.
 * Register this URL in Yoco Dashboard → Developers → Webhooks.
 *
 * Supported events:
 *   payment.succeeded  → activate subscription
 *   payment.failed     → mark subscription failed
 *
 * Uses the SERVICE ROLE KEY (bypasses RLS) — keep SUPABASE_SERVICE_ROLE_KEY secret.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyYocoSignature } from '@/lib/yoco'

// Service-role Supabase client for server-only webhook processing
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // ── Signature verification ───────────────────────────────────────────────
  const secret = process.env.YOCO_WEBHOOK_SECRET
  if (secret) {
    const sig = req.headers.get('X-Yoco-Signature') ?? ''
    if (!verifyYocoSignature(rawBody, sig, secret)) {
      console.warn('[yoco-webhook] Invalid signature — request rejected.')
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
    }
  } else {
    // Log a warning if webhook secret is not yet configured
    console.warn('[yoco-webhook] YOCO_WEBHOOK_SECRET is not set — skipping signature check.')
  }

  // ── Parse event ──────────────────────────────────────────────────────────
  let event: { type: string; payload: Record<string, any> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const { type, payload } = event
  console.log(`[yoco-webhook] ${type} — payment ${payload?.id ?? 'n/a'}`)

  try {
    switch (type) {
      // ── Payment succeeded ──────────────────────────────────────────────
      case 'payment.succeeded': {
        const { userId, planId, planInterval } = payload?.metadata ?? {}
        if (!userId || !planId) {
          console.error('[yoco-webhook] Missing userId or planId in metadata.')
          break
        }

        const now      = new Date()
        const periodEnd = new Date(now)
        if (planInterval === 'yearly') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1)
        }

        // Activate subscription
        await adminClient.from('user_subscriptions').upsert(
          {
            user_id:               userId,
            plan_id:               planId,
            status:                'active',
            current_period_start:  now.toISOString(),
            current_period_end:    periodEnd.toISOString(),
            yoco_payment_id:       payload.id,
            yoco_checkout_id:      payload.checkoutId ?? null,
            updated_at:            now.toISOString(),
          },
          { onConflict: 'user_id' },
        )

        // Fetch sub ID for history FK
        const { data: sub } = await adminClient
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', userId)
          .single()

        await adminClient.from('payment_history').insert({
          user_id:          userId,
          subscription_id:  sub?.id ?? null,
          plan_id:          planId,
          amount_cents:     payload.amountInCents ?? 0,
          currency:         'ZAR',
          status:           'succeeded',
          yoco_payment_id:  payload.id,
          yoco_checkout_id: payload.checkoutId ?? null,
          yoco_event_type:  type,
          raw_payload:      event,
        })
        console.log(`[yoco-webhook] Subscription activated for user ${userId} until ${periodEnd.toISOString()}`)
        break
      }

      // ── Payment failed ─────────────────────────────────────────────────
      case 'payment.failed': {
        const { userId } = payload?.metadata ?? {}
        if (!userId) break

        await adminClient
          .from('user_subscriptions')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('status', 'pending')

        await adminClient.from('payment_history').insert({
          user_id:         userId,
          amount_cents:    payload?.amountInCents ?? 0,
          currency:        'ZAR',
          status:          'failed',
          yoco_payment_id: payload?.id ?? null,
          yoco_event_type: type,
          raw_payload:     event,
        })
        console.log(`[yoco-webhook] Payment failed for user ${userId}`)
        break
      }

      default:
        console.log(`[yoco-webhook] Unhandled event type: ${type}`)
    }
  } catch (err) {
    // Log but return 200 so Yoco does not retry indefinitely
    console.error('[yoco-webhook] Processing error:', err)
  }

  // Always return 200 — Yoco retries on non-2xx
  return NextResponse.json({ received: true })
}
