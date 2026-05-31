/**
 * POST /api/admin/codes — create a new access code (admin only).
 * Body: { label?: string, durationDays?: number }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { generateAccessCode } from '@/lib/access'
import { ACCESS_DURATION_DAYS } from '@/lib/contact'

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let label = ''
  let durationDays = ACCESS_DURATION_DAYS
  try {
    const body = await req.json()
    label = (body.label ?? '').toString().trim()
    if (body.durationDays != null && Number(body.durationDays) > 0) {
      durationDays = Math.floor(Number(body.durationDays))
    }
  } catch {
    /* defaults are fine */
  }

  const db = createAdminClient()

  // Retry on the (unlikely) code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAccessCode()
    const { data, error } = await db
      .from('access_codes')
      .insert({
        code,
        label: label || null,
        duration_days: durationDays,
        created_by: admin.email,
      })
      .select('*')
      .single()

    if (!error && data) return NextResponse.json({ code: data })
    if (error && error.code !== '23505') {
      console.error('[admin/codes] insert error:', error.message)
      return NextResponse.json({ error: 'Could not create the code.' }, { status: 500 })
    }
  }
  return NextResponse.json({ error: 'Could not generate a unique code. Try again.' }, { status: 500 })
}
