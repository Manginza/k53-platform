/**
 * lib/registration.ts — signup-link (registration token) helpers (server-only).
 *
 * Admin-issued unique signup links for manually-added members. A token is
 * single-use: the FIRST email to register with it claims it, and only that
 * account can then log in. On registration the account gets a 60-day access
 * grant. Uses the registration_tokens table (migration 10).
 */
import { randomUUID } from 'crypto'

export const REG_DURATION_DAYS = 60

/** Unguessable URL-safe registration token (32 hex chars). */
export function generateRegistrationToken(): string {
  return randomUUID().replace(/-/g, '')
}
