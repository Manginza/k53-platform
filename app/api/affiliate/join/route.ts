/**
 * POST /api/affiliate/join
 *
 * Enrols the authenticated user as an affiliate and returns their referral
 * code. Idempotent — returns the existing code if already enrolled.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { enrollAffiliate } from '@/lib/affiliate'

export async function POST() {
  const supabase = createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised — please log in first.' }, { status: 401 })
  }

  try {
    const affiliate = await enrollAffiliate(user.id)
    return NextResponse.json({ code: affiliate.code })
  } catch (err) {
    console.error('[affiliate/join] error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not enrol you as an affiliate.' }, { status: 500 })
  }
}
