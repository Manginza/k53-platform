'use client'

/**
 * /register — account registration.
 *
 * - With ?token=… (admin signup link): single-use, locked to this first email;
 *   registering grants 60-day access immediately → sent to /courses.
 * - Without a token (open): anyone can sign up, but the account has NO access
 *   until payment → sent to /pricing to pay.
 */
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''
  const next = params.get('next') || '/pricing'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const endpoint = token ? '/api/auth/register-with-token' : '/api/auth/register'
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(token ? { token, email, password } : { email, password }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not create your account.')

      const { error: signInErr } = await createClient().auth.signInWithPassword({ email, password })
      if (signInErr) { router.push('/login'); return }
      // Token signups already have access → go straight to courses.
      router.push(token ? '/courses' : next)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
      <h1 className="text-2xl font-extrabold text-blue-700 mb-1 text-center">Create your account</h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        {token
          ? 'Your account unlocks 60 days of full access. This link works once, for this email only.'
          : "It's free to register. Unlock full access for R99 (down from R150) once you're in."}
      </p>

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
          {loading ? 'Creating account…' : token ? 'Create account & unlock access' : 'Create account'}
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
