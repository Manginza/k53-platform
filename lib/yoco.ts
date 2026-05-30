/**
 * lib/yoco.ts — Yoco Payments API helpers (server-side only)
 *
 * Docs: https://developer.yoco.com/online/resources/integration-tools/payment-objects
 *
 * Environment variables required:
 *   YOCO_SECRET_KEY       — from Yoco Dashboard → Developers → API Keys
 *   YOCO_WEBHOOK_SECRET   — from Yoco Dashboard → Developers → Webhooks
 */

import { createHmac, timingSafeEqual } from 'crypto'

const YOCO_API = 'https://payments.yoco.com/api'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface YocoCheckoutParams {
  amountInCents: number
  currency?: string
  successUrl: string
  cancelUrl: string
  failureUrl: string
  /** Free-form key/value pairs returned in webhook payload.metadata */
  metadata?: Record<string, string>
}

export interface YocoCheckout {
  id: string
  redirectUrl: string
  status: string
}

// ─── Create Checkout ──────────────────────────────────────────────────────────

/**
 * Creates a Yoco Hosted Checkout session.
 * Returns a `redirectUrl` — send the user there to complete payment.
 * On completion Yoco calls your webhook and redirects the user to successUrl.
 */
export async function createYocoCheckout(
  params: YocoCheckoutParams,
): Promise<YocoCheckout> {
  const secretKey = process.env.YOCO_SECRET_KEY
  if (!secretKey) throw new Error('YOCO_SECRET_KEY is not set')

  const res = await fetch(`${YOCO_API}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      // Idempotency key prevents duplicate charges on retries
      'Idempotency-Key': `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    },
    body: JSON.stringify({
      amount:     params.amountInCents,
      currency:   params.currency ?? 'ZAR',
      successUrl: params.successUrl,
      cancelUrl:  params.cancelUrl,
      failureUrl: params.failureUrl,
      metadata:   params.metadata ?? {},
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Yoco API error ${res.status}: ${text}`)
  }

  return res.json() as Promise<YocoCheckout>
}

// ─── Webhook Signature Verification ──────────────────────────────────────────

/**
 * Verifies the HMAC-SHA256 signature Yoco sends in the
 * `X-Yoco-Signature` request header.
 *
 * Returns true if the payload matches the expected signature.
 */
export function verifyYocoSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  try {
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    // timingSafeEqual prevents timing-based attacks
    return timingSafeEqual(
      Buffer.from(signature.toLowerCase(), 'hex'),
      Buffer.from(expected, 'hex'),
    )
  } catch {
    return false
  }
}
