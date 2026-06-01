/**
 * lib/access.ts — full-access gate (account-based).
 *
 * A visitor has full access if EITHER:
 *   - they are a logged-in admin, OR
 *   - they are a logged-in user holding a valid (used, unexpired) registration
 *     token grant.
 *
 * Server-only. The grant read uses the RLS-scoped server client (the user may
 * read their own token via the reg_tokens_own_read policy).
 */
import { createClient } from '@/lib/supabase-server'
import { getAdminUser } from '@/lib/admin'

/** Whether the current visitor may see paid content. */
export async function hasFullAccess(): Promise<boolean> {
  // Admins always have access.
  if (await getAdminUser()) return true

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('registration_tokens')
    .select('expires_at')
    .eq('used_by_user_id', user.id)
    .eq('status', 'used')

  if (!data || data.length === 0) return false

  // Active if any grant is lifetime (null expiry) or not yet expired.
  const now = Date.now()
  return data.some(g => !g.expires_at || new Date(g.expires_at).getTime() > now)
}
