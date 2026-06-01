/**
 * POST /api/yoco/webhook
 *
 * Receives Yoco payment events. On payment.succeeded we activate the access
 * code that was generated at checkout (passed in metadata), giving the buyer
 * 60 days of full access. Idempotent: re-runs upsert the same code by its
 * unique value.
 *
 * Register this URL in Yoco Dashboard → Developers → Webhooks.
 * Uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) — keep it secret.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { verifyYocoSignature } from '@/lib/yoco'
import { ACCESS_DURATION_DAYS } from '@/lib/contact'

interface YocoEventPayload {
  id?: string
  amountInCents?: number
  metadata?: Record<string, string>
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // ── Signature verification ───────────────────────────────────────────────
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
      const code = payload?.metadata?.code
      if (!code) {
        console.error('[yoco-webhook] payment.succeeded with no access code in metadata.')
      } else {
        const days = Number(payload?.metadata?.durationDays) || ACCESS_DURATION_DAYS
        await activateAccessCode(code, days)
        console.log(`[yoco-webhook] Access code ${code} activated for ${days} days.`)
      }
    } else {
      console.log(`[yoco-webhook] Unhandled event type: ${type}`)
    }
  } catch (err) {
    console.error('[yoco-webhook] Processing error:', err instanceof Error ? err.message : err)
  }

  // Always 200 so Yoco does not retry indefinitely.
  return NextResponse.json({ received: true })
}

/** Create or activate a paid access code with a fresh 60-day window. */
async function activateAccessCode(code: string, durationDays: number) {
  const admin = createAdminClient()
  const now = new Date()
  const end = new Date(now)
  end.setDate(end.getDate() + durationDays)

  const { data: existing } = await admin
    .from('access_codes')
    .select('id, activated_at')
    .eq('code', code)
    .maybeSingle()

  if (existing) {
    // Only start the clock once (idempotent on webhook retries).
    if (!existing.activated_at) {
      await admin
        .from('access_codes')
        .update({ status: 'active', activated_at: now.toISOString(), expires_at: end.toISOString() })
        .eq('id', existing.id)
    } else {
      await admin.from('access_codes').update({ status: 'active' }).eq('id', existing.id)
    }
    return
  }

  await admin.from('access_codes').insert({
    code,
    label: 'Online payment (Yoco)',
    status: 'active',
    duration_days: durationDays,
    activated_at: now.toISOString(),
    expires_at: end.toISOString(),
    created_by: 'yoco',
  })
}
