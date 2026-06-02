/**
 * DELETE /api/admin/tokens/[id] — delete a signup link (admin only).
 * (Already-registered members keep their access — that lives on their account.)
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const db = createAdminClient()
  const { error } = await db.from('registration_tokens').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
