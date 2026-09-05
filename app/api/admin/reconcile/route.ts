/**
 * POST /api/admin/reconcile — find accounts that paid but have no access,
 * and fix them, on demand, with a report.
 *
 * The repair itself lives in lib/payment-recovery.ts, which is also what
 * /api/cron/reconcile runs on a schedule and what /api/me/access runs for a
 * single account. Buyers should never need this button: it is here for
 * looking into a specific complaint and for confirming the automatic sweeps
 * are doing their job.
 *
 * Admin-only. Reports emails, which the scheduled sweep does not bother with.
 */
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { recoverPaidAccess } from '@/lib/payment-recovery'

export const maxDuration = 60

export async function POST() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  try {
    const report = await recoverPaidAccess(createAdminClient(), { withEmails: true })
    return NextResponse.json(report)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Reconciliation failed.' },
      { status: 500 },
    )
  }
}
