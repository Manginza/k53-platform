'use client'

/**
 * AffiliateRegister — self-registration form for new affiliates. Collects
 * name, email, password and bank payout details, creates the account +
 * affiliate record, signs in, and reveals the dashboard.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function AffiliateRegister({ loggedIn = false }: { loggedIn?: boolean }) {
  const router = useRouter()
  const [f, setF] = useState({
    firstName: '', lastName: '', email: '', password: '',
    bankAccountName: '', bankName: '', accountNumber: '', accountType: 'cheque',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const endpoint = loggedIn ? '/api/affiliate/enroll' : '/api/affiliate/register'
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not register.')

      if (!loggedIn) {
        const { error: signInErr } = await createClient().auth.signInWithPassword({ email: f.email, password: f.password })
        if (signInErr) { router.push('/login'); return }
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🤝</div>
        <h1 className="text-2xl font-extrabold text-blue-700">Become an affiliate</h1>
        <p className="text-sm text-gray-500 mt-1">
          Share your link and earn <strong>30%</strong> of every successful payment. Payouts to your
          bank account every Monday.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">First name</label>
            <input required value={f.firstName} onChange={set('firstName')} className={input} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Surname</label>
            <input required value={f.lastName} onChange={set('lastName')} className={input} />
          </div>
        </div>
        {!loggedIn && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" required value={f.email} onChange={set('email')} className={input} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input type="password" required minLength={6} value={f.password} onChange={set('password')} className={input} placeholder="At least 6 characters" />
            </div>
          </>
        )}

        <div className="border-t border-gray-100 pt-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Bank account (for payouts)</div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Account holder name</label>
              <input required value={f.bankAccountName} onChange={set('bankAccountName')} className={input} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bank</label>
                <input required value={f.bankName} onChange={set('bankName')} className={input} placeholder="e.g. FNB" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Account type</label>
                <select value={f.accountType} onChange={set('accountType')} className={input}>
                  <option value="cheque">Cheque</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Account number</label>
              <input required value={f.accountNumber} onChange={set('accountNumber')} className={input} inputMode="numeric" />
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60">
          {loading ? 'Creating your affiliate account…' : 'Join the affiliate programme'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-5">
        Already an affiliate?{' '}
        <Link href="/login" className="text-blue-700 font-medium hover:underline">Log in</Link>
      </p>
    </div>
  )
}
