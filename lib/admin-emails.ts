/**
 * lib/admin-emails.ts — admin allowlist (client-safe, no server imports).
 * Imported by both the server admin helper and the client login page.
 */
export const ADMIN_EMAILS = [
  'lungi09@gmail.com',
  'nongculababalwa168@gmail.com',
  'info@sikhululekile.org',
]

/** True if the given email belongs to an admin (case-insensitive). */
export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}
