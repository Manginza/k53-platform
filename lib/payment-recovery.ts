/**
 * lib/payment-recovery.ts — find people who paid but never got access, and
 * give it to them.
 *
 * Three routes normally apply a paid checkout: the synchronous confirm when
 * the buyer returns from Yoco, the Yoco webhook, and a retry of either. Each
 * can miss:
 *
 *   - The buyer closes the tab on Yoco's page, so confirm never runs.
 *   - Their session expired while paying, so confirm returns 401.
 *   - The webhook is unreachable, misconfigured, or exhausts its retries
 *     against a transient database failure.
 *   - Yoco marks the checkout paid a moment after the buyer got back, so
 *     confirm polled a checkout that was still 'processing' and gave up.
 *
 * Any one of those used to end with the buyer messaging support. This module
 * is the automatic sweep that replaces that conversation. It is called from
 * three places, all of which need identical behaviour, which is why the logic
 * lives here rather than in any one route:
 *
 *   - /api/me/access — on demand, for the signed-in user, so a paid account
 *     heals the moment its owner loads any page.
 *   - /api/cron/reconcile — a scheduled sweep for buyers who never came back.
 *   - /api/admin/reconcile — the same sweep, run by hand, with a report.
 *
 * Everything here goes through applyPaidCheckout(), so the payment ledger
 * still guarantees each checkout is applied exactly once no matter how many
 * of these run at the same time.
 */
import type { createAdminClient } from '@/lib/supabase-admin'
import { getYocoCheckout } from '@/lib/yoco'
import { grantAccess } from '@/lib/access'
import { applyPaidCheckout, checkoutDurationDays, checkoutRejection } from '@/lib/payments'
import { ACCESS_DURATION_DAYS } from '@/lib/contact'

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * How far back a sweep looks. A checkout that was paid but never applied is
 * picked up by the on-demand path the next time its buyer visits, so the
 * scheduled sweep only has to cover people who stayed away. Past this window
 * an abandoned checkout would otherwise be re-checked against Yoco forever.
 */
export const DEFAULT_WINDOW_DAYS = 45

/** Yoco lookups one sweep may make, so a growing table cannot slow it down without bound. */
export const DEFAULT_MAX_VERIFICATIONS = 300

export interface RecoveryOutcome {
  checkout_id: string
  user_id: string
  email?: string
  status: string
  action: string
}

export interface RecoverOptions {
  /** Restrict the sweep to these accounts. Omit to sweep everyone. */
  userIds?: string[]
  /** Ignore checkouts created longer ago than this. Defaults to DEFAULT_WINDOW_DAYS. */
  withinDays?: number
  /** Hard cap on Yoco lookups. Defaults to DEFAULT_MAX_VERIFICATIONS. */
  maxVerifications?: number
  /** Resolve email addresses for the report. Off by default — it costs a call per account. */
  withEmails?: boolean
}

export interface RecoveryReport {
  /** Accounts examined. */
  checked: number
  /** Checkouts that resulted in a new grant. */
  fixed: number
  /** Yoco lookups made. */
  verified: number
  /** True when the verification cap stopped the sweep early. */
  truncated: boolean
  results: RecoveryOutcome[]
}

export interface SessionRow { checkout_id: string; user_id: string; created_at: string }
export interface GrantRow { user_id: string; expires_at: string | null; updated_at: string | null }
interface LedgerRow { yoco_checkout_id: string; user_id: string; created_at: string }

/** Whether this account's access is currently live. A null expiry is lifetime. */
export function hasActiveAccess(grant: GrantRow | undefined, now: number): boolean {
  if (!grant) return false
  if (grant.expires_at === null) return true
  const expiresAt = Date.parse(grant.expires_at)
  return Number.isFinite(expiresAt) && expiresAt > now
}

/**
 * Whether the ledger recorded a payment the grant never reflected — what a
 * grant write that failed after the ledger claim leaves behind.
 *
 * Only meaningful when access is not live, so an active member is never
 * re-granted off the back of a payment already reflected in their window.
 */
