/**
 * POST /api/yoco/claim — apply a payment and hand back its access code,
 * WITHOUT requiring the buyer to be signed in.
 *
 * Every other route to access needs a session. That is the gap this fills.
 * A buyer whose session expired while they were on Yoco's page comes back to
 * /subscribe/success, confirm returns 401, and nothing else can run for them
 * until the nightly sweep — which in production has meant most of a day
 * without the access they just paid for, and a message to support in the
 * meantime.
 *
 * The buyer still holds one thing that proves the purchase: the checkout id,
 * stashed before they were sent to Yoco. That is enough to finish the job for
 * them:
 *
 *   1. The id must map to a checkout WE created (checkout_sessions), so an
 *      unknown id costs nothing and never reaches Yoco.
 *   2. Yoco must confirm that checkout is genuinely paid.
 *   3. Access is applied to the account that STARTED the checkout — never to
 *      the caller, who is anonymous here. So this can only ever give someone
 *      the access they already bought.
 *   4. The access code for that payment is returned, so the buyer can unlock
 *      whichever account they end up signing in to.
 *
 * Returning the code to the holder of the checkout id is deliberate. The id is
 * long, random, and only the payer and Yoco ever see it; anyone holding it has
 * already paid, and the code grants nothing beyond that purchase.
 *
 * Body: { checkoutId: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getYocoCheckout } from '@/lib/yoco'
import { applyPaidCheckout, checkoutDurationDays, checkoutRejection } from '@/lib/payments'
import { findCodeForCheckout } from '@/lib/access-codes'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let checkoutId: string | undefined
  try {
    ({ checkoutId } = await req.json())
  } catch { /* handled below */ }

  if (typeof checkoutId !== 'string' || !checkoutId.trim()) {
    return NextResponse.json({ error: 'A checkout reference is required.' }, { status: 400 })
  }
  checkoutId = checkoutId.trim()

  const db = createAdminClient()

  // 1. Only ids we issued go any further. This is the guard that stops an
  //    unknown or guessed id from costing us a Yoco lookup.
  const { data: session, error: sessionError } = await db
    .from('checkout_sessions')
    .select('user_id')
    .eq('checkout_id', checkoutId)
    .maybeSingle()
  if (sessionError) {
    console.error('[yoco/claim] checkout lookup failed', { checkoutId, error: sessionError.message })
    return NextResponse.json({ error: 'We could not check that payment. Please try again in a moment.' }, { status: 500 })
  }
  // Deliberately vague: an unknown id should not confirm or deny anything.
  if (!session?.user_id) {
    return NextResponse.json({ applied: false, pending: true })
  }
  const userId = session.user_id as string

  // 2. Yoco is the authority on whether it was actually paid.
  let checkout
  try {
    checkout = await getYocoCheckout(checkoutId)
  } catch (error) {
    console.error('[yoco/claim] Yoco lookup failed', {
      checkoutId, error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'We could not reach the payment provider. Please try again shortly.' }, { status: 503 })
  }

  const rejection = checkoutRejection(checkout)
  if (rejection === 'not_paid' || !checkout) {
    // Still processing, or abandoned. Either way there is nothing to apply yet.
    return NextResponse.json({ applied: false, pending: true })
  }
  if (rejection === 'amount_mismatch') {
    console.error('[yoco/claim] amount mismatch', {
      checkoutId, amount: checkout.amount, currency: checkout.currency,
    })
    return NextResponse.json({ error: 'That payment does not match any of our products.' }, { status: 422 })
  }

  // The checkout's own metadata must agree with our mapping when it carries an
  // account at all, so a mismatch is never silently applied to the wrong one.
  const metadataUserId = checkout.metadata?.userId
  if (metadataUserId && metadataUserId !== userId) {
    console.error('[yoco/claim] checkout identity mismatch', { checkoutId })
    return NextResponse.json({ error: 'That payment could not be verified.' }, { status: 422 })
  }

  // 3. Apply it to the buyer's own account. Idempotent through the ledger, so
  //    racing the webhook or a later sweep cannot double-grant.
  let applied = false
  try {
    const result = await applyPaidCheckout(db, {
      checkout, checkoutId, userId, eventType: 'claim',
      rawPayload: { source: 'claim', checkout },
    })
    applied = result.status === 'granted'
    console.log('[yoco/claim] payment claimed', { userId, checkoutId, status: result.status })
  } catch (error) {
    // The code below is still worth returning: it is the buyer's way in even
    // when the grant write is what failed.
    console.error('[yoco/claim] applyPaidCheckout failed', {
      userId, checkoutId, error: error instanceof Error ? error.message : String(error),
    })
  }

  // 4. Hand back the code for this payment.
  const minted = await findCodeForCheckout(db, checkoutId)

  return NextResponse.json({
    applied,
    paid: true,
    code: minted?.code ?? null,
    durationDays: minted?.durationDays ?? checkoutDurationDays(checkout),
  })
}
