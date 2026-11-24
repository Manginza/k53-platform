/**
 * lib/features.ts — feature flags.
 *
 * Each feature can be turned OFF without removing the code; flip the matching
 * env var in Vercel (Production) and redeploy to restore. Defaults are OFF
 * while we wait for AdSense approval — keeps the site as a clean publisher.
 *
 *   NEXT_PUBLIC_FEATURE_PAYMENTS   = 'on' → enable Yoco card checkout
 *   NEXT_PUBLIC_FEATURE_WHATSAPP   = 'on' → enable WhatsApp "buy access" CTAs
 *   NEXT_PUBLIC_FEATURE_AFFILIATE  = 'on' → enable affiliate programme + clicks
 *
 * These are NEXT_PUBLIC_ so the same value is visible on server and client.
 */

const on = (v: string | undefined) => (v ?? '').toLowerCase() === 'on' || v === '1' || v === 'true'

export const FEATURE_PAYMENTS  = on(process.env.NEXT_PUBLIC_FEATURE_PAYMENTS)
export const FEATURE_WHATSAPP  = on(process.env.NEXT_PUBLIC_FEATURE_WHATSAPP)
export const FEATURE_AFFILIATE = on(process.env.NEXT_PUBLIC_FEATURE_AFFILIATE)

/** True when any monetisation path is enabled. */
export const FEATURE_ANY_BUY = FEATURE_PAYMENTS || FEATURE_WHATSAPP

/**
 * EXPLAINERS_ENABLED
 *   false → no practice-test question shows an explanation: not the Learn
 *   button and panel, not the short text under the correct answer, and not
 *   the WhatsApp bot's "why". The written explanations stay in the database
 *   and in lib/explanations.ts; set this to true to bring all of them back.
 *   (Hidden on request, 24 Nov 2026.)
 */
export const EXPLAINERS_ENABLED = false
