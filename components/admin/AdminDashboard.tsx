'use client'

/**
 * AdminDashboard — generate / revoke / delete member registration links.
 * Each link is /register?token=… — send it to a member (e.g. on WhatsApp)
 * after they pay; they use it to create their account with full access.
 */
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { RegistrationToken } from '@/lib/types'

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminDashboard({
  adminEmail,
  initialTokens,
}: {
  adminEmail: string
  initialTokens: RegistrationToken[]
}) {
  const router = useRouter()
  const [tokens, setTokens] = useState<RegistrationToken[]>(initialTokens)
  const [label, setLabel] = useState('')
  const [days, setDays] = useState(60)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [justCreated, setJustCreated] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), [])
  const linkFor = (t: string) => `${origin}/register?token=${t}`

  async function logout() {
    await createClient().auth.signOut()
    router.push('/'); router.refresh()
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true); setError(''); setJustCreated(null)
    try {
      const res = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, durationDays: days }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not create link.')
      setTokens(t => [body.token, ...t])
      setJustCreated(body.token.token)
      setLabel('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setCreating(false)
    }
  }

  async function setStatus(id: string, status: 'ready' | 'revoked') {
    const res = await fetch(`/api/admin/tokens/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    if (res.ok) setTokens(ts => ts.map(t => (t.id === id ? { ...t, status } : t)))
  }

  async function remove(id: string) {
    if (!confirm('Delete this registration link? (Already-registered members keep their access.)')) return
    const res = await fetch(`/api/admin/tokens/${id}`, { method: 'DELETE' })
    if (res.ok) setTokens(ts => ts.filter(t => t.id !== id))
  }

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key); setTimeout(() => setCopied(null), 1500)
    }).catch(() => {})
  }

  const usedCount  = tokens.filter(t => t.status === 'used').length
  const readyCount = tokens.filter(t => t.status === 'ready').length

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700">Admin dashboard</h1>
          <p className="text-sm text-gray-500 truncate">{adminEmail}</p>
        </div>
        <button onClick={logout} className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">Log out</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[['Total links', tokens.length], ['Unused', readyCount], ['Registered', usedCount]].map(([l, v]) => (
          <div key={l as string} className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-extrabold text-gray-900">{v}</div>
            <div className="text-xs text-gray-500 mt-1">{l}</div>
          </div>
        ))}
      </div>

      {/* Create */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="font-bold text-gray-900 mb-1">Create a registration link</h2>
        <p className="text-xs text-gray-500 mb-3">Send the link to a member after they pay. They use it to create their account.</p>
        <form onSubmit={create} className="flex flex-col sm:flex-row gap-2">
          <input
            value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Member name / WhatsApp number (optional)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2">
            <input type="number" min={1} value={days} onChange={e => setDays(Number(e.target.value))} className="w-16 text-sm focus:outline-none" />
            <span className="text-sm text-gray-400">days</span>
          </div>
          <button type="submit" disabled={creating} className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60 shrink-0">
            {creating ? 'Creating…' : 'Create link'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {justCreated && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm text-green-800 min-w-0">
              <div className="font-semibold mb-0.5">Registration link ready — send it to the member:</div>
              <div className="font-mono text-xs break-all">{linkFor(justCreated)}</div>
            </div>
            <button onClick={() => copy(linkFor(justCreated), 'new')} className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg shrink-0">
              {copied === 'new' ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100"><h2 className="font-bold text-gray-800">Registration links</h2></div>
        {tokens.length === 0 ? (
          <p className="text-sm text-gray-500 px-5 py-8 text-center">No links yet. Create one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Member</th>
                  <th className="text-left px-4 py-2 font-semibold">Source</th>
                  <th className="text-left px-4 py-2 font-semibold">Status</th>
                  <th className="text-left px-4 py-2 font-semibold">Expires</th>
                  <th className="text-right px-4 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tokens.map(t => {
                  const expired = t.expires_at && new Date(t.expires_at) <= new Date()
                  const statusLabel = t.status === 'used' ? (expired ? 'expired' : 'registered') : t.status
                  const statusClass =
                    t.status === 'revoked' ? 'bg-red-100 text-red-700'
                    : t.status === 'used' ? (expired ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700')
                    : t.status === 'ready' ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'  // pending
                  return (
                    <tr key={t.id}>
                      <td className="px-4 py-3 text-gray-700">{t.label || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{t.source}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>{statusLabel}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{t.status === 'used' ? fmtDate(t.expires_at) : `${t.duration_days ?? '∞'}d`}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {t.status === 'ready' && (
                          <button onClick={() => copy(linkFor(t.token), t.id)} className="text-xs font-semibold text-blue-700 hover:underline mr-3">
                            {copied === t.id ? 'Copied!' : 'Copy link'}
                          </button>
                        )}
                        {t.status !== 'used' && t.status !== 'revoked' && (
                          <button onClick={() => setStatus(t.id, 'revoked')} className="text-xs font-semibold text-amber-700 hover:underline mr-3">Revoke</button>
                        )}
                        {t.status === 'revoked' && (
                          <button onClick={() => setStatus(t.id, 'ready')} className="text-xs font-semibold text-green-700 hover:underline mr-3">Restore</button>
                        )}
                        <button onClick={() => remove(t.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
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
