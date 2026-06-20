'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

const PROVINCES = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
  'Mpumalanga', 'Limpopo', 'Free State', 'North West', 'Northern Cape',
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function TrainerRegisterForm() {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState('')
  const [bio, setBio] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState('')

  function handleNameChange(v: string) {
    setName(v)
    if (!slug || slug === slugify(name)) setSlug(slugify(v))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name || !email || !password || !slug || !province)
      return setError('Please fill in all required fields.')
    if (password.length < 8)
      return setError('Password must be at least 8 characters.')

    setLoading(true)
    try {
      const supabase = createClient()

      // 1. Create Supabase auth account
      const { data: auth, error: authErr } = await supabase.auth.signUp({ email, password })
      if (authErr) throw new Error(authErr.message)
      if (!auth.user) throw new Error('Account creation failed.')

      // 2. Insert trainer profile via API (service role)
      const res = await fetch('/api/t/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: auth.user.id,
          name, email, phone, province, bio, slug,
          learner_price_cents: price ? Math.round(parseFloat(price) * 100) : 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Registration failed.')

      setStep('success')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Application received!</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Your trainer account is pending activation. Please pay the R1,500 annual fee via Yoco and send your proof of payment to{' '}
          <a href="mailto:support@skdriving.co.za" className="text-blue-600 underline">support@skdriving.co.za</a>.
          We&apos;ll activate your account within 24 hours.
        </p>
        <p className="text-sm text-gray-400">
          Your trainer page will be at: <strong className="text-gray-700">skdriving.co.za/t/{slug}</strong>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Full name *</label>
          <input value={name} onChange={e => handleNameChange(e.target.value)} required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Phone number</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Email address *</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Password * (min 8 characters)</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" required minLength={8}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Province *</label>
          <select value={province} onChange={e => setProvince(e.target.value)} required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select province</option>
            {PROVINCES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Learner price (R)</label>
          <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" placeholder="e.g. 250"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Your page URL *</label>
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-300">skdriving.co.za/t/</span>
          <input value={slug} onChange={e => setSlug(slugify(e.target.value))} required
            className="flex-1 px-3 py-3 text-sm focus:outline-none" placeholder="your-name" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Short bio (shown on your public page)</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell learners about yourself and your experience…"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-blue-700 text-white font-bold py-4 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors">
        {loading ? 'Registering…' : 'Submit Application →'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        After submitting, pay R1,500 via Yoco and email your proof of payment. Your account will be activated within 24 hours.
      </p>
    </form>
  )
}
