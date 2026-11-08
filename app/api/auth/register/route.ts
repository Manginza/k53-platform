/**
 * POST /api/auth/register — open account registration.
 *
 * Anyone may create an account (auto-confirmed so they can sign in straight
 * away). The account has NO access until a payment grants it.
 *
 * The address must pass the email gate (rules and DNS) and, when configured,
 * the CAPTCHA. Accounts with unreachable addresses are never created, so they
 * can never be sent mail that bounces.
 *
 * Body: { email, password, captchaToken? }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { resolveAffiliateAttribution } from '@/lib/affiliate-attribution'
import { REF_COOKIE } from '@/lib/referral'
import { gateEmail } from '@/lib/email-gate'
import { verifyTurnstile, CAPTCHA_MESSAGE } from '@/lib/turnstile'
import { allow, clientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown; captchaToken?: unknown } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const ip = clientIp(req.headers)
  if (!allow(`register-ip:${ip}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'There have been too many sign-ups from your connection. Please try again later.' }, { status: 429 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (!password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })

  const gate = await gateEmail(body.email)
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message, suggestion: gate.suggestion, problem: gate.problem }, { status: gate.status })
  }
  const email = gate.email

  const captcha = await verifyTurnstile(body.captchaToken, ip)
  if (!captcha.ok) return NextResponse.json({ error: CAPTCHA_MESSAGE, problem: 'captcha' }, { status: 400 })

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
