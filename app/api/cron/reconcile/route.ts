/**
 * GET /api/cron/reconcile — the scheduled payment sweep.
 *
 * Runs recoverPaidAccess() over every recent checkout, so a buyer whose
 * payment missed both the confirm call and the webhook gets their access
 * without anyone being asked to fix it by hand. The schedule lives in
 * vercel.json.
 *
 * Signed-in buyers are already healed on demand by /api/me/access the next
 * time they load a page. This exists for the ones who paid and never came
 * back, so their access is waiting whenever they do.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Without
 * CRON_SECRET configured the route refuses to run rather than leaving an
 * unauthenticated endpoint that writes access grants.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { recoverPaidAccess } from '@/lib/payment-recovery'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron/reconcile] CRON_SECRET is not set — refusing to run.')
    return NextResponse.json({ error: 'Cron is not configured.' }, { status: 503 })
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  const started = Date.now()
  try {
    const report = await recoverPaidAccess(createAdminClient())
    const summary = {
      checked: report.checked,
      fixed: report.fixed,
      verified: report.verified,
      truncated: report.truncated,
      ms: Date.now() - started,
    }
    // Only the repairs are worth a log line; a sweep that finds nothing is
    // the normal case and should stay quiet.
    if (report.fixed > 0) {
      console.log('[cron/reconcile] granted access to paid accounts', {
        ...summary,
        granted: report.results.filter(r => r.action === 'granted').map(r => ({
          user_id: r.user_id, checkout_id: r.checkout_id, status: r.status,
        })),
      })
    }
    const failures = report.results.filter(r => r.action.startsWith('grant_failed'))
    if (failures.length) console.error('[cron/reconcile] repairs failed', failures)
    if (report.truncated) {
      console.warn('[cron/reconcile] hit the verification cap — some checkouts were not checked', summary)
    }
    return NextResponse.json(summary)
  } catch (error) {
    console.error('[cron/reconcile] sweep failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Sweep failed.' }, { status: 500 })
  }
}
