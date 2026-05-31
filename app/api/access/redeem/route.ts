/**
 * POST /api/access/redeem
 *
 * Redeems an access code issued by an admin. On first redemption the 60-day
 * window starts (activated_at / expires_at are set). Sets the httpOnly
 * `sk_access` cookie so the device keeps full access until expiry.
 *
 * Body: { code: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-admin'
import { ACCESS_COOKIE, codeIsValid } from '@/lib/access'

export async function POST(req: NextRequest) {
  let code: string | undefined
  try {
    ({ code } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  code = code?.trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Please enter your access code.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: row } = await admin
    .from('access_codes')
    .select('id, status, duration_days, activated_at, expires_at')
    .eq('code', code)
    .maybeSingle()

  if (!row || row.status !== 'active') {
    return NextResponse.json({ error: 'That code is invalid or has been revoked.' }, { status: 404 })
  }

  // Already expired?
  if (row.expires_at && new Date(row.expires_at) <= new Date()) {
    return NextResponse.json({ error: 'That code has expired.' }, { status: 410 })
  }

  // First redemption → start the clock.
  let expiresAt = row.expires_at as string | null
  if (!row.activated_at) {
    const now = new Date()
    const end = new Date(now)
    end.setDate(end.getDate() + (row.duration_days ?? 60))
    expiresAt = end.toISOString()
    await admin
      .from('access_codes')
      .update({ activated_at: now.toISOString(), expires_at: expiresAt })
      .eq('id', row.id)
  }

  if (!codeIsValid({ status: row.status, activated_at: row.activated_at ?? new Date().toISOString(), expires_at: expiresAt })) {
    return NextResponse.json({ error: 'That code can no longer be used.' }, { status: 410 })
  }

  // Persist access on this device until expiry.
  const maxAge = expiresAt
    ? Math.max(60, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
    : 60 * 60 * 24 * 60
  cookies().set(ACCESS_COOKIE, code, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
  })

  return NextResponse.json({ ok: true, expiresAt })
}
