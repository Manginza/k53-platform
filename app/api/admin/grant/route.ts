/**
 * POST /api/admin/grant — grant full access to a member by email (admin only).
 *
 * Two modes:
 *   1. With a password → CREATE the account (auto-confirmed) and grant access
 *      in one step. Use this to manually add a new paid member: tell them
 *      the email + password the admin set, and they can log in immediately
 *      with full access.
 *   2. Without a password → grant access to an account that already exists
 *      (e.g. one the member already registered themselves).
 *
 * Body: { email: string, password?: string, durationDays?: number }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { grantAccess } from '@/lib/access'
import { ACCESS_DURATION_DAYS } from '@/lib/contact'

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let email = ''
  let password = ''
  let durationDays = ACCESS_DURATION_DAYS
  try {
    const b = await req.json()
    email = (b.email ?? '').toString().trim().toLowerCase()
    password = (b.password ?? '').toString()
    if (b.durationDays != null && Number(b.durationDays) > 0) durationDays = Math.floor(Number(b.durationDays))
  } catch { /* defaults */ }

  if (!email) return NextResponse.json({ error: 'Enter the member\'s email.' }, { status: 400 })
  if (password && password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  }

  const db = createAdminClient()

  // Look up existing account by email. Paginate so we don't silently miss
  // users beyond the first page (listUsers caps at perPage per call).
  let target: Awaited<ReturnType<typeof db.auth.admin.listUsers>>['data']['users'][number] | undefined
  let existed = false
  for (let page = 1; ; page++) {
    const { data: list } = await db.auth.admin.listUsers({ page, perPage: 1000 })
    const users = list?.users ?? []
    const found = users.find(u => u.email?.toLowerCase() === email)
    if (found) { target = found; existed = true; break }
    if (users.length < 1000) break
  }

  // Mode 1: admin provided a password → create the account if it doesn't exist
  // (or update the password if it does), then grant.
  if (password) {
    if (target) {
      const { error: upErr } = await db.auth.admin.updateUserById(target.id, { password, email_confirm: true })
      if (upErr) {
        console.error('[admin/grant] password update failed:', upErr.message)
        return NextResponse.json({ error: 'Could not update the password.' }, { status: 500 })
      }
    } else {
      const { data: created, error: createErr } = await db.auth.admin.createUser({ email, password, email_confirm: true })
      if (createErr || !created?.user) {
        console.error('[admin/grant] account create failed:', createErr?.message)
        return NextResponse.json({ error: createErr?.message ?? 'Could not create the account.' }, { status: 500 })
      }
      target = created.user
    }
  }

  // Mode 2: no password → the account must already exist.
  if (!target) {
    return NextResponse.json(
      { error: 'No account with that email. Set a password to create one, or ask them to register at /register first.' },
      { status: 404 },
    )
  }

  // Grant the access window (immediate access). grantAccess now throws
  // on any write/verify failure so we surface the real cause instead of
  // returning `ok:true` on a silently-failed grant.
  try {
    await grantAccess(target.id, durationDays, 'admin')
  } catch (err) {
    return NextResponse.json(
      { error: 'Could not save the access grant. Check server logs for details.', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
  const expires = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()

  return NextResponse.json({
    ok: true,
    created: !!password && !existed,
    grant: { user_id: target.id, email, expires_at: expires, source: 'admin' },
  })
}
