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

export async function POST(req: NextRequest) {
  let code: string | undefined
  try {
    ({ code } = await req.json())
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
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

  await admin.from('affiliate_clicks').insert({ affiliate_id: affiliate.id, code })

  return NextResponse.json({ ok: true })
}
