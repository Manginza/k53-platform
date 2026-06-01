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

  // 3. Atomically claim the token for THIS account. The `status = 'ready'`
  //    filter means only the FIRST registration succeeds — the link is locked
  //    to one customer. A concurrent/second attempt updates 0 rows and is
  //    rejected, and we roll back the account it just created so nothing dangles.
  const { data: claimed, error: bindErr } = await admin
    .from('registration_tokens')
    .update({
      status: 'used',
      used_by_user_id: created.user.id,
      used_at: new Date().toISOString(),
      expires_at: grantExpiry(row.duration_days),
    })
    .eq('id', row.id)
    .eq('status', 'ready')
    .select('id')
    .maybeSingle()

  if (bindErr || !claimed) {
    // Someone else already used this link (or the update failed) — undo the account.
    await admin.auth.admin.deleteUser(created.user.id).catch(() => {})
    if (bindErr) console.error('[register-with-token] grant bind error:', bindErr.message)
    return NextResponse.json(
      { error: 'This registration link has already been used. Please contact us for a new link.' },
      { status: 409 },
    )
  }

  return NextResponse.json({ ok: true })
}
