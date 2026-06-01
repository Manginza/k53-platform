/**
 * /admin — admin dashboard (allowlisted accounts only).
 * Grant full access to members by email (e.g. WhatsApp payers) and revoke it.
 */
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import AdminDashboard, { type AdminGrant } from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = await getAdminUser()
  if (!admin) redirect('/login')

  const db = createAdminClient()
  const [{ data: grants }, { data: list }] = await Promise.all([
    db.from('access_grants').select('*').order('updated_at', { ascending: false }).limit(500),
    db.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const emailById = new Map((list?.users ?? []).map(u => [u.id, u.email ?? '']))
  const rows: AdminGrant[] = (grants ?? []).map(g => ({
    user_id: g.user_id,
    email: emailById.get(g.user_id) ?? g.user_id,
    expires_at: g.expires_at,
    source: g.source,
  }))

  return <AdminDashboard adminEmail={admin.email ?? ''} initialGrants={rows} />
}
