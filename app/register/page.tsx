'use client'

/**
 * /register — open account registration. Anyone can sign up; the account has
 * no access until payment. After registering we sign them in and send them to
 * the pricing page to pay (or to ?next if provided).
 */
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

function RegisterForm() {
  const router = useRouter()
  const next = useSearchParams().get('next') || '/pricing'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not create your account.')

      const { error: signInErr } = await createClient().auth.signInWithPassword({ email, password })
      if (signInErr) { router.push('/login'); return }
      router.push(next)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
      <h1 className="text-2xl font-extrabold text-blue-700 mb-1 text-center">Create your account</h1>
      <p className="text-sm text-gray-500 text-center mb-6">It&apos;s free to register. Unlock full access for R150 once you&apos;re in.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="At least 6 characters" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account? <Link href="/login" className="text-blue-700 font-medium hover:underline">Log in</Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense fallback={null}><RegisterForm /></Suspense>
    </main>
  )
}
