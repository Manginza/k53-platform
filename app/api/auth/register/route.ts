/**
 * POST /api/auth/register — open account registration.
 *
 * Anyone may create an account (auto-confirmed so they can sign in straight
 * away). The account has NO access until a payment grants it.
 *
 * Body: { email, password }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { resolveAffiliateAttribution } from '@/lib/affiliate-attribution'
import { REF_COOKIE } from '@/lib/referral'

export async function POST(req: NextRequest) {
  let email: string | undefined
  let password: string | undefined
  try {
    ({ email, password } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  email = email?.trim().toLowerCase()
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error || !created.user) {
    const message = error?.message ?? 'Could not create the account.'
    const dup = /registered|already|exists/i.test(message)
    return NextResponse.json(
      { error: dup ? 'An account with this email already exists. Please log in instead.' : message },
      { status: dup ? 409 : 400 },
    )
  }
  // Attribution is best-effort at registration. The same referral cookie is
  // resolved again at checkout (create-checkout), which is where commission is
  // actually recorded, so a transient failure here must never cost the learner
  // their account. Log it and continue rather than deleting the new user.
  try {
    await resolveAffiliateAttribution(admin, created.user.id, req.cookies.get(REF_COOKIE)?.value)
  } catch (attributionError) {
    console.error('[auth/register] referral attribution failed (account kept; will retry at checkout)', attributionError)
  }
  return NextResponse.json({ ok: true })
}
