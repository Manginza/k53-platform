'use client'

/**
 * AdminDashboard — generate / revoke / delete member access codes.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { WHATSAPP_NUMBER } from '@/lib/contact'
import type { AccessCode } from '@/lib/types'

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminDashboard({
  adminEmail,
  initialCodes,
}: {
  adminEmail: string
  initialCodes: AccessCode[]
}) {
  const router = useRouter()
  const [codes, setCodes] = useState<AccessCode[]>(initialCodes)
  const [label, setLabel] = useState('')
  const [days, setDays] = useState(60)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [justCreated, setJustCreated] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function logout() {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function createCode(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')
    setJustCreated(null)
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, durationDays: days }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not create code.')
      setCodes(c => [body.code, ...c])
      setJustCreated(body.code.code)
      setLabel('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setCreating(false)
    }
  }

  async function setStatus(id: string, status: 'active' | 'revoked') {
    const res = await fetch(`/api/admin/codes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setCodes(cs => cs.map(c => (c.id === id ? { ...c, status } : c)))
  }

  async function remove(id: string) {
    if (!confirm('Delete this code permanently? The member will lose access.')) return
    const res = await fetch(`/api/admin/codes/${id}`, { method: 'DELETE' })
    if (res.ok) setCodes(cs => cs.filter(c => c.id !== id))
  }

  function copy(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code)
      setTimeout(() => setCopied(null), 1500)
    }).catch(() => {})
  }

  const activeCount = codes.filter(c => c.status === 'active').length
  const redeemedCount = codes.filter(c => c.activated_at).length

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700">Admin dashboard</h1>
          <p className="text-sm text-gray-500 truncate">{adminEmail}</p>
        </div>
        <button onClick={logout} className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
          Log out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Total codes', codes.length],
          ['Active', activeCount],
          ['Redeemed', redeemedCount],
        ].map(([label, val]) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-extrabold text-gray-900">{val}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Create */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="font-bold text-gray-900 mb-3">Generate access code</h2>
        <form onSubmit={createCode} className="flex flex-col sm:flex-row gap-2">
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Member name / WhatsApp number (optional)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2">
            <input
              type="number"
              min={1}
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="w-16 text-sm focus:outline-none"
            />
            <span className="text-sm text-gray-400">days</span>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors disabled:opacity-60 shrink-0"
          >
            {creating ? 'Generating…' : 'Generate'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {justCreated && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm text-green-800">
              New code: <span className="font-mono font-bold text-base">{justCreated}</span>
              <span className="block text-xs text-green-700 mt-0.5">Send it to the member on WhatsApp ({WHATSAPP_NUMBER}).</span>
            </div>
            <button onClick={() => copy(justCreated)} className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg shrink-0">
              {copied === justCreated ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* Codes table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Member codes</h2>
        </div>
        {codes.length === 0 ? (
          <p className="text-sm text-gray-500 px-5 py-8 text-center">No codes yet. Generate one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Code</th>
                  <th className="text-left px-4 py-2 font-semibold">Member</th>
                  <th className="text-left px-4 py-2 font-semibold">Status</th>
                  <th className="text-left px-4 py-2 font-semibold">Expires</th>
                  <th className="text-right px-4 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codes.map(c => {
                  const expired = c.expires_at && new Date(c.expires_at) <= new Date()
                  return (
                    <tr key={c.id}>
                      <td className="px-4 py-3">
                        <button onClick={() => copy(c.code)} className="font-mono font-semibold text-gray-900 hover:text-blue-700" title="Copy">
                          {copied === c.code ? 'Copied!' : c.code}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.label || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'revoked' ? 'bg-red-100 text-red-700'
                            : expired ? 'bg-gray-100 text-gray-500'
                            : c.activated_at ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {c.status === 'revoked' ? 'revoked' : expired ? 'expired' : c.activated_at ? 'active' : 'unused'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.activated_at ? fmtDate(c.expires_at) : `${c.duration_days}d on use`}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {c.status === 'active' ? (
                          <button onClick={() => setStatus(c.id, 'revoked')} className="text-xs font-semibold text-amber-700 hover:underline mr-3">
                            Revoke
                          </button>
                        ) : (
                          <button onClick={() => setStatus(c.id, 'active')} className="text-xs font-semibold text-green-700 hover:underline mr-3">
                            Restore
                          </button>
                        )}
                        <button onClick={() => remove(c.id)} className="text-xs font-semibold text-red-600 hover:underline">
                          Delete
                        </button>
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
