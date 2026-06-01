/**
 * POST /api/yoco/create-checkout
 *
 * Creates a Yoco Hosted Checkout for the R150 / 60-day full-access pass.
 * No login required — purchase is anonymous. We generate an access code up
 * front and pass it in the Yoco metadata + success URL. On payment success
 * the webhook activates that code, and the success page redeems it onto the
 * buyer's device (httpOnly cookie). WhatsApp remains an alternative.
 *
 * Returns { redirectUrl, code }.
 */
import { NextResponse } from 'next/server'
import { createYocoCheckout } from '@/lib/yoco'
import { generateAccessCode } from '@/lib/access'
import { ACCESS_PRICE_CENTS, ACCESS_DURATION_DAYS } from '@/lib/contact'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.skdriving.co.za'

export async function POST() {
  if (!process.env.YOCO_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Online payment is not available right now. Please use WhatsApp.' },
      { status: 503 },
    )
  }

  // Pre-generate the access code the buyer will receive on success.
  const code = generateAccessCode()

  try {
    const checkout = await createYocoCheckout({
      amountInCents: ACCESS_PRICE_CENTS,
      successUrl: `${BASE_URL}/subscribe/success?code=${encodeURIComponent(code)}`,
      cancelUrl:  `${BASE_URL}/pricing`,
      failureUrl: `${BASE_URL}/subscribe/failed`,
      metadata: {
        code,
        durationDays: String(ACCESS_DURATION_DAYS),
        product: 'full-access-60day',
      },
    })
    return NextResponse.json({ redirectUrl: checkout.redirectUrl, code })
  } catch (err) {
    console.error('[create-checkout] Yoco error:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Payment service is temporarily unavailable. Please try WhatsApp instead.' },
      { status: 502 },
    )
  }
}