export function needsLedgerRepair(
  grant: GrantRow | undefined,
  latestPaymentAt: number | undefined,
  now: number,
): boolean {
  if (hasActiveAccess(grant, now)) return false
  if (!latestPaymentAt) return false
  if (!grant) return true
  if (grant.expires_at === null) return false          // lifetime, handled by hasActiveAccess
  const expiresAt = Date.parse(grant.expires_at)
  if (!Number.isFinite(expiresAt)) return true
  // Access ran out before that payment landed, so the payment bought nothing.
  return expiresAt < latestPaymentAt
}

/**
 * Checkouts worth asking Yoco about: not already in the ledger, and not from
 * before this account's last grant write.
 *
 * That second rule is the pre-ledger cutoff. Checkouts older than the grant
 * were already applied by the code that ran before the ledger existed, so
 * re-applying them would hand out free days.
 *
 * Note this deliberately does NOT skip accounts with live access. A member
 * who renewed early still paid, grantAccess extends rather than resets, and
 * skipping them here is what silently swallowed renewal payments.
 */
export function pendingCheckouts(
  sessions: readonly SessionRow[],
  grant: GrantRow | undefined,
  appliedCheckouts: ReadonlySet<string>,
): SessionRow[] {
  const cutoff = grant?.updated_at ? Date.parse(grant.updated_at) : 0
  const safeCutoff = Number.isFinite(cutoff) ? cutoff : 0
  return sessions.filter(row => {
    if (appliedCheckouts.has(row.checkout_id)) return false
    const createdAt = Date.parse(row.created_at)
    if (!Number.isFinite(createdAt)) return false
    return createdAt >= safeCutoff
  })
}

/**
 * Applies every paid-but-unapplied checkout it can find, and repairs grants
 * that the ledger says were paid for but which never landed.
 *
 * Never throws for a single bad account: a failure is recorded in `results`
 * and the sweep moves on, so one unreachable checkout cannot stop everyone
 * else from being fixed.
 */
