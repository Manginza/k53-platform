/**
 * lib/affiliate-admin.ts — who may run the affiliate programme.
 *
 * Two kinds of account qualify:
 *   - an affiliate whose row has `is_admin` (the programme owner), and
 *   - a primary platform admin, who already sees affiliate payouts at /admin.
 *
 * Programme admin means sight of every affiliate's bank details plus the
 * power to edit and delete them, so every route that manages affiliates must
 * start with requireAffiliateAdmin(). Server-only.
 */
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { isPrimaryAdminEmail } from '@/lib/admin-emails'
import type { User } from '@supabase/supabase-js'

export interface AffiliateAdmin {
  user: User
  /** The admin's own affiliate row, when they have one. */
  affiliateId: string | null
}

/**
 * The signed-in programme admin, or null. Reads the affiliate row with the
 * service-role key so the check does not depend on the caller's RLS view.
 */
export async function requireAffiliateAdmin(): Promise<AffiliateAdmin | null> {
  const { data: { user } } = await createClient().auth.getUser()
  if (!user) return null

  const { data, error } = await createAdminClient()
    .from('affiliates')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[affiliate-admin] could not read the affiliate row', {
      userId: user.id, error: error.message,
    })
    // Fail closed unless the platform allowlist already trusts this account.
    return isPrimaryAdminEmail(user.email) ? { user, affiliateId: null } : null
  }

  if (data?.is_admin) return { user, affiliateId: data.id }
  if (isPrimaryAdminEmail(user.email)) return { user, affiliateId: data?.id ?? null }
  return null
}
