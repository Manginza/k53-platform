/**
 * scripts/reconcile-access-grants.mjs
 *
 * Finds users who paid via Yoco but do NOT have an active access_grants row
 * (silent-failure victims of the old grantAccess bug), and back-fills their
 * grants so they immediately regain their premium access.
 *
 * Reads:
 *   - checkout_sessions: the (checkout_id, user_id) map created at checkout
 *   - Yoco API: per-checkout status + metadata
 *   - access_grants: existing rows
 * Writes:
 *   - access_grants: one row per user who paid but is missing a grant
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, YOCO_SECRET_KEY
 * (loaded from .env.local if not already set).
 *
 * Usage:
 *   node scripts/reconcile-access-grants.mjs           # dry-run (default)
 *   node scripts/reconcile-access-grants.mjs --apply   # actually write grants
 */
import { readFileSync } from 'node:fs'

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l => l.includes('=')).map(l => {
  const at = l.indexOf('=')
  return [l.slice(0, at), l.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')]
}))

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
const YOCO = process.env.YOCO_SECRET_KEY || env.YOCO_SECRET_KEY
const APPLY = process.argv.includes('--apply')

if (!SUPA || !KEY || KEY.startsWith('your-') || !YOCO) {
  console.error('Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and YOCO_SECRET_KEY.')
  process.exit(1)
}

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const sup = async (path, opts = {}) => {
  const res = await fetch(`${SUPA}/rest/v1/${path}`, { ...opts, headers: { ...H, ...opts.headers } })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  const body = await res.text()
  return body ? JSON.parse(body) : null
}

const yoco = async (path) => {
  const res = await fetch(`https://payments.yoco.com/api${path}`, {
    headers: { Authorization: `Bearer ${YOCO}` },
  })
  if (!res.ok) return null
  return res.json()
}

console.log(`Mode: ${APPLY ? 'APPLY (writes will happen)' : 'DRY-RUN (no writes)'}\n`)

// Newest first — most likely to be still-relevant checkouts.
const sessions = await sup('checkout_sessions?select=checkout_id,user_id,created_at&order=created_at.desc')
console.log(`Found ${sessions.length} checkout_sessions rows`)

const grants = await sup('access_grants?select=user_id,expires_at,source,updated_at')
const grantByUser = new Map(grants.map(g => [g.user_id, g]))

// Group checkouts by user so we only grant once per user
const byUser = new Map()
for (const s of sessions) {
  if (!byUser.has(s.user_id)) byUser.set(s.user_id, [])
  byUser.get(s.user_id).push(s.checkout_id)
}

let paidUsersMissingGrant = 0
let paidUsersWithExpiredGrant = 0
let paidUsersOk = 0
let unpaidOrExpiredCheckouts = 0
let backfilled = 0

const now = Date.now()

for (const [userId, checkoutIds] of byUser) {
  let paidCheckoutId = null
  for (const cid of checkoutIds) {
    const c = await yoco(`/checkouts/${cid}`)
    if (c && (c.status === 'completed' || c.paymentId)) { paidCheckoutId = cid; break }
  }
  if (!paidCheckoutId) { unpaidOrExpiredCheckouts++; continue }

  const grant = grantByUser.get(userId)
  const active = grant && (!grant.expires_at || new Date(grant.expires_at).getTime() > now)
  if (active) { paidUsersOk++; continue }

  if (grant) paidUsersWithExpiredGrant++
  else paidUsersMissingGrant++

  console.log(`  MISSING: user=${userId.slice(0, 8)}… paid via ${paidCheckoutId.slice(0, 8)}…`)

  if (APPLY) {
    const expires = new Date(now + 60 * 24 * 60 * 60 * 1000).toISOString()
    const { error } = await fetch(`${SUPA}/rest/v1/access_grants`, {
      method: 'POST',
      headers: { ...H, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        user_id: userId, expires_at: expires, source: 'reconciliation',
        updated_at: new Date().toISOString(),
      }),
    }).then(async r => r.ok ? {} : { error: `${r.status} ${await r.text()}` })
    if (error) console.error(`    FAILED to grant: ${error}`)
    else { backfilled++; console.log(`    ✓ granted 60 days`) }
  }
}

console.log(`\nSummary`)
console.log(`  Users with active grant + paid checkout: ${paidUsersOk}`)
console.log(`  Paid users with NO grant row:            ${paidUsersMissingGrant}`)
console.log(`  Paid users with EXPIRED grant:           ${paidUsersWithExpiredGrant}`)
console.log(`  Users whose checkouts are unpaid/void:   ${unpaidOrExpiredCheckouts}`)
if (APPLY) console.log(`  ✓ Grants back-filled this run:            ${backfilled}`)
else console.log(`\nRe-run with --apply to actually write the grants above.`)
