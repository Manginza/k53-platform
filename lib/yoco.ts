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

// ─── Fetch Checkout (verify payment on return) ────────────────────────────────

export interface YocoCheckoutDetail {
  id: string
  status: string                       // 'created' | 'started' | 'processing' | 'completed' | 'expired'
  amount?: number
  currency?: string
  paymentId?: string | null
  metadata?: Record<string, string>
}

/** Fetches a checkout so we can verify it was paid before granting access. */
export async function getYocoCheckout(id: string): Promise<YocoCheckoutDetail | null> {
  const secretKey = process.env.YOCO_SECRET_KEY
  if (!secretKey) throw new Error('YOCO_SECRET_KEY is not set')

  const res = await fetch(`${YOCO_API}/checkouts/${id}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })
  if (!res.ok) return null
  return res.json() as Promise<YocoCheckoutDetail>
}

/** True when a fetched checkout represents a completed/paid transaction. */
export function isYocoCheckoutPaid(c: YocoCheckoutDetail | null): boolean {
  if (!c) return false
  return c.status === 'completed' || !!c.paymentId
}

// ─── Webhook Signature Verification ──────────────────────────────────────────

/**
 * Verifies current Checkout API webhooks (`webhook-signature`, `webhook-id`,
 * and `webhook-timestamp`) including replay protection. A legacy raw-body
 * hex signature is accepted only when the current ID/timestamp headers are
 * absent, for compatibility with older registered endpoints.
 *
 * Returns true if the payload matches the expected signature.
 */
export function verifyYocoSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  webhookId?: string,
  webhookTimestamp?: string,
  toleranceSeconds = 180,
): boolean {
  try {
    if (!rawBody || !signatureHeader || !secret) return false

    // Current Checkout API webhook format. Yoco signs
    // `${webhook-id}.${webhook-timestamp}.${rawBody}` with the base64-decoded
    // portion of the whsec_ secret, then sends one or more `v1,<base64>`
    // signatures in the webhook-signature header.
    if (webhookId && webhookTimestamp) {
      const timestamp = Number(webhookTimestamp)
      if (!Number.isFinite(timestamp)) return false
      if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false

      const encodedSecret = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret
      const secretBytes = Buffer.from(encodedSecret, 'base64')
      if (secretBytes.length === 0) return false

      const expected = createHmac('sha256', secretBytes)
        .update(`${webhookId}.${webhookTimestamp}.${rawBody}`)
        .digest('base64')
      const expectedBytes = Buffer.from(expected)

      return signatureHeader.split(/\s+/).some(item => {
        const comma = item.indexOf(',')
        if (comma < 0 || item.slice(0, comma) !== 'v1') return false
        const candidate = Buffer.from(item.slice(comma + 1))
        return candidate.length === expectedBytes.length && timingSafeEqual(candidate, expectedBytes)
      })
    }

    // Legacy Checkout API compatibility for already-registered webhooks that
    // still send X-Yoco-Signature as a raw hex HMAC of the request body.
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    const candidate = Buffer.from(signatureHeader.toLowerCase(), 'hex')
    const expectedBytes = Buffer.from(expected, 'hex')
    return candidate.length === expectedBytes.length && timingSafeEqual(candidate, expectedBytes)
  } catch {
    return false
  }
}
