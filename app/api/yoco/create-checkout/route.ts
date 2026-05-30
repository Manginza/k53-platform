/**
 * POST /api/yoco/create-checkout
 *
 * Creates a Yoco Hosted Checkout for the requested subscription plan.
 * Returns { redirectUrl } — the client redirects the user there.
 *
 * Body: { planSlug: 'premium-monthly' | 'premium-annual' }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createYocoCheckout } from '@/lib/yoco'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sa-learners-licence.vercel.app'

export async function POST(req: NextRequest) {
  // 1. Require authentication
  const supabase = createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised — please log in first.' }, { status: 401 })
  }

  // 2. Parse body
  let planSlug: string | undefined
  try {
    ({ planSlug } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  if (!planSlug) {
    return NextResponse.json({ error: 'planSlug is required.' }, { status: 400 })
  }

  // 3. Look up plan
  const { data: plan, error: planErr } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('slug', planSlug)
    .eq('is_active', true)
    .single()

  if (planErr || !plan) {
    return NextResponse.json({ error: 'Subscription plan not found.' }, { status: 404 })
  }

  // 4. Create Yoco Hosted Checkout
  let checkout: Awaited<ReturnType<typeof createYocoCheckout>>
  try {
    checkout = await createYocoCheckout({
      amountInCents: plan.price_cents,
      successUrl:    `${BASE_URL}/subscribe/success?plan=${planSlug}`,
      cancelUrl:     `${BASE_URL}/pricing`,
      failureUrl:    `${BASE_URL}/subscribe/failed`,
      metadata: {
        userId:       user.id,
        userEmail:    user.email ?? '',
        planId:       plan.id,
        planSlug:     plan.slug,
        planInterval: plan.interval,
      },
    })
  } catch (err: any) {
    console.error('[create-checkout] Yoco error:', err.message)
    return NextResponse.json(
      { error: 'Payment service is temporarily unavailable. Please try again.' },
      { status: 502 },
    )
  }

  // 5. Persist pending subscription (upsert — one row per user)
  const { error: subErr } = await supabase.from('user_subscriptions').upsert(
    {
      user_id:          user.id,
      plan_id:          plan.id,
      status:           'pending',
      yoco_checkout_id: checkout.id,
      updated_at:       new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (subErr) console.error('[create-checkout] Upsert error:', subErr.message)

  return NextResponse.json({ redirectUrl: checkout.redirectUrl })
}
