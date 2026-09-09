/**
 * lib/admin-emails.ts — admin allowlist (client-safe, no server imports).
 * Imported by both the server admin helper and the client login page.
 */
export const ADMIN_EMAILS = [
  'lungi09@gmail.com',
  'info@sikhululekile.org',
]

/**
 * Primary (super) admins. They see everything, including all card-payment
 * data — readiness, recovery, access codes, affiliate payouts — and the
 * site-wide config (free promo, recording, trainers).
 *
 * Every other entry in ADMIN_EMAILS is a SECONDARY admin: they manage
 * admin-added members only and never see card payments. Keep this a strict
 * subset of ADMIN_EMAILS.
 */
export const PRIMARY_ADMIN_EMAILS = [
  'lungi09@gmail.com',
]

/** True if the given email belongs to an admin (case-insensitive). */
export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * True only for a primary (super) admin. A secondary admin — an admin who is
 * not on this list — returns false, which is what gates card-payment data and
 * site config away from them.
 */
export function isPrimaryAdminEmail(email?: string | null): boolean {
  return !!email && PRIMARY_ADMIN_EMAILS.includes(email.toLowerCase())
}
