/**
 * POST /api/admin/tokens — create a registration link for a member (admin only).
 * The admin sends the resulting /register?token=… link to the member.
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
    const body = await req.json()
    label = (body.label ?? '').toString().trim()
    if (body.durationDays != null && Number(body.durationDays) > 0) durationDays = Math.floor(Number(body.durationDays))
  } catch { /* defaults */ }

  const db = createAdminClient()
  const token = generateRegistrationToken()
  const { data, error } = await db
    .from('registration_tokens')
    .insert({
      token,
      source: 'admin',
      status: 'ready',
      duration_days: durationDays,
      label: label || null,
      created_by: admin.email,
    })
    .select('*')
    .single()

  if (error || !data) {
    console.error('[admin/tokens] insert error:', error?.message)
    return NextResponse.json({ error: 'Could not create the registration link.' }, { status: 500 })
  }
  return NextResponse.json({ token: data })
}
