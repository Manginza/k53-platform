'use client'

import { useState } from 'react'

type Material = { id: number; title: string; description: string | null; type: string; url: string | null; content: string | null }

const TYPE_ICONS: Record<string, string> = { pdf: '📄', video: '🎬', link: '🔗', note: '📝' }

export default function LearnerPortal({ trainerId }: { trainerId: string }) {
  const [step, setStep] = useState<'join' | 'access' | 'materials'>('join')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [materials, setMaterials] = useState<Material[]>([])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await fetch('/api/t/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainer_id: trainerId, name, email, phone }),
    })
    setLoading(false)
    if (res.ok) setStep('access')
    else { const d = await res.json(); setError(d.error ?? 'Something went wrong.') }
  }

  async function handleAccess(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await fetch('/api/t/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainer_id: trainerId, email }),
    })
    const data = await res.json()
    setLoading(false)
    if (!data.access) {
      if (data.reason === 'not_registered') setError('Email not found. Make sure you signed up first.')
      else if (data.reason === 'not_paid') setError('Your payment has not been confirmed yet. Please contact your trainer.')
      else setError('Access denied.')
      return
    }
    setMaterials(data.materials)
    setStep('materials')
  }

  if (step === 'materials') {
    return (
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 mb-4">Your study materials</h3>
        {materials.length === 0 && (
          <p className="text-sm text-gray-400">No materials have been uploaded yet. Check back soon.</p>
        )}
        {materials.map(m => (
          <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl shrink-0">{TYPE_ICONS[m.type] ?? '📎'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{m.title}</p>
              {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
              {m.url && (
                <a href={m.url} target="_blank" rel="noopener noreferrer"
                  className="mt-1.5 inline-block text-xs font-bold text-blue-600 hover:underline">
                  Open {m.type === 'pdf' ? 'PDF' : m.type === 'video' ? 'video' : 'link'} ↗
                </a>
              )}
              {m.content && <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">{m.content}</p>}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sign up */}
      <div className={`rounded-2xl border p-5 transition-all ${step === 'join' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white opacity-60'}`}>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-bold">1</span>
          Sign up as a learner
        </h3>
        {step === 'join' ? (
          <form onSubmit={handleJoin} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="Your email address"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="Phone number (optional)"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading}
              className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors text-sm">
              {loading ? 'Submitting…' : 'Sign up →'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-green-700 font-semibold">✓ Signed up</p>
        )}
      </div>

      {/* Access materials */}
      <div className={`rounded-2xl border p-5 transition-all ${step === 'access' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-bold">2</span>
          Access your materials
        </h3>
        <p className="text-xs text-gray-500 mb-3">Already signed up and paid? Enter your email to view your study materials.</p>
        {step === 'access' && (
          <form onSubmit={handleAccess} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="Your email address"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors text-sm">
              {loading ? 'Checking…' : 'View my materials →'}
            </button>
            <button type="button" onClick={() => { setStep('join'); setError('') }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">
              ← Sign up first
            </button>
          </form>
        )}
        {step === 'join' && (
          <button onClick={() => { setStep('access'); setError('') }}
            className="text-sm text-blue-600 underline hover:text-blue-800">
            Already signed up? Click here
          </button>
        )}
      </div>
    </div>
  )
}
