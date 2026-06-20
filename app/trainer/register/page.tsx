import type { Metadata } from 'next'
import TrainerRegisterForm from '@/components/trainer/TrainerRegisterForm'

export const metadata: Metadata = { title: 'Trainer Registration' }

export default function TrainerRegisterPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Trainer Application</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 mb-2">Create your trainer account</h1>
        <p className="text-gray-500 text-sm">R1,500/year · Your own learner page · 66.67% revenue share</p>
      </div>
      <TrainerRegisterForm />
    </main>
  )
}
