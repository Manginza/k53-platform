/**
 * POST /api/admin/tokens — create a unique signup link for a manually-added
 * member (admin only). Send them /register?token=… ; the first email to
 * register with it claims it (single use) and gets a 60-day access grant.
 *
 * Body: { label?: string, durationDays?: number }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { generateRegistrationToken, REG_DURATION_DAYS } from '@/lib/registration'

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let label = ''
  let durationDays = REG_DURATION_DAYS
  try {
    const b = await req.json()
    label = (b.label ?? '').toString().trim()
    if (b.durationDays != null && Number(b.durationDays) > 0) durationDays = Math.floor(Number(b.durationDays))
  } catch { /* defaults */ }

  const db = createAdminClient()
  const token = generateRegistrationToken()
  const { data, error } = await db
    .from('registration_tokens')
    .insert({ token, source: 'admin', status: 'ready', duration_days: durationDays, label: label || null, created_by: admin.email })
    .select('*')
    .single()

  if (error || !data) {
    console.error('[admin/tokens] insert error:', error?.message)
    return NextResponse.json({ error: 'Could not create the signup link.' }, { status: 500 })
  }
  return NextResponse.json({ token: data })
}
