/**
 * GET /api/admin/payments-health — can a paying customer actually get access?
 *
 * Runs the checks in lib/payments-health.ts against the environment this
 * deployment is really running in, plus a few live probes of the database.
 * Nothing here changes anything; it only reads.
 *
 * Admin-only. It reports which secrets are missing or still hold placeholder
 * values, and it must never report the values themselves.
 */
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { isEmailConfigured } from '@/lib/email'
import {
  ledgerDuplicateCheck, migrationCheck, overallStatus, secretCheck, serviceRoleKeyCheck,
  type HealthCheck,
} from '@/lib/payments-health'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

type AdminClient = ReturnType<typeof createAdminClient>

/** Whether a column exists, by asking for it and seeing if the read is rejected. */
async function columnExists(db: AdminClient, table: string, column: string): Promise<boolean> {
  const { error } = await db.from(table).select(column).limit(1)
  return !error
}

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const checks: HealthCheck[] = [
    serviceRoleKeyCheck(process.env.SUPABASE_SERVICE_ROLE_KEY),
    secretCheck('Yoco secret key', process.env.YOCO_SECRET_KEY, {
      required: true,
      consequence: 'Checkouts cannot be created or verified, so nobody can pay at all.',
      fix: 'Set YOCO_SECRET_KEY from the Yoco dashboard, Developers then API keys.',
    }),
    secretCheck('Yoco webhook secret', process.env.YOCO_WEBHOOK_SECRET, {
      required: true,
      consequence: "The webhook rejects every call from Yoco, removing one of the routes that grants access.",
      fix: 'Set YOCO_WEBHOOK_SECRET from the Yoco dashboard, Developers then Webhooks.',
    }),
    secretCheck('Cron secret', process.env.CRON_SECRET, {
      required: false,
      consequence: 'The scheduled recovery sweep refuses to run, so buyers who never return are not picked up.',
      fix: 'Set CRON_SECRET to any long random string, in Vercel.',
    }),
    {
      name: 'Transactional email',
      status: isEmailConfigured() ? 'ok' : 'warn',
      detail: isEmailConfigured()
        ? 'Configured. Access codes are emailed on payment.'
        : 'Not configured. Access codes are still issued and still work, but nobody is emailed one.',
      ...(isEmailConfigured() ? {} : { fix: 'Set RESEND_API_KEY and EMAIL_FROM in Vercel.' }),
    },
  ]

  try {
    const db = createAdminClient()
    const [learnerProgress, accessCodes, ledger] = await Promise.all([
      columnExists(db, 'quiz_attempts', 'submission_key'),
      columnExists(db, 'access_codes', 'valid_until'),
      db.from('payment_history').select('yoco_checkout_id').not('yoco_checkout_id', 'is', null).limit(5000),
    ])

    checks.push(migrationCheck('Learner progress (migration 18)', learnerProgress, '18_learner_progress_advisory.sql'))
    checks.push(migrationCheck('Access codes (migration 20)', accessCodes, '20_payment_access_codes.sql'))

    if (ledger.error) {
      checks.push({
        name: 'Payment ledger uniqueness (migration 19)',
        status: 'warn',
        detail: `The ledger could not be read: ${ledger.error.message}`,
        fix: 'Check the service-role key above first — a wrong key makes this read come back empty or rejected.',
      })
    } else {
      checks.push(ledgerDuplicateCheck((ledger.data ?? []).map(r => r.yoco_checkout_id as string)))
    }
  } catch (error) {
    checks.push({
      name: 'Database probes',
      status: 'warn',
      detail: `Could not be run: ${error instanceof Error ? error.message : String(error)}`,
      fix: 'Check the Supabase credentials above.',
    })
  }

  return NextResponse.json({ status: overallStatus(checks), checks })
}
