/**
 * POST /api/access-code/redeem — unlock an account with a paid access code.
 *
 * The customer-operated route to access, for the cases the automatic ones
 * cannot reach: chiefly a buyer who signed up twice and is logged in to the
 * account that did not pay.
 *
 * Requires a signed-in account, and grants access to THAT account, not to
 * whoever the code was issued to. That is the point of it.
 *
 * Body: { code: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { grantAccess } from '@/lib/access'
import { normaliseCode, redeemFailureMessage, redeemRejection, type CodeRow } from '@/lib/access-codes'
import { ACCESS_DURATION_DAYS } from '@/lib/contact'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Please log in first, then enter your code to unlock this account.' },
      { status: 401 },
    )
  }

  let raw: string | undefined
  try {
    ({ code: raw } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Please enter your access code.' }, { status: 400 })
  }

  const code = normaliseCode(raw ?? '')
  if (!code) {
    return NextResponse.json(
      { error: 'That does not look like a valid code. It looks like SK-A3F9-KM2P-7QXW.' },
      { status: 400 },
    )
  }

  const db = createAdminClient()
  const { data: row, error: readError } = await db
    .from('access_codes')
    .select('id, code, status, duration_days, valid_until, redeemed_at')
    .eq('code', code)
    .maybeSingle()
  if (readError) {
    console.error('[access-code/redeem] lookup failed', { userId: user.id, error: readError.message })
    return NextResponse.json({ error: 'We could not check that code. Please try again in a moment.' }, { status: 500 })
  }

  const rejection = redeemRejection((row as CodeRow | null) ?? null, Date.now())
  if (rejection) {
    console.warn('[access-code/redeem] rejected', { userId: user.id, reason: rejection })
    return NextResponse.json({ error: redeemFailureMessage(rejection) }, { status: 400 })
  }

  // Claim the code before granting anything. The filter on redeemed_at is
  // what makes this single-use: two people submitting the same code at the
  // same moment cannot both match, so only one of them updates a row.
  const { data: claimed, error: claimError } = await db
    .from('access_codes')
    .update({
      status: 'redeemed',
      redeemed_by: user.id,
      redeemed_at: new Date().toISOString(),
      activated_at: new Date().toISOString(),
    })
    .eq('code', code)
    .is('redeemed_at', null)
    .select('id, duration_days')
  if (claimError) {
    console.error('[access-code/redeem] claim failed', { userId: user.id, error: claimError.message })
    return NextResponse.json({ error: 'We could not apply that code. Please try again in a moment.' }, { status: 500 })
  }
  if (!claimed?.length) {
    return NextResponse.json({ error: redeemFailureMessage('already_redeemed') }, { status: 400 })
  }

  const durationDays = (claimed[0].duration_days as number) || ACCESS_DURATION_DAYS
  try {
    // extend, so redeeming never shortens an account that already has time on it.
    const { expiresAt } = await grantAccess(user.id, durationDays, 'access_code', { extend: true })
    console.log('[access-code/redeem] access granted', { userId: user.id, durationDays, expiresAt })
    return NextResponse.json({ granted: true, durationDays, expiresAt })
  } catch (error) {
    // Hand the code back, otherwise a failed grant burns it and the customer
    // is left with a used code and no access — worse than where they started.
    await db.from('access_codes')
      .update({ status: 'active', redeemed_by: null, redeemed_at: null, activated_at: null })
      .eq('code', code)
    console.error('[access-code/redeem] grant failed, code released', {
      userId: user.id, error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Your code is valid but we could not unlock access just now. Please try again in a moment.' },
      { status: 500 },
    )
  }
}
