/**
 * /admin — admin dashboard (allowlisted accounts only).
 *
 * Generate registration links to send to paying members, and revoke/delete
 * them. Non-admins are redirected to the login page.
 */
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import AdminDashboard from '@/components/admin/AdminDashboard'
import type { RegistrationToken } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = await getAdminUser()
  if (!admin) redirect('/login')

  const db = createAdminClient()
  const { data: tokens } = await db
    .from('registration_tokens')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <AdminDashboard
      adminEmail={admin.email ?? ''}
      initialTokens={(tokens as RegistrationToken[]) ?? []}
    />
  )
}
