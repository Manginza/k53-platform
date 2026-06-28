import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import LearnerPortal from '@/components/trainer/LearnerPortal'
import Link from 'next/link'

// Trainer public pages are mostly static — revalidate every 5 minutes.
export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const db = createAdminClient()
  const { data } = await db.from('trainers').select('name,bio,province').eq('slug', params.slug).eq('is_active', true).single()
  if (!data) return { title: 'Trainer not found' }
  return {
    title: `${data.name} — K53 Driving Instructor${data.province ? ` | ${data.province}` : ''}`,
    description: data.bio ?? `Book learner's licence lessons with ${data.name} on SK Driving.`,
  }
}

export default async function TrainerPage({ params }: { params: { slug: string } }) {
  const db = createAdminClient()
  const { data: trainer } = await db
    .from('trainers')
    .select('id,name,bio,phone,email,province,learner_price_cents,slug')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!trainer) notFound()

  const price = trainer.learner_price_cents ? `R${(trainer.learner_price_cents / 100).toFixed(0)}` : null

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">

      {/* Trainer profile */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
        <div className="w-20 h-20 rounded-full bg-blue-700 text-white flex items-center justify-center text-3xl font-extrabold shrink-0">
          {trainer.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">{trainer.name}</h1>
          <p className="text-sm text-gray-500 mb-2">
            K53 Driving Instructor{trainer.province ? ` · ${trainer.province}` : ''}
          </p>
          {trainer.bio && <p className="text-gray-600 text-sm leading-relaxed max-w-xl">{trainer.bio}</p>}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            {trainer.phone && (
              <a href={`tel:${trainer.phone}`} className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium">
                📞 {trainer.phone}
              </a>
            )}
            {price && (
              <span className="flex items-center gap-1.5 text-gray-700 font-semibold">
                💰 {price} / learner
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {/* Learner portal */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sign up or access materials</h2>
          <LearnerPortal trainerId={trainer.id} />
        </section>

        {/* Info */}
        <section>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
            <h3 className="font-bold text-blue-900 mb-2">How it works</h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Sign up with your name and email above</li>
              <li>Pay {price ? <strong>{price}</strong> : 'the lesson fee'} directly to {trainer.name}</li>
              <li>Once payment is confirmed, return here and enter your email to access your study materials</li>
            </ol>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-800 mb-2 text-sm">Also practice for free</h3>
            <p className="text-xs text-gray-500 mb-3">Use SK Driving&apos;s free K53 practice tests to prepare for your theory exam.</p>
            <Link href="/courses" className="block text-center bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-800 transition-colors">
              Start free practice tests →
            </Link>
          </div>
        </section>
      </div>

    </main>
  )
}
