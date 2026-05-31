/**
 * POST /api/affiliate/record-referral
 *
 * Links a freshly-signed-up user to the affiliate whose code referred them.
 * Called from the signup page right after supabase.auth.signUp succeeds
 * (the user id comes from the signUp response, before email confirmation).
 *
 * Commission is only ever paid on an actual payment (see the Yoco webhook);
 * this row exists for signup attribution and dashboard stats.
 *
 * Body: { code: string, userId: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  let code: string | undefined
  let userId: string | undefined
  try {
    ({ code, userId } = await req.json())
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!code || !userId) return NextResponse.json({ ok: false }, { status: 400 })

  const admin = createAdminClient()

  const { data: affiliate } = await admin
    .from('affiliates')
    .select('id, user_id')
    .eq('code', code)
    .eq('status', 'active')
    .maybeSingle()

  if (!affiliate) return NextResponse.json({ ok: true }) // unknown code — ignore quietly

  // Don't let an affiliate refer themselves
  if (affiliate.user_id === userId) return NextResponse.json({ ok: true })

  // One referrer per user — ignore if a referral already exists
  await admin.from('referrals').upsert(
    {
      affiliate_id:     affiliate.id,
      referred_user_id: userId,
      code,
      status:           'signed_up',
    },
    { onConflict: 'referred_user_id', ignoreDuplicates: true },
  )

  return NextResponse.json({ ok: true })
}
