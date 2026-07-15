'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { isAdminEmail } from '@/lib/admin-emails'

/**
 * Whitelist for the `next` param — only allow same-site paths so a poisoned
 * link can't route the user to an external site after login.
 */
function safeNext(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nextPath = safeNext(params.get('next'))

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Explicit ?next=… wins (so we can complete a pending checkout etc.).
    // Otherwise route by role: admin → /admin, affiliate → /affiliate, else /courses.
    let dest = nextPath ?? '/courses'
    if (!nextPath) {
      if (isAdminEmail(email)) {
        dest = '/admin'
      } else if (data.user) {
        const { data: aff } = await supabase
          .from('affiliates')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle()
        if (aff) dest = '/affiliate'
      }
    }
    router.push(dest)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-blue-700 mb-2 text-center">Welcome back</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Log in to your K53 account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-700 text-white font-semibold py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Don&apos;t have an account? Get full access on the{' '}
          <Link href="/pricing" className="text-blue-700 font-medium hover:underline">pricing page</Link>.
        </p>
        <p className="text-sm text-center text-gray-500 mt-2">
          Want to earn? Join the{' '}
          <Link href="/affiliate" className="text-blue-700 font-medium hover:underline">affiliate programme</Link>.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
