/**
 * lib/safe-next.ts — validate a post-login / post-reset "next" destination.
 *
 * Only same-site paths are allowed, so a poisoned link cannot send someone to
 * another site after they sign in. A bare "starts with / but not //" check is
 * not enough: browsers treat a backslash as a slash, so "/\evil.example" is
 * navigated to as "//evil.example" (another site). Backslashes and control
 * characters are therefore rejected outright, and the value must still parse
 * as a path on the same origin.
 *
 * Safe to import from both server and client code.
 */
export function safeNextPath(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 2048) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  // eslint-disable-next-line no-control-regex
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return null
  try {
    const parsed = new URL(raw, 'http://localhost')
    if (parsed.origin !== 'http://localhost') return null
  } catch {
    return null
  }
  return raw
}
