/**
 * POST /api/auth/register-with-token
 *
 * Registers an account using an admin-issued single-use signup link, then
 * grants it 60 days of access. The link is LOCKED to the first email that
 * uses it — a concurrent/second attempt is rejected (race-safe) and its
 * just-created account is rolled back. Only that email can then log in.
 *
 * Body: { token, email, password }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { grantAccess } from '@/lib/access'

export async function POST(req: NextRequest) {
  let token: string | undefined, email: string | undefined, password: string | undefined
  try {
    ({ token, email, password } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  token = token?.trim()
  email = email?.trim().toLowerCase()
  if (!token) return NextResponse.json({ error: 'Missing signup link token.' }, { status: 400 })
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })

  const admin = createAdminClient()

  // 1. Validate the link.
  const { data: row } = await admin
    .from('registration_tokens')
    .select('id, status, duration_days')
    .eq('token', token)
    .maybeSingle()
  if (!row) return NextResponse.json({ error: 'This signup link is invalid.' }, { status: 404 })
  if (row.status === 'used') return NextResponse.json({ error: 'This signup link has already been used to create an account.' }, { status: 409 })
  if (row.status !== 'ready') return NextResponse.json({ error: 'This signup link is no longer active.' }, { status: 409 })

  // 2. Create the account (auto-confirmed).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (createErr || !created?.user) {
    const dup = /registered|already|exists/i.test(createErr?.message ?? '')
    return NextResponse.json(
      { error: dup ? 'An account with this email already exists. Please log in instead.' : (createErr?.message ?? 'Could not create the account.') },
      { status: dup ? 409 : 400 },
    )
  }

  // 3. Atomically claim the link for THIS account (locks it to the first email).
  const days = row.duration_days ?? 60
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
  const { data: claimed, error: bindErr } = await admin
    .from('registration_tokens')
    .update({ status: 'used', used_by_user_id: created.user.id, used_at: new Date().toISOString(), expires_at: expires })
    .eq('id', row.id)
    .eq('status', 'ready')   // only the first claim wins
    .select('id')
    .maybeSingle()

  if (bindErr || !claimed) {
    await admin.auth.admin.deleteUser(created.user.id).catch(() => {})
    return NextResponse.json({ error: 'This signup link has already been used. Please request a new one.' }, { status: 409 })
  }

  // 4. Grant 60-day access to the new account.
  await grantAccess(created.user.id, days, 'admin')

  return NextResponse.json({ ok: true })
}
