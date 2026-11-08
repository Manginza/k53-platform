/**
 * POST /api/auth/forgot-password — send a password-reset link.
 *
 * Every reset email now goes through here, so the same protections apply to
 * all of them:
 *   1. The address must pass the shared email rules and DNS (lib/email-gate.ts),
 *      so a typo never produces an email that can only bounce.
 *   2. A CAPTCHA token must verify (lib/turnstile.ts), when it is configured.
 *   3. One reset per address per 60 seconds, and a few per network address per hour.
 *
 * It answers the same way whether or not an account exists, so the form cannot
 * be used to check who has an account. If the email provider refuses to send,
 * the user is told to wait, and nothing retries automatically.
 *
 * Body: { email, captchaToken?, next? }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { gateEmail } from '@/lib/email-gate'
import { verifyTurnstile, CAPTCHA_MESSAGE } from '@/lib/turnstile'
import { allow, secondsUntilAllowed, markAction, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const SAME_ADDRESS_GAP_MS = 60_000
const PER_NETWORK_PER_HOUR = 10

/** Sites the reset link may send people back to. Anything else falls back to the main site. */
const ALLOWED_ORIGINS = new Set([
  'https://www.skdriving.co.za',
  'https://skdriving.co.za',
  'https://sa-learners-licence.vercel.app',
  'http://localhost:3000',
])
const FALLBACK_ORIGIN = 'https://www.skdriving.co.za'

function safeNext(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

export async function POST(req: NextRequest) {
  let body: { email?: unknown; captchaToken?: unknown; next?: unknown } = {}
  try { body = await req.json() } catch { /* handled by the empty-email check */ }

  const ip = clientIp(req.headers)
  if (!allow(`reset-ip:${ip}`, PER_NETWORK_PER_HOUR, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'There have been too many requests from your connection. Please try again later.' }, { status: 429 })
  }

  const gate = await gateEmail(body.email)
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message, suggestion: gate.suggestion, problem: gate.problem }, { status: gate.status })
  }
  const email = gate.email

  const wait = secondsUntilAllowed(`reset:${email}`, SAME_ADDRESS_GAP_MS)
  if (wait > 0) {
    return NextResponse.json(
      { error: `A reset link was just sent to this address. Please wait ${wait} seconds before requesting another.`, retryAfter: wait },
      { status: 429 },
    )
  }

  const captcha = await verifyTurnstile(body.captchaToken, ip)
  if (!captcha.ok) {
    return NextResponse.json({ error: CAPTCHA_MESSAGE, problem: 'captcha' }, { status: 400 })
  }

  const originHeader = req.headers.get('origin') ?? ''
  const origin = ALLOWED_ORIGINS.has(originHeader) ? originHeader : FALLBACK_ORIGIN
  const next = safeNext(body.next)
  const redirectTo = `${origin}/reset-password${next ? `?next=${encodeURIComponent(next)}` : ''}`

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  markAction(`reset:${email}`)
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  if (error) {
    const code = (error as { code?: string }).code ?? ''
    if (code === 'over_email_send_rate_limit' || error.status === 429) {
      return NextResponse.json(
        { error: 'We have just sent a link. Please wait a minute before requesting another.', retryAfter: 60 },
        { status: 429 },
      )
    }
    console.error('[forgot-password] email provider refused', { code, status: error.status, message: error.message })
    return NextResponse.json(
      { error: 'We could not send the email right now. Please wait a few minutes and try again.' },
      { status: 503 },
    )
  }

  // The same answer whether or not an account exists.
  return NextResponse.json({ ok: true })
}
