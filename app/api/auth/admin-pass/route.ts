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

  // Grant 60-day access to the new account.
  await grantAccess(created.user.id, 60, 'admin_pass')

  return NextResponse.json({ ok: true })
}
