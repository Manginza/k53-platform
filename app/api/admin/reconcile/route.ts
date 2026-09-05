/**
 * POST /api/admin/reconcile — find accounts that paid but have no active
 * access, and fix them.
 *
 * Two repair paths, for every user with a checkout but no active grant:
 *   1. Ledger repair: payment_history says a checkout was applied, but the
 *      grant is missing or expired BEFORE that payment was recorded (a grant
 *      write that failed after the ledger claim). Re-grant.
 *   2. Yoco verification: for checkouts not yet in the ledger and created
 *      after the account's last grant write (older ones were applied by the
 *      pre-ledger code), ask Yoco whether they were paid and apply them.
 *
 * Expired members whose only payments are already applied are left alone —
 * their access genuinely ran out.
 *
 * Admin-only. Returns a summary of what was found and fixed.
 */
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { getYocoCheckout } from '@/lib/yoco'
import { grantAccess } from '@/lib/access'
import { applyPaidCheckout, checkoutDurationDays, checkoutRejection } from '@/lib/payments'
import { ACCESS_DURATION_DAYS } from '@/lib/contact'

export const maxDuration = 60

interface ReconcileResult {
  checkout_id: string
  user_id: string
  email?: string
  status: string
  action: string
}

export async function POST() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const db = createAdminClient()

  const [{ data: sessions, error: sessionsErr }, { data: grants, error: grantsErr }, { data: ledger, error: ledgerErr }] =
    await Promise.all([
      db.from('checkout_sessions').select('checkout_id, user_id, created_at').order('created_at', { ascending: false }),
      db.from('access_grants').select('user_id, expires_at, updated_at'),
      db.from('payment_history').select('yoco_checkout_id, user_id, created_at').eq('status', 'succeeded'),
    ])
  const loadError = sessionsErr ?? grantsErr ?? ledgerErr
  if (loadError) {
    return NextResponse.json({ error: loadError.message }, { status: 500 })
  }

  const grantMap = new Map((grants ?? []).map(g => [g.user_id as string, g]))
  const appliedCheckouts = new Set((ledger ?? []).map(l => l.yoco_checkout_id as string))
  const latestPaymentByUser = new Map<string, number>()
  for (const l of ledger ?? []) {
    const t = Date.parse(l.created_at)
    const prev = latestPaymentByUser.get(l.user_id as string) ?? 0
    if (t > prev) latestPaymentByUser.set(l.user_id as string, t)
  }

  const results: ReconcileResult[] = []
  const checked = new Set<string>()
  const now = Date.now()

  const emailOf = async (userId: string) => {
    const { data } = await db.auth.admin.getUserById(userId)
    return data?.user?.email
  }

  for (const row of sessions ?? []) {
    const userId = row.user_id as string
    if (checked.has(userId)) continue
    checked.add(userId)

    const grant = grantMap.get(userId)
    const expiresAt = grant?.expires_at ? Date.parse(grant.expires_at) : null
    const hasActiveGrant = !!grant && (expiresAt === null || expiresAt > now)
    if (hasActiveGrant) continue

    // 1. Ledger repair — a recorded payment the grant never reflected.
    const lastPaid = latestPaymentByUser.get(userId)
    if (lastPaid && (expiresAt === null || expiresAt < lastPaid)) {
      try {
        await grantAccess(userId, ACCESS_DURATION_DAYS, 'payment')
        results.push({
          checkout_id: '(ledger)', user_id: userId, email: await emailOf(userId),
          status: 'paid (recorded, grant missing)', action: 'granted',
        })
      } catch (err) {
        results.push({
          checkout_id: '(ledger)', user_id: userId,
          status: 'paid (recorded, grant missing)',
          action: `grant_failed: ${err instanceof Error ? err.message : String(err)}`,
        })
      }
      continue
    }

    // 2. Yoco verification of checkouts that could still be unapplied.
    const cutoff = grant?.updated_at ? Date.parse(grant.updated_at) : 0
    const userCheckouts = (sessions ?? []).filter(s =>
      s.user_id === userId
      && !appliedCheckouts.has(s.checkout_id as string)
      && Date.parse(s.created_at) >= cutoff,
    )

    for (const cs of userCheckouts) {
      const checkoutId = cs.checkout_id as string
      let checkout
      try {
        checkout = await getYocoCheckout(checkoutId)
      } catch {
        results.push({ checkout_id: checkoutId, user_id: userId, status: 'yoco_error', action: 'skipped' })
        continue
      }

      const rejection = checkoutRejection(checkout)
      if (rejection === 'not_paid' || !checkout) continue
      if (rejection === 'amount_mismatch') {
        results.push({
          checkout_id: checkoutId, user_id: userId,
          status: `amount_mismatch (${checkout.amount}/${checkout.currency})`,
          action: 'skipped',
        })
        continue
      }

      try {
        const result = await applyPaidCheckout(db, {
          checkout, checkoutId, userId, eventType: 'reconcile',
          rawPayload: { source: 'reconcile', checkout },
        })
        results.push({
          checkout_id: checkoutId, user_id: userId, email: await emailOf(userId),
          status: `paid (${checkoutDurationDays(checkout)} days)`,
          action: result.status === 'granted' ? 'granted' : 'already_applied',
        })
        if (result.status === 'granted') break
      } catch (err) {
        results.push({
          checkout_id: checkoutId, user_id: userId,
          status: 'paid', action: `grant_failed: ${err instanceof Error ? err.message : String(err)}`,
        })
      }
    }
  }

  return NextResponse.json({
    checked: checked.size,
    fixed: results.filter(r => r.action === 'granted').length,
    results,
  })
}
