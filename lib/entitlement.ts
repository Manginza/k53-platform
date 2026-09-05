/**
 * lib/entitlement.ts — how long a given buyer's purchase lasts.
 *
 * The standard window is ACCESS_DURATION_DAYS. Customers who were already
 * buying before it was shortened keep the old, longer window on every future
 * purchase, so shortening the plan never quietly takes days away from
 * someone who had been paying for more.
 *
 * The decision is made once, when the checkout is created, and written into
 * the Yoco metadata as durationDays. Everything downstream — the confirm
 * call, the webhook, the recovery sweep — already reads that metadata in
 * preference to the constant, so a grandfathered buyer gets their longer
 * window no matter which route ends up applying the payment, and no matter
 * how much later it lands.
 *
 * Who counts as grandfathered: anyone with evidence of having paid before
 * LEGACY_PLAN_CUTOVER. Two independent signals are checked, because neither
 * is complete on its own. The payment ledger only started recording rows
 * recently, and an old paying customer who later received an admin grant has
 * had the source on their access row overwritten.
 *
 * Someone who registered long ago but never paid is NOT grandfathered. They
 * were never on the old plan, so they buy the current one.
 */
import type { createAdminClient } from '@/lib/supabase-admin'
import { ACCESS_DURATION_DAYS, LEGACY_ACCESS_DURATION_DAYS, LEGACY_PLAN_CUTOVER } from '@/lib/contact'

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Whether the evidence puts this account on the old plan.
 *
 * Timestamps are epoch ms, or null when there is no such evidence. Kept
 * separate from the database reads so the rule itself can be tested.
 */
export function isLegacyCustomer(
  firstPaymentAt: number | null,
  firstPaidGrantAt: number | null,
  cutoverAt: number,
): boolean {
  const evidence = [firstPaymentAt, firstPaidGrantAt].filter(
    (at): at is number => at !== null && Number.isFinite(at),
  )
  if (evidence.length === 0) return false
  return Math.min(...evidence) < cutoverAt
}

/**
 * The access window this account's next purchase should buy.
 *
 * Throws if the lookup fails. The caller is creating a checkout, and selling
 * someone the wrong plan is worse than asking them to try again — the same
 * reasoning that makes /api/yoco/create-checkout refuse to proceed when it
 * cannot record the checkout against the account.
 */
export async function accessDurationDaysFor(db: AdminClient, userId: string): Promise<number> {
  const cutoverAt = Date.parse(LEGACY_PLAN_CUTOVER)
  if (!Number.isFinite(cutoverAt)) {
    throw new Error(`LEGACY_PLAN_CUTOVER is not a valid date: ${LEGACY_PLAN_CUTOVER}`)
  }

  const [paymentRes, grantRes] = await Promise.all([
    db.from('payment_history')
      .select('created_at')
      .eq('user_id', userId)
      .eq('status', 'succeeded')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
    db.from('access_grants')
      .select('created_at, source')
      .eq('user_id', userId)
      .eq('source', 'payment')
      .maybeSingle(),
  ])
  if (paymentRes.error) throw new Error(`Payment history read failed: ${paymentRes.error.message}`)
  if (grantRes.error) throw new Error(`Access grant read failed: ${grantRes.error.message}`)

  const parse = (value: string | null | undefined): number | null => {
    if (!value) return null
    const at = Date.parse(value)
    return Number.isFinite(at) ? at : null
  }

  const legacy = isLegacyCustomer(
    parse(paymentRes.data?.created_at as string | undefined),
    parse(grantRes.data?.created_at as string | undefined),
    cutoverAt,
  )
  return legacy ? LEGACY_ACCESS_DURATION_DAYS : ACCESS_DURATION_DAYS
}
