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
import { getPromoWindow, isPromoActiveNow } from '@/lib/settings'

/** Whether the current visitor may see paid content. */
export async function hasFullAccess(): Promise<boolean> {
  // Hardcoded promo checked first (immune to PostgREST caching issues)
  if (isFreePromoActive()) return true
  try {
    const window = await getPromoWindow()
    if (isPromoActiveNow(window)) return true
  } catch { /* fall through */ }

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

export interface GrantOptions {
  /**
   * When true, durationDays is ADDED to the remaining time of an active grant
   * instead of resetting the window to now + durationDays. Payments use this
   * so a member who renews early keeps the days they already paid for. A
   * lifetime grant (expires_at null) is never shortened. Default false keeps
   * the admin "set access to N days from today" behaviour.
   */
  extend?: boolean
}

/**
 * Grant (or extend) a user's access. Service-role write. Sets the window to
 * now + durationDays (null = lifetime), or extends the current window when
 * `extend` is set.
 *
 * NOT idempotent per payment on its own — callers applying a Yoco checkout
 * must go through applyPaidCheckout() in lib/payments.ts, which claims the
 * checkout in the payment ledger first so a retry / webhook+confirm race
 * cannot grant the same payment twice.
 *
 * Throws if the upsert fails so callers (the payment confirm route and the
 * webhook) can surface a real error instead of falsely reporting success —
 * the previous silent-failure version was the root cause of paid users who
 * saw "You're in!" but had no access_grants row and hit the paywall after
 * the free promo ended.
 *
 * Reads the row back after upsert to confirm the grant actually persisted
 * (belt-and-braces against transient failures where an insert returns
 * without error but the row isn't visible on the next read).
 */
export async function grantAccess(
  userId: string,
  durationDays: number | null,
  source = 'payment',
  options: GrantOptions = {},
): Promise<{ expiresAt: string | null }> {
  if (!userId) throw new Error('[grantAccess] userId is required')
  const admin = createAdminClient()

  let expires: string | null
  if (durationDays == null) {
    expires = null
  } else {
    let base = Date.now()
    if (options.extend) {
      const { data: existing, error: readError } = await admin
        .from('access_grants')
        .select('expires_at')
        .eq('user_id', userId)
        .maybeSingle()
      if (readError) {
        console.error('[grantAccess] existing grant read failed', { userId, source, error: readError.message })
        throw new Error(`grantAccess read failed: ${readError.message}`)
      }
      if (existing && existing.expires_at === null) {
        // Lifetime access already — a payment must not shorten it.
        return { expiresAt: null }
      }
      const current = existing?.expires_at ? Date.parse(existing.expires_at) : 0
      if (Number.isFinite(current)) base = Math.max(base, current)
    }
    expires = new Date(base + durationDays * 24 * 60 * 60 * 1000).toISOString()
  }

  const { error: upsertError } = await admin
    .from('access_grants')
    .upsert(
      { user_id: userId, expires_at: expires, source, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
  if (upsertError) {
    console.error('[grantAccess] upsert failed', { userId, source, error: upsertError.message })
    throw new Error(`grantAccess upsert failed: ${upsertError.message}`)
  }

  const { data: verified, error: verifyError } = await admin
    .from('access_grants')
    .select('expires_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (verifyError || !verified) {
    console.error('[grantAccess] verification read failed', { userId, source, error: verifyError?.message })
    throw new Error('grantAccess verification failed: row not visible after upsert')
  }

  return { expiresAt: verified.expires_at }
}
