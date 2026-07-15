import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { grantAccess } from '@/lib/access'

export async function POST(req: NextRequest) {
  let email: string | undefined, password: string | undefined
  try {
    ({ email, password } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  email = email?.trim().toLowerCase()
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })

  const admin = createAdminClient()

  const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (createErr || !created?.user) {
    const dup = /registered|already|exists/i.test(createErr?.message ?? '')
    return NextResponse.json(
      { error: dup ? 'An account with this email already exists. Please log in instead.' : (createErr?.message ?? 'Could not create the account.') },
      { status: dup ? 409 : 400 },
    )
  }

  // Grant 60-day access to the new account. grantAccess throws on any
  // upsert/verify failure so we surface the real cause instead of falsely
  // reporting ok:true on a silently-broken grant.
  try {
    await grantAccess(created.user.id, 60, 'admin_pass')
  } catch (err) {
    return NextResponse.json(
      { error: 'Account was created but the access grant failed to save. Check server logs.', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
