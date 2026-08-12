/**
 * POST /api/affiliate/track
 *
 * Records a referral-link click for analytics. Called by <ReferralCapture>
 * when a visitor arrives with ?ref=CODE. Silently ignores unknown codes.
 *
 * Body: { code: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { normalizeReferralCode } from '@/lib/referral'

export async function POST(req: NextRequest) {
  let code: string | undefined
  try {
    ({ code } = await req.json())
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  code = normalizeReferralCode(code) ?? undefined
  if (!code) return NextResponse.json({ ok: false }, { status: 400 })

  const admin = createAdminClient()

  const { data: affiliate } = await admin
    .from('affiliates')
    .select('id')
    .eq('code', code)
    .eq('status', 'active')
    .maybeSingle()

  // Unknown / inactive code — accept quietly so we don't leak which codes exist
  if (!affiliate) return NextResponse.json({ ok: true })

  const { error } = await admin.from('affiliate_clicks').insert({ affiliate_id: affiliate.id, code })
  if (error) {
    console.error('[affiliate/track] click insert failed', { affiliateId: affiliate.id, error: error.message })
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