export async function recoverPaidAccess(
  db: AdminClient,
  options: RecoverOptions = {},
): Promise<RecoveryReport> {
  const {
    userIds,
    withinDays = DEFAULT_WINDOW_DAYS,
    maxVerifications = DEFAULT_MAX_VERIFICATIONS,
    withEmails = false,
  } = options

  const now = Date.now()
  const windowStart = new Date(now - withinDays * 24 * 60 * 60 * 1000).toISOString()

  let sessionQuery = db
    .from('checkout_sessions')
    .select('checkout_id, user_id, created_at')
    .gte('created_at', windowStart)
    .order('created_at', { ascending: false })
  if (userIds?.length) sessionQuery = sessionQuery.in('user_id', userIds)

  let grantQuery = db.from('access_grants').select('user_id, expires_at, updated_at')
  if (userIds?.length) grantQuery = grantQuery.in('user_id', userIds)

  let ledgerQuery = db
    .from('payment_history')
    .select('yoco_checkout_id, user_id, created_at')
    .eq('status', 'succeeded')
  if (userIds?.length) ledgerQuery = ledgerQuery.in('user_id', userIds)

  const [sessionsRes, grantsRes, ledgerRes] = await Promise.all([sessionQuery, grantQuery, ledgerQuery])
  const loadError = sessionsRes.error ?? grantsRes.error ?? ledgerRes.error
  if (loadError) throw new Error(`Payment recovery load failed: ${loadError.message}`)

  const sessions = (sessionsRes.data ?? []) as SessionRow[]
  const grants = (grantsRes.data ?? []) as GrantRow[]
  const ledger = (ledgerRes.data ?? []) as LedgerRow[]

  const grantByUser = new Map(grants.map(g => [g.user_id, g]))
  const appliedCheckouts = new Set(ledger.map(l => l.yoco_checkout_id))
  const latestPaymentByUser = new Map<string, number>()
  for (const row of ledger) {
    const at = Date.parse(row.created_at)
    if (!Number.isFinite(at)) continue
    if (at > (latestPaymentByUser.get(row.user_id) ?? 0)) latestPaymentByUser.set(row.user_id, at)
  }

  const sessionsByUser = new Map<string, SessionRow[]>()
  for (const row of sessions) {
    const list = sessionsByUser.get(row.user_id)
    if (list) list.push(row)
    else sessionsByUser.set(row.user_id, [row])
  }

  const emailOf = async (userId: string): Promise<string | undefined> => {
    if (!withEmails) return undefined
    try {
      const { data } = await db.auth.admin.getUserById(userId)
      return data?.user?.email ?? undefined
    } catch { return undefined }
  }

  const results: RecoveryOutcome[] = []
  let verified = 0
  let truncated = false

  const userList = Array.from(sessionsByUser.keys())
  for (const userId of userList) {
    const grant = grantByUser.get(userId)

    // 1. Ledger repair — a recorded payment the grant never reflected.
    if (needsLedgerRepair(grant, latestPaymentByUser.get(userId), now)) {
      try {
        await grantAccess(userId, ACCESS_DURATION_DAYS, 'payment')
        results.push({
          checkout_id: '(ledger)', user_id: userId, email: await emailOf(userId),
          status: 'paid (recorded, grant missing)', action: 'granted',
        })
      } catch (error) {
        results.push({
          checkout_id: '(ledger)', user_id: userId,
          status: 'paid (recorded, grant missing)',
          action: `grant_failed: ${error instanceof Error ? error.message : String(error)}`,
        })
      }
      continue
    }

    // 2. Ask Yoco about checkouts the ledger has never seen.
    const pending = pendingCheckouts(sessionsByUser.get(userId) ?? [], grant, appliedCheckouts)

    for (const row of pending) {
      if (verified >= maxVerifications) { truncated = true; break }
      verified += 1

      let checkout
      try {
        checkout = await getYocoCheckout(row.checkout_id)
      } catch {
        results.push({ checkout_id: row.checkout_id, user_id: userId, status: 'yoco_error', action: 'skipped' })
        continue
      }

      const rejection = checkoutRejection(checkout)
      if (rejection === 'not_paid' || !checkout) continue      // abandoned, or still processing
      if (rejection === 'amount_mismatch') {
        results.push({
          checkout_id: row.checkout_id, user_id: userId,
          status: `amount_mismatch (${checkout.amount}/${checkout.currency})`,
          action: 'skipped',
        })
        continue
      }

      try {
        const result = await applyPaidCheckout(db, {
          checkout, checkoutId: row.checkout_id, userId, eventType: 'recovery',
          rawPayload: { source: 'recovery', checkout },
        })
        results.push({
          checkout_id: row.checkout_id, user_id: userId, email: await emailOf(userId),
          status: `paid (${checkoutDurationDays(checkout)} days)`,
          action: result.status === 'granted' ? 'granted' : 'already_applied',
        })
      } catch (error) {
        results.push({
          checkout_id: row.checkout_id, user_id: userId, status: 'paid',
          action: `grant_failed: ${error instanceof Error ? error.message : String(error)}`,
        })
      }
    }
    if (truncated) break
  }

  return {
    checked: userList.length,
    fixed: results.filter(r => r.action === 'granted').length,
    verified,
    truncated,
    results,
  }
}

/**
 * Does this account have a checkout recent enough to be worth verifying?
 *
 * The on-demand path runs on a normal page request, so it must cost nothing
 * for the overwhelming majority of visitors who have never started a
 * checkout. This is the cheap gate in front of it: two indexed reads and no
 * call to Yoco. It also keeps the window short, because on demand we are
 * recovering a payment made minutes ago, not sweeping history.
 */
export async function hasPendingCheckout(
  db: AdminClient,
  userId: string,
  withinDays = 7,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000).toISOString()
  const { data: sessions, error } = await db
    .from('checkout_sessions')
    .select('checkout_id')
    .eq('user_id', userId)
    .gte('created_at', windowStart)
    .order('created_at', { ascending: false })
    .limit(5)
  if (error || !sessions?.length) return false

  const ids = sessions.map(s => s.checkout_id as string)
  const { data: applied, error: ledgerError } = await db
    .from('payment_history')
    .select('yoco_checkout_id')
    .in('yoco_checkout_id', ids)
  if (ledgerError) return false

  const appliedIds = new Set((applied ?? []).map(r => r.yoco_checkout_id as string))
  return ids.some(id => !appliedIds.has(id))
}
