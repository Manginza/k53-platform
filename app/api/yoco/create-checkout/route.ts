/**
 * POST /api/yoco/create-checkout
 *
 * Creates a Yoco Hosted Checkout for the R150 / 60-day full-access pass.
 * No login required. We pre-create a 'pending' registration token and pass it
 * in the Yoco metadata + success URL. On payment success the webhook marks the
 * token 'ready', and the success page sends the buyer to /register?token=… to
 * create their account and unlock access.
 *
 * Returns { redirectUrl, token }.
 */
import { NextResponse } from 'next/server'
import { createYocoCheckout } from '@/lib/yoco'
import { createAdminClient } from '@/lib/supabase-admin'
import { generateRegistrationToken, REG_DURATION_DAYS } from '@/lib/registration'
import { ACCESS_PRICE_CENTS } from '@/lib/contact'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.skdriving.co.za'

export async function POST() {
  if (!process.env.YOCO_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Online payment is not available right now. Please use WhatsApp.' },
      { status: 503 },
    )
  }

  const token = generateRegistrationToken()

  let checkout
  try {
    checkout = await createYocoCheckout({
      amountInCents: ACCESS_PRICE_CENTS,
      successUrl: `${BASE_URL}/subscribe/success?token=${token}`,
      cancelUrl:  `${BASE_URL}/pricing`,
      failureUrl: `${BASE_URL}/subscribe/failed`,
      metadata: { token, durationDays: String(REG_DURATION_DAYS), product: 'full-access-60day' },
    })
  } catch (err) {
    console.error('[create-checkout] Yoco error:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Payment service is temporarily unavailable. Please try WhatsApp instead.' },
      { status: 502 },
    )
  }

  // Record a pending token (webhook will mark it 'ready' on payment success).
  const admin = createAdminClient()
  const { error } = await admin.from('registration_tokens').insert({
    token,
    source: 'payment',
    status: 'pending',
    duration_days: REG_DURATION_DAYS,
    label: 'Online payment (Yoco)',
    yoco_checkout_id: checkout.id,
    created_by: 'yoco',
  })
  if (error) console.error('[create-checkout] token insert error:', error.message)

  return NextResponse.json({ redirectUrl: checkout.redirectUrl, token })
}
