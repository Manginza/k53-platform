/**
 * /admin — admin dashboard (allowlisted accounts only).
 *
 * Generate, revoke and delete member access codes. Non-admins are redirected
 * to the login page.
 */
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import AdminDashboard from '@/components/admin/AdminDashboard'
import type { AccessCode } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = await getAdminUser()
  if (!admin) redirect('/login?next=/admin')

  const db = createAdminClient()
  const { data: codes } = await db
    .from('access_codes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <AdminDashboard
      adminEmail={admin.email ?? ''}
      initialCodes={(codes as AccessCode[]) ?? []}
    />
  )
}
