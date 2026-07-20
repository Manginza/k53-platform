'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { isAdminEmail } from '@/lib/admin-emails'

function friendlyError(message: string): string {
  const normalised = message.toLowerCase()
  if (normalised.includes('invalid login') || normalised.includes('invalid credentials')) {
    return 'Wrong email or password. Please try again.'
  }
  if (normalised.includes('rate') || normalised.includes('too many')) {
    return 'Too many attempts. Please wait a minute and try again.'
  }
  return message
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    if (!isAdminEmail(cleanEmail)) {
      setError('This account is not authorised for the admin dashboard.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (signInError) {
      setError(friendlyError(signInError.message))
      setLoading(false)
      return
    }

    window.location.assign('/admin')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-7 text-center">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">SK Online</p>
          <h1 className="text-2xl font-extrabold text-slate-950">Administrator login</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage members and access.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              placeholder="Enter your password"
            />
          </div>

          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in to admin'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/forgot-password?next=/admin" className="font-semibold text-blue-700 hover:underline">
            Forgot password?
          </Link>
          <Link href="/" className="text-slate-500 hover:text-slate-800">
            Back to website
          </Link>
        </div>
      </div>
    </main>
  )
}
