/**
 * lib/access.ts — full-access gate (replaces the old subscription paywall).
 *
 * A visitor has full access if EITHER:
 *   - they are a logged-in admin, OR
 *   - they hold a valid (active, activated, unexpired) access code in the
 *     httpOnly `sk_access` cookie.
 *
 * Server-only (reads cookies + service-role table). Used by the quiz timer
 * and the Resources / Videos / Live Notes gates.
 */
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-admin'
import { getAdminUser } from '@/lib/admin'

export const ACCESS_COOKIE = 'sk_access'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no easily-confused chars

/** Generates a member access code, e.g. "SK-7F3A-2K9D". */
export function generateAccessCode(): string {
  const block = () =>
    Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('')
  return `SK-${block()}-${block()}`
}

/** True if the access code is active, activated, and not expired. */
export function codeIsValid(row: {
  status: string
  activated_at: string | null
  expires_at: string | null
} | null): boolean {
  if (!row || row.status !== 'active' || !row.activated_at) return false
  if (row.expires_at && new Date(row.expires_at) <= new Date()) return false
  return true
}

/** Whether the current visitor may see paid content. */
export async function hasFullAccess(): Promise<boolean> {
  // Admins always have access.
  if (await getAdminUser()) return true

  const code = cookies().get(ACCESS_COOKIE)?.value
  if (!code) return false

  const admin = createAdminClient()
  const { data } = await admin
    .from('access_codes')
    .select('status, activated_at, expires_at')
    .eq('code', code)
    .maybeSingle()

  return codeIsValid(data)
}
