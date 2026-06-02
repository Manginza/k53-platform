'use client'

/**
 * AdminDashboard — grant full access to members by email and revoke it.
 * (Card payers are granted automatically; use this for WhatsApp payers.)
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export interface AdminGrant {
  user_id: string
  email: string
  expires_at: string | null
  source: string
}

function fmtDate(iso: string | null): string {
  if (!iso) return 'Lifetime'
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminDashboard({
  adminEmail, initialGrants,
}: {
  adminEmail: string
  initialGrants: AdminGrant[]
}) {
  const router = useRouter()
  const [grants, setGrants] = useState<AdminGrant[]>(initialGrants)
  const [email, setEmail] = useState('')
  const [days, setDays] = useState(60)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  async function logout() {
    await createClient().auth.signOut(); router.push('/'); router.refresh()
  }

  async function grant(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(''); setOk('')
    try {
      const res = await fetch('/api/admin/grant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, durationDays: days }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not grant access.')
      setGrants(g => [body.grant, ...g.filter(x => x.user_id !== body.grant.user_id)])
      setOk(`Access granted to ${body.grant.email} until ${fmtDate(body.grant.expires_at)}.`)
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function revoke(userId: string) {
    if (!confirm('Revoke this member\'s access?')) return
    const res = await fetch(`/api/admin/grant/${userId}`, { method: 'DELETE' })
    if (res.ok) setGrants(g => g.filter(x => x.user_id !== userId))
  }

  const active = grants.filter(g => !g.expires_at || new Date(g.expires_at) > new Date()).length

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700">Admin dashboard</h1>
          <p className="text-sm text-gray-500 truncate">{adminEmail}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/payouts" className="text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">Affiliate payouts</Link>
          <button onClick={logout} className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">Log out</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center"><div className="text-2xl font-extrabold text-gray-900">{grants.length}</div><div className="text-xs text-gray-500 mt-1">Total grants</div></div>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center"><div className="text-2xl font-extrabold text-gray-900">{active}</div><div className="text-xs text-gray-500 mt-1">Active</div></div>
      </div>

      {/* Grant */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="font-bold text-gray-900 mb-1">Grant access by email</h2>
        <p className="text-xs text-gray-500 mb-3">The member must have registered an account first (at /register). Card payers are granted automatically.</p>
        <form onSubmit={grant} className="flex flex-col sm:flex-row gap-2">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="member@example.com"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2">
            <input type="number" min={1} value={days} onChange={e => setDays(Number(e.target.value))} className="w-16 text-sm focus:outline-none" />
            <span className="text-sm text-gray-400">days</span>
          </div>
          <button type="submit" disabled={busy} className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60 shrink-0">
            {busy ? 'Granting…' : 'Grant access'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {ok && <p className="text-green-600 text-sm mt-2">{ok}</p>}
      </div>

      {/* Grants table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100"><h2 className="font-bold text-gray-800">Members with access</h2></div>
        {grants.length === 0 ? (
          <p className="text-sm text-gray-500 px-5 py-8 text-center">No access grants yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-2 font-semibold">Member</th>
                  <th className="text-left px-5 py-2 font-semibold">Source</th>
                  <th className="text-left px-5 py-2 font-semibold">Expires</th>
                  <th className="text-right px-5 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grants.map(g => {
                  const expired = g.expires_at && new Date(g.expires_at) <= new Date()
                  return (
                    <tr key={g.user_id}>
                      <td className="px-5 py-3 text-gray-700">{g.email}</td>
                      <td className="px-5 py-3 text-gray-500">{g.source}</td>
                      <td className="px-5 py-3">
                        <span className={expired ? 'text-gray-400' : 'text-green-700'}>{fmtDate(g.expires_at)}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => revoke(g.user_id)} className="text-xs font-semibold text-red-600 hover:underline">Revoke</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
