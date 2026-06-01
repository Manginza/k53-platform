/**
 * DELETE /api/admin/grant/[userId] — revoke a user's access (admin only).
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'

export async function DELETE(_req: NextRequest, { params }: { params: { userId: string } }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { error } = await createAdminClient().from('access_grants').delete().eq('user_id', params.userId)
  if (error) return NextResponse.json({ error: 'Revoke failed.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
