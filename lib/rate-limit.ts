/**
 * lib/rate-limit.ts — small in-memory limits for public email actions.
 *
 * Limits are kept per server instance. On Vercel that means a limit is
 * enforced within one warm instance, which is enough to stop a single
 * machine hammering "send reset link", and does not replace the limits
 * Supabase itself applies to email sending. Those are the backstop.
 */

const windows = new Map<string, number[]>()

/** Records a hit under `key`. Returns false once `limit` hits fall inside `windowMs`. */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (windows.get(key) ?? []).filter(t => now - t < windowMs)
  if (hits.length >= limit) {
    windows.set(key, hits)
    return false
  }
  hits.push(now)
  windows.set(key, hits)
  if (windows.size > 5000) {
    windows.forEach((v, k) => { if (v.every(t => now - t >= windowMs)) windows.delete(k) })
  }
  return true
}

/** Seconds left before `key` may act again, given a minimum gap between actions. */
const lastAction = new Map<string, number>()
export function secondsUntilAllowed(key: string, gapMs: number): number {
  const last = lastAction.get(key) ?? 0
  const wait = gapMs - (Date.now() - last)
  return wait > 0 ? Math.ceil(wait / 1000) : 0
}
export function markAction(key: string): void {
  lastAction.set(key, Date.now())
  if (lastAction.size > 5000) lastAction.clear()
}

/** The caller's address, as best the platform tells us. */
export function clientIp(headers: Headers): string {
  return (headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || headers.get('x-real-ip') || 'unknown'
}
