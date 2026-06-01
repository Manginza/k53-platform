/**
 * POST /api/auth/register-with-token
 *
 * Creates an account using a valid registration token (from a card payment or
 * an admin link) and binds the access grant to the new user. The account is
 * auto-confirmed so the member can sign in immediately afterwards.
 *
 * Body: { token: string, email: string, password: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { grantExpiry } from '@/lib/registration'

export async function POST(req: NextRequest) {
  let token: string | undefined
  let email: string | undefined
  let password: string | undefined
  try {
    ({ token, email, password } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  token = token?.trim()
  email = email?.trim().toLowerCase()
  if (!token) return NextResponse.json({ error: 'Missing registration link token.' }, { status: 400 })
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })

  const admin = createAdminClient()

  // 1. Validate the token (must be paid / admin-issued and not yet used).
  const { data: row } = await admin
    .from('registration_tokens')
    .select('id, status, duration_days')
    .eq('token', token)
    .maybeSingle()

  if (!row) return NextResponse.json({ error: 'This registration link is invalid.' }, { status: 404 })
  if (row.status === 'used') return NextResponse.json({ error: 'This link has already been used to create an account.' }, { status: 409 })
  if (row.status !== 'ready') return NextResponse.json({ error: 'This link is not active yet. If you just paid, please wait a moment and retry.' }, { status: 409 })

  // 2. Create the account (auto-confirmed so they can sign in right away).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createErr || !created?.user) {
    const msg = createErr?.message ?? 'Could not create the account.'
    const dup = /registered|already|exists/i.test(msg)
    return NextResponse.json(
      { error: dup ? 'An account with this email already exists. Please log in instead.' : msg },
      { status: dup ? 409 : 400 },
    )
  }

  // 3. Bind the grant to the new user.
  const { error: bindErr } = await admin
    .from('registration_tokens')
    .update({
      status: 'used',
      used_by_user_id: created.user.id,
      used_at: new Date().toISOString(),
      expires_at: grantExpiry(row.duration_days),
    })
    .eq('id', row.id)
    .eq('status', 'ready')   // guard against a race / double-use

  if (bindErr) {
    console.error('[register-with-token] grant bind error:', bindErr.message)
    return NextResponse.json({ error: 'Account created but access could not be linked. Please contact support.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
