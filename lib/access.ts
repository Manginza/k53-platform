/**
 * lib/access.ts — full-access gate (register-before-pay model).
 *
 * Access is tied to a registered account via the access_grants table. A grant
 * is created by a verified card payment or by an admin. hasFullAccess = admin
 * OR a logged-in user with an active (unexpired) grant.
 */
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getAdminUser } from '@/lib/admin'
import { isFreePromoActive } from '@/lib/contact'

/** Whether the current visitor may see paid content. */
export async function hasFullAccess(): Promise<boolean> {
  // 24-hour free-access promotion — everyone gets full access while it runs.
  if (isFreePromoActive()) return true

  if (await getAdminUser()) return true

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('access_grants')
    .select('expires_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return false
  return !data.expires_at || new Date(data.expires_at).getTime() > Date.now()
}

/**
 * Grant (or extend) a user's access. Service-role write. Sets the window to
 * now + durationDays (null = lifetime). Idempotent — safe to call from both
 * the synchronous payment confirm and the webhook.
 */
export async function grantAccess(userId: string, durationDays: number | null, source = 'payment') {
  const admin = createAdminClient()
  const expires = durationDays == null
    ? null
    : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
  await admin.from('access_grants').upsert(
    { user_id: userId, expires_at: expires, source, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  )
}
