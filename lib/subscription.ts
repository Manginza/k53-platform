/**
 * lib/subscription.ts — Server-side subscription status helpers.
 *
 * Usage in a Server Component or API route:
 *   const sub = await getUserSubscription()
 *   if (isPremium(sub.status)) { ... }
 *
 * FUTURE: import isPremium in page/layout components to gate premium content.
 */

import { createClient } from '@/lib/supabase-server'

// ─── Types ───────────────────────────────────────────────────────────────────

export type SubscriptionStatus = 'free' | 'active' | 'pending' | 'expired' | 'failed'

export interface UserSubscription {
  status:           SubscriptionStatus
  planName:         string | null
  planSlug:         string | null
  interval:         string | null   // 'monthly' | 'yearly'
  currentPeriodEnd: string | null   // ISO timestamp
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FREE: UserSubscription = {
  status: 'free',
  planName: null,
  planSlug: null,
  interval: null,
  currentPeriodEnd: null,
}

/**
 * Returns the current user's subscription details.
 * Reads the current session from cookies — must be called from a Server Component.
 */
export async function getUserSubscription(): Promise<UserSubscription> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return FREE

  const { data } = await supabase
    .from('user_subscriptions')
    .select(`
      status,
      current_period_end,
      subscription_plans ( name, slug, interval )
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return FREE

  const plan = data.subscription_plans as unknown as { name: string; slug: string; interval: string } | null
  const periodEnd = data.current_period_end ? new Date(data.current_period_end) : null
  const isActive  = data.status === 'active' && periodEnd && periodEnd > new Date()

  return {
    status:           isActive ? 'active' : (data.status as SubscriptionStatus),
    planName:         plan?.name  ?? null,
    planSlug:         plan?.slug  ?? null,
    interval:         plan?.interval ?? null,
    currentPeriodEnd: data.current_period_end ?? null,
  }
}

/** Returns true when the user has a valid paid subscription. */
export function isPremium(status: SubscriptionStatus): boolean {
  return status === 'active'
}

/** Human-readable expiry string, e.g. "31 Dec 2025". */
export function formatPeriodEnd(isoDate: string | null): string {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
