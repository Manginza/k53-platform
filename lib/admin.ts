/**
 * lib/admin.ts — admin allowlist + server-side admin check.
 *
 * Only these accounts may log in and manage the platform. Public signup is
 * disabled, so in practice only admins (and any future admin accounts added
 * here) can authenticate at all.
 */
import { createClient } from '@/lib/supabase-server'
import type { User } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/admin-emails'

export { ADMIN_EMAILS, isAdminEmail } from '@/lib/admin-emails'

/** Returns the current user only if they are an admin, otherwise null. */
export async function getAdminUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return isAdminEmail(user?.email) ? user : null
}
