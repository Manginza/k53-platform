/**
 * POST /api/admin/grant — grant full access to a registered user by email
 * (admin only). Used for members who paid via WhatsApp.
 * Body: { email: string, durationDays?: number }
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
  let durationDays = ACCESS_DURATION_DAYS
  try {
    const b = await req.json()
    email = (b.email ?? '').toString().trim().toLowerCase()
    if (b.durationDays != null && Number(b.durationDays) > 0) durationDays = Math.floor(Number(b.durationDays))
  } catch { /* */ }
  if (!email) return NextResponse.json({ error: 'Enter the member\'s email.' }, { status: 400 })

  // Find the registered user by email.
  const db = createAdminClient()
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 })
  const target = list?.users?.find(u => u.email?.toLowerCase() === email)
  if (!target) {
    return NextResponse.json({ error: 'No account with that email. Ask them to register first at /register.' }, { status: 404 })
  }

  await grantAccess(target.id, durationDays, 'admin')
  const expires = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
  return NextResponse.json({ ok: true, grant: { user_id: target.id, email, expires_at: expires, source: 'admin' } })
}
