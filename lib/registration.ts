/**
 * lib/registration.ts — registration-token helpers (server-only).
 */
import { randomUUID } from 'crypto'

export const REG_DURATION_DAYS = 60

/** Unguessable URL-safe registration token (32 hex chars). */
export function generateRegistrationToken(): string {
  return randomUUID().replace(/-/g, '')
}

/** Compute the access expiry for a grant (null = lifetime). */
export function grantExpiry(durationDays: number | null | undefined): string | null {
  if (durationDays == null) return null
  const end = new Date()
  end.setDate(end.getDate() + durationDays)
  return end.toISOString()
}
