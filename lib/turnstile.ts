/**
 * lib/turnstile.ts — server-side check of a Cloudflare Turnstile CAPTCHA token.
 *
 * Turnstile is the bot check on public sign-up and password reset. The browser
 * solves a small challenge and sends a token; this verifies it with Cloudflare.
 *
 * It is switched on by configuration, not by code:
 *   - TURNSTILE_SECRET_KEY set  → every protected request must carry a valid token.
 *   - TURNSTILE_SECRET_KEY unset → the check is skipped, so the site keeps working
 *     until the keys are added. A warning is logged on every request.
 *
 * The matching site key is NEXT_PUBLIC_TURNSTILE_SITE_KEY, read by the page
 * when the site is built. Neither key is written in the code.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type TurnstileResult = { ok: true } | { ok: false; reason: string }

export async function verifyTurnstile(token: unknown, ip?: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY is not set — CAPTCHA check skipped')
    return { ok: true }
  }
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return { ok: false, reason: 'missing' }
  }

  const body = new URLSearchParams({ secret, response: token })
  if (ip && ip !== 'unknown') body.set('remoteip', ip)

  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(5000) })
    const data = (await res.json().catch(() => null)) as { success?: boolean; 'error-codes'?: string[] } | null
    if (data?.success === true) return { ok: true }
    console.warn('[turnstile] token rejected', { codes: data?.['error-codes'] })
    return { ok: false, reason: 'rejected' }
  } catch (error) {
    // Cloudflare unreachable: fail closed here. A bot check that fails open
    // protects nothing, and the person can simply try again.
    console.error('[turnstile] verification failed', error instanceof Error ? error.message : error)
    return { ok: false, reason: 'unavailable' }
  }
}

/** Shared message shown when the check fails. */
export const CAPTCHA_MESSAGE = 'Please complete the security check and try again.'
