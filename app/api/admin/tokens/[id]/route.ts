/**
 * PATCH  /api/admin/tokens/[id] — revoke or restore a registration link (admin).
 *          Body: { status: 'ready' | 'revoked' }
 * DELETE /api/admin/tokens/[id] — permanently delete a registration link (admin).
 *
 * Note: revoking a link that was already used does not remove the member's
 * access (their grant is bound on their account); delete the member in
 * Supabase Auth to fully revoke access.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let status: string | undefined
  try { ({ status } = await req.json()) } catch { return NextResponse.json({ error: 'Invalid body.' }, { status: 400 }) }
  if (status !== 'ready' && status !== 'revoked') return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })

  const db = createAdminClient()
  const { error } = await db.from('registration_tokens').update({ status }).eq('id', params.id)
  if (error) return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const db = createAdminClient()
  const { error } = await db.from('registration_tokens').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
