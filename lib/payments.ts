/**
 * lib/payments.ts — apply a verified-paid Yoco checkout to an account,
 * exactly once.
 *
 * Three routes can see the same paid checkout: the synchronous confirm call
 * from /subscribe/success, the Yoco webhook (which also retries), and the
 * admin reconcile job. Before this module each of them called grantAccess()
 * independently, which had two consequences:
 *
 *   1. Any paid checkout re-granted a fresh 60 days EVERY time it was seen.
 *      A member who reopened /subscribe/success (bookmark, back button,
 *      "Unlock my access") got their expiry pushed out again, and reconcile
 *      revived expired members from checkouts they paid months earlier.
 *   2. Because of (1) the grant had to RESET to now + 60 days rather than
 *      extend, so a member renewing early lost their remaining days.
 *
 * The fix is a ledger: `payment_history` has a unique index on
 * `yoco_checkout_id`, and applyPaidCheckout() inserts the ledger row FIRST.
 * Whoever wins the insert grants access (extending any active window); the
 * loser sees a unique-violation and knows the checkout is already applied.
 *
 * Checkouts that were paid before the ledger existed have no row. For those,
 * callers use legacyCutoff(): a checkout created before the account's grant
 * was last written was already applied by the old code (or superseded by an
 * admin grant) and must not be applied again.
 */
import type { createAdminClient } from '@/lib/supabase-admin'
import type { YocoCheckoutDetail } from '@/lib/yoco'
import { isYocoCheckoutPaid } from '@/lib/yoco'
import { grantAccess } from '@/lib/access'
import { ACCEPTED_ACCESS_PRICES_CENTS, ACCESS_DURATION_DAYS, ACCESS_PRICE_CENTS } from '@/lib/contact'

type AdminClient = ReturnType<typeof createAdminClient>

const UNIQUE_VIOLATION = '23505'

export type CheckoutRejection = 'not_paid' | 'amount_mismatch'

/**
 * Why a fetched checkout may NOT be applied, or null when it is a genuine
 * full-access payment: verifiably paid, in ZAR, for a price we have charged.
 */
export function checkoutRejection(checkout: YocoCheckoutDetail | null): CheckoutRejection | null {
  if (!isYocoCheckoutPaid(checkout)) return 'not_paid'
  const amount = checkout?.amount ?? -1
  if (checkout?.currency !== 'ZAR' || !ACCEPTED_ACCESS_PRICES_CENTS.includes(amount)) return 'amount_mismatch'
  return null
}

/** Access days this checkout buys (from Yoco metadata, else the default). */
export function checkoutDurationDays(checkout: YocoCheckoutDetail | null): number {
  return Number(checkout?.metadata?.durationDays) || ACCESS_DURATION_DAYS
}

/**
 * Checkout ids (from the given set) already recorded in the payment ledger,
 * i.e. already applied to an account.
 */
export async function appliedCheckoutIds(admin: AdminClient, checkoutIds: string[]): Promise<Set<string>> {
  if (checkoutIds.length === 0) return new Set()
  const { data, error } = await admin
    .from('payment_history')
    .select('yoco_checkout_id')
    .in('yoco_checkout_id', checkoutIds)
  if (error) throw new Error(`Payment ledger read failed: ${error.message}`)
  return new Set((data ?? []).map(r => r.yoco_checkout_id as string))
}

/**
 * Epoch ms before which this user's checkouts are considered already applied
 * (pre-ledger era). 0 when the user has never had a grant.
 */
export async function legacyCutoff(admin: AdminClient, userId: string): Promise<number> {
  const { data, error } = await admin
    .from('access_grants')
    .select('updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`Access grant read failed: ${error.message}`)
  const t = data?.updated_at ? Date.parse(data.updated_at) : 0
  return Number.isFinite(t) ? t : 0
}

export interface ApplyPaidCheckoutParams {
  checkout: YocoCheckoutDetail
  checkoutId: string
  userId: string
  /** Who applied it — 'confirm' | 'webhook:<type>' | 'reconcile'. Stored as yoco_event_type. */
  eventType: string
  /** Optional raw event / diagnostic payload for the audit row. */
  rawPayload?: unknown
  /** Payment id to store when the checkout itself doesn't carry one. */
  fallbackPaymentId?: string | null
}

export type ApplyPaidCheckoutResult =
  | { status: 'granted'; expiresAt: string | null }
  | { status: 'already_applied' }

/**
 * Record the checkout in the ledger and grant/extend access. Safe to call
 * from several places concurrently: exactly one caller grants.
 *
 * Throws when the ledger write or the grant fails. If the grant fails the
 * ledger claim is released so a retry can apply the payment.
 */
export async function applyPaidCheckout(
  admin: AdminClient,
  { checkout, checkoutId, userId, eventType, rawPayload, fallbackPaymentId }: ApplyPaidCheckoutParams,
): Promise<ApplyPaidCheckoutResult> {
  const { error: claimError } = await admin.from('payment_history').insert({
    user_id: userId,
    amount_cents: checkout.amount ?? ACCESS_PRICE_CENTS,
    currency: checkout.currency ?? 'ZAR',
    status: 'succeeded',
    yoco_payment_id: checkout.paymentId ?? fallbackPaymentId ?? null,
    yoco_checkout_id: checkoutId,
    yoco_event_type: eventType,
    raw_payload: rawPayload ?? null,
  })
  if (claimError) {
    if (claimError.code === UNIQUE_VIOLATION) return { status: 'already_applied' }
    throw new Error(`Payment ledger write failed: ${claimError.message}`)
  }

  try {
    const { expiresAt } = await grantAccess(userId, checkoutDurationDays(checkout), 'payment', { extend: true })
    return { status: 'granted', expiresAt }
  } catch (error) {
    // Release the claim so the payment isn't stranded as "applied" with no grant.
    const { error: releaseError } = await admin
      .from('payment_history')
      .delete()
      .eq('yoco_checkout_id', checkoutId)
    if (releaseError) {
      console.error('[applyPaidCheckout] grant failed AND ledger release failed — run admin reconcile', {
        userId, checkoutId, releaseError: releaseError.message,
      })
    }
    throw error
  }
}
