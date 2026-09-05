/**
 * lib/payments-health.ts — is the payment chain actually wired up?
 *
 * Everything between a customer paying and their access appearing depends on
 * configuration that lives outside the repository, and every part of it fails
 * silently. A service-role key that is not really service-role blocks every
 * write behind row-level security and returns empty results rather than
 * errors. A missing webhook secret makes the webhook reject Yoco. A missing
 * database index removes the guarantee that a payment is applied once. None
 * of that shows up until a customer complains.
 *
 * This turns those invisible faults into a page an admin can read. It was
 * written after finding a local SUPABASE_SERVICE_ROLE_KEY that held the anon
 * key, which would break every grant, and which nothing in the app would have
 * reported.
 *
 * Checks are values-in, verdict-out wherever possible so they can be tested.
 */

export type CheckStatus = 'ok' | 'warn' | 'fail'

export interface HealthCheck {
  name: string
  status: CheckStatus
  detail: string
  /** What to do about it. Omitted when the check passed. */
  fix?: string
}

/** Placeholders that ship in an example env file and look configured. */
const PLACEHOLDER = /^(your[_-]|changeme|xxx+$|<.*>$|placeholder|todo)/i

export type SecretShape = 'missing' | 'placeholder' | 'present'

export function classifySecret(value: string | undefined): SecretShape {
  if (!value || !value.trim()) return 'missing'
  if (PLACEHOLDER.test(value.trim())) return 'placeholder'
  return 'present'
}

export type SupabaseKeyRole = 'service_role' | 'anon' | 'unknown' | 'missing'

/**
 * What role a Supabase key actually carries.
 *
 * Legacy keys are JWTs whose payload names the role. Newer keys are opaque
 * and identify themselves by prefix. Anything else is unknown rather than
 * assumed good — a wrong guess here is the exact failure this file exists
 * to catch.
 */
export function classifySupabaseKey(value: string | undefined): SupabaseKeyRole {
  if (!value || !value.trim()) return 'missing'
  const key = value.trim()

  if (key.startsWith('sb_secret_')) return 'service_role'
  if (key.startsWith('sb_publishable_')) return 'anon'

  const parts = key.split('.')
  if (parts.length !== 3) return 'unknown'
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as { role?: string }
    if (payload.role === 'service_role') return 'service_role'
    if (payload.role === 'anon') return 'anon'
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

/** The check that would have caught the anon key sitting in the service-role slot. */
export function serviceRoleKeyCheck(value: string | undefined): HealthCheck {
  const role = classifySupabaseKey(value)
  switch (role) {
    case 'service_role':
      return { name: 'Supabase service-role key', status: 'ok', detail: 'Carries the service_role claim.' }
    case 'anon':
      return {
        name: 'Supabase service-role key',
        status: 'fail',
        detail: 'This is an ANON key, not a service-role key. Every privileged write is blocked by row-level security, so paying customers get no access.',
        fix: 'Copy the service_role key from Supabase, Project Settings then API, into SUPABASE_SERVICE_ROLE_KEY.',
      }
    case 'missing':
      return {
        name: 'Supabase service-role key',
        status: 'fail',
        detail: 'Not set. Nothing that grants access can run.',
        fix: 'Set SUPABASE_SERVICE_ROLE_KEY in Vercel for Production and Preview.',
      }
    default:
      return {
        name: 'Supabase service-role key',
        status: 'warn',
        detail: 'Set, but its role could not be read. Confirm it is the service_role key and not the anon key.',
        fix: 'Compare it against Supabase, Project Settings then API.',
      }
  }
}

export function secretCheck(
  name: string,
  value: string | undefined,
  opts: { required: boolean; consequence: string; fix: string },
): HealthCheck {
  const shape = classifySecret(value)
  if (shape === 'present') return { name, status: 'ok', detail: 'Set.' }
  const detail = shape === 'placeholder'
    ? `Still holds a placeholder value. ${opts.consequence}`
    : `Not set. ${opts.consequence}`
  return { name, status: opts.required ? 'fail' : 'warn', detail, fix: opts.fix }
}

/**
 * Duplicate checkout ids in the ledger are proof the unique index is missing,
 * because the index is what makes them impossible. It is one-directional
 * evidence: finding none does not prove the index exists, only that nothing
 * has been double-applied yet.
 */
export function ledgerDuplicateCheck(checkoutIds: string[]): HealthCheck {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const id of checkoutIds) {
    if (!id) continue
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  }
  if (duplicates.size > 0) {
    return {
      name: 'Payment ledger uniqueness (migration 19)',
      status: 'fail',
      detail: `${duplicates.size} checkout${duplicates.size === 1 ? ' has' : 's have'} more than one ledger row. The unique index is missing, so payments can be applied twice.`,
      fix: 'Run scripts/migrations/19_payment_history_checkout_unique.sql, then remove the duplicate rows.',
    }
  }
  return {
    name: 'Payment ledger uniqueness (migration 19)',
    status: 'ok',
    detail: 'No duplicate checkouts in the ledger. Confirm the index itself exists in Supabase.',
  }
}

/** Turns a failed column read into a verdict on whether a migration ran. */
export function migrationCheck(name: string, present: boolean, file: string): HealthCheck {
  return present
    ? { name, status: 'ok', detail: 'Applied.' }
    : {
        name,
        status: 'fail',
        detail: 'Not applied — the columns it adds are missing.',
        fix: `Run scripts/migrations/${file} in the Supabase SQL editor.`,
      }
}

/** The worst status present, which is what the page should lead with. */
export function overallStatus(checks: readonly HealthCheck[]): CheckStatus {
  if (checks.some(c => c.status === 'fail')) return 'fail'
  if (checks.some(c => c.status === 'warn')) return 'warn'
  return 'ok'
}
