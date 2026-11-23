/**
 * lib/ga-server.ts — sends conversion events to Google Analytics 4 from the
 * SERVER (GA4 "Measurement Protocol").
 *
 * Why the server: a purchase is only certain once the payment is confirmed,
 * and that confirmation often happens when the buyer's browser is gone (the
 * Yoco webhook, a recovery sweep) or when we grant access ourselves after a
 * WhatsApp payment. A browser tag misses all of those.
 *
 * Switched on by configuration, never by code:
 *   GA_API_SECRET  — GA4 → Admin → Data streams → (your stream) →
 *                    Measurement Protocol API secrets → Create. Set it in
 *                    Vercel. It is a secret: never put it in code or chat.
 *   GA_MEASUREMENT_ID — optional; defaults to the site's own GA4 id below.
 * Without GA_API_SECRET every call here does nothing.
 *
 * Sending never throws and never blocks a payment: analytics must not be
 * able to fail a sale.
 */

const DEFAULT_MEASUREMENT_ID = 'G-ZZVWLTP51S'
const ENDPOINT = 'https://www.google-analytics.com/mp/collect'

/**
 * The visitor's GA client id, read from the first-party `_ga` cookie
 * ("GA1.1.1234567890.1700000000" -> "1234567890.1700000000"). Lets a server
 * event be tied to the same visitor (and so the same traffic source) as the
 * page views. Null when the cookie is absent (visitor declined analytics).
 */
export function clientIdFromCookieHeader(cookieHeader: string | null | undefined): string | null {
  const match = /(?:^|;\s*)_ga=GA\d+\.\d+\.([0-9]+\.[0-9]+)/.exec(cookieHeader ?? '')
  return match ? match[1] : null
}

export interface GaEvent {
  name: string
  params?: Record<string, string | number | boolean>
}

/**
 * Sends one event. `clientId` ties it to a visitor; without one a stable
 * pseudo id is derived from the user id so the event still counts (it will
 * just not carry a traffic source).
 */
export async function sendGaEvent(opts: {
  event: GaEvent
  clientId?: string | null
  userId?: string | null
}): Promise<void> {
  const secret = process.env.GA_API_SECRET?.trim()
  if (!secret) return

  const measurementId = process.env.GA_MEASUREMENT_ID?.trim() || DEFAULT_MEASUREMENT_ID
  const clientId = opts.clientId || (opts.userId ? `srv.${opts.userId}` : `srv.${Date.now()}`)

  try {
    const res = await fetch(
      `${ENDPOINT}?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(secret)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          ...(opts.userId ? { user_id: opts.userId } : {}),
          events: [{ name: opts.event.name, params: { engagement_time_msec: 1, ...opts.event.params } }],
        }),
        signal: AbortSignal.timeout(4000),
      },
    )
    // The endpoint answers 2xx even for malformed events, so a non-2xx here means a real fault.
    if (!res.ok) console.error('[ga] send failed', { status: res.status, event: opts.event.name })
  } catch (error) {
    console.error('[ga] send threw', { event: opts.event.name, error: error instanceof Error ? error.message : String(error) })
  }
}

/** A confirmed paid access purchase. `transactionId` dedupes it inside GA4. */
export function purchaseEvent(opts: { transactionId: string; valueRand: number; days: number; via: 'card' | 'whatsapp' }): GaEvent {
  return {
    name: opts.via === 'whatsapp' ? 'whatsapp_purchase' : 'purchase',
    params: {
      transaction_id: opts.transactionId,
      value: opts.valueRand,
      currency: 'ZAR',
      payment_method: opts.via,
      access_days: opts.days,
    },
  }
}
