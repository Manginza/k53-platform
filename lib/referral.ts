/** Pure referral-link helpers safe to use in middleware and browser code. */
export const REF_COOKIE = 'sk_ref'
export const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/** Normalize case and reject values unsafe for a URL/cookie attribution key. */
export function normalizeReferralCode(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const code = value.trim().toUpperCase()
  return /^[A-Z0-9_-]{3,64}$/.test(code) ? code : null
}
