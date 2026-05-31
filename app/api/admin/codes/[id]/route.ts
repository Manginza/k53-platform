/**
 * PATCH  /api/admin/codes/[id] — revoke or reactivate a code (admin only).
 *          Body: { status: 'active' | 'revoked' }
 * DELETE /api/admin/codes/[id] — permanently delete a code (admin only).
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let status: string | undefined
  try {
    ({ status } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 })
  }
  if (status !== 'active' && status !== 'revoked') {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  const db = createAdminClient()
  const { error } = await db.from('access_codes').update({ status }).eq('id', params.id)
  if (error) return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const db = createAdminClient()
  const { error } = await db.from('access_codes').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
