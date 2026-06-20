import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import TrainerDashboardClient from '@/components/trainer/TrainerDashboardClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Trainer Dashboard' }

export default async function TrainerDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/trainer/dashboard')

  const db = createAdminClient()
  const { data: trainer } = await db.from('trainers').select('*').eq('user_id', user.id).single()
  if (!trainer) redirect('/trainer/register')

  const [{ data: learners }, { data: materials }] = await Promise.all([
    db.from('trainer_learners').select('*').eq('trainer_id', trainer.id).order('created_at', { ascending: false }),
    db.from('trainer_materials').select('*').eq('trainer_id', trainer.id).order('sort_order'),
  ])

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Trainer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, {trainer.name}</p>
        </div>
      </div>
      <TrainerDashboardClient
        trainer={trainer}
        initialLearners={learners ?? []}
        initialMaterials={materials ?? []}
      />
    </main>
  )
}
