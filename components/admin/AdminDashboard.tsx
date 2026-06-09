'use client'

/**
 * AdminDashboard — admin hub:
 *   1. Grant access by email (WhatsApp payers who registered)
 *   2. Signup links — unique single-use /register?token links (locked to the
 *      first email; 60-day access)
 *   3. Affiliate payouts — affiliates, bank details, amount owed, mark paid
 */
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export interface AdminGrant { user_id: string; email: string; expires_at: string | null; source: string }
export interface SignupLink { id: string; token: string; label: string | null; status: string; usedByEmail: string | null; expires_at: string | null }
export interface PayoutRow {
  id: string; name: string; email: string; code: string
  bankAccountName: string; bankName: string; accountNumber: string; accountType: string
  pendingCents: number; earnedCents: number; paidCents: number
}

function fmtDate(iso: string | null): string {
  if (!iso) return 'Lifetime'
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}
function rand(cents: number) {
  return `R${(cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminDashboard({
  adminEmail, initialGrants, initialLinks, initialPayouts, initialRecordingUrl = '',
}: {
  adminEmail: string
  initialGrants: AdminGrant[]
  initialLinks: SignupLink[]
  initialPayouts: PayoutRow[]
  initialRecordingUrl?: string
}) {
  const router = useRouter()
  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), [])
  const [copied, setCopied] = useState<string | null>(null)
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 1500) }).catch(() => {})
  }
  async function logout() { await createClient().auth.signOut(); router.push('/'); router.refresh() }

  // ── Latest live-session recording ───────────────────────────────────────────
  const [recordingUrl, setRecordingUrl] = useState(initialRecordingUrl)
  const [recSaving, setRecSaving] = useState(false)
  const [recMsg, setRecMsg] = useState('')
  async function saveRecording(e: React.FormEvent) {
    e.preventDefault(); setRecSaving(true); setRecMsg('')
    try {
      const res = await fetch('/api/admin/recording', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: recordingUrl }),
      })
      const body = await res.json()
      setRecMsg(res.ok ? 'Saved — this is now the recording shown on Videos and in the popup.' : (body.error ?? 'Could not save.'))
    } catch { setRecMsg('Could not save.') } finally { setRecSaving(false) }
  }

  // ── Grants ────────────────────────────────────────────────────────────────
  const [grants, setGrants] = useState(initialGrants)
  const [gEmail, setGEmail] = useState(''); const [gPassword, setGPassword] = useState(''); const [gDays, setGDays] = useState(60)
  const [gBusy, setGBusy] = useState(false); const [gErr, setGErr] = useState(''); const [gOk, setGOk] = useState('')
  async function grant(e: React.FormEvent) {
    e.preventDefault(); setGBusy(true); setGErr(''); setGOk('')
    try {
      const res = await fetch('/api/admin/grant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: gEmail, password: gPassword || undefined, durationDays: gDays }),
      })
      const body = await res.json(); if (!res.ok) throw new Error(body.error ?? 'Could not grant access.')
      setGrants(g => [body.grant, ...g.filter(x => x.user_id !== body.grant.user_id)])
      setGOk(body.created
        ? `Account created and access granted to ${body.grant.email} until ${fmtDate(body.grant.expires_at)}.`
        : `Access granted to ${body.grant.email} until ${fmtDate(body.grant.expires_at)}.`)
      setGEmail(''); setGPassword('')
    } catch (err) { setGErr(err instanceof Error ? err.message : 'Something went wrong.') } finally { setGBusy(false) }
  }
  async function revokeGrant(userId: string) {
    if (!confirm('Revoke this member\'s access?')) return
    const res = await fetch(`/api/admin/grant/${userId}`, { method: 'DELETE' })
    if (res.ok) setGrants(g => g.filter(x => x.user_id !== userId))
  }

  // ── Signup links ──────────────────────────────────────────────────────────
  const [links, setLinks] = useState(initialLinks)
  const [lLabel, setLLabel] = useState(''); const [lDays, setLDays] = useState(60)
  const [lBusy, setLBusy] = useState(false); const [lErr, setLErr] = useState(''); const [lNew, setLNew] = useState<string | null>(null)
  const linkUrl = (t: string) => `${origin}/register?token=${t}`
  async function createLink(e: React.FormEvent) {
    e.preventDefault(); setLBusy(true); setLErr(''); setLNew(null)
    try {
      const res = await fetch('/api/admin/tokens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: lLabel, durationDays: lDays }) })
      const body = await res.json(); if (!res.ok) throw new Error(body.error ?? 'Could not create link.')
      setLinks(l => [{ id: body.token.id, token: body.token.token, label: body.token.label, status: body.token.status, usedByEmail: null, expires_at: body.token.expires_at }, ...l])
      setLNew(body.token.token); setLLabel('')
    } catch (err) { setLErr(err instanceof Error ? err.message : 'Something went wrong.') } finally { setLBusy(false) }
  }
  async function deleteLink(id: string) {
    if (!confirm('Delete this signup link?')) return
    const res = await fetch(`/api/admin/tokens/${id}`, { method: 'DELETE' })
    if (res.ok) setLinks(l => l.filter(x => x.id !== id))
  }

  // ── Affiliate payouts ───────────────────────────────────────────────────────
  const [payouts, setPayouts] = useState(initialPayouts)
  const [payBusy, setPayBusy] = useState<string | null>(null)
  const totalOwed = useMemo(() => payouts.reduce((s, r) => s + r.pendingCents, 0), [payouts])
  async function markPaid(r: PayoutRow) {
    if (!confirm(`Mark ${rand(r.pendingCents)} as paid to ${r.name}? Only after the bank transfer is done.`)) return
    setPayBusy(r.id)
    try {
      const res = await fetch('/api/admin/payouts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ affiliateId: r.id }) })
      const body = await res.json()
      if (res.ok) setPayouts(ps => ps.map(x => x.id === r.id ? { ...x, pendingCents: 0, paidCents: x.paidCents + (body.paidCents ?? 0) } : x))
      else alert(body.error ?? 'Could not mark as paid.')
    } finally { setPayBusy(null) }
  }
  function copyBank(r: PayoutRow) {
    copy(`${r.bankAccountName}\n${r.bankName} (${r.accountType})\nAcc: ${r.accountNumber}\nAmount: ${rand(r.pendingCents)}`, `bank-${r.id}`)
  }

  const linkStatus = (l: SignupLink) => {
    if (l.status === 'used') return l.expires_at && new Date(l.expires_at) <= new Date() ? 'expired' : 'registered'
    return l.status
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700">Admin dashboard</h1>
          <p className="text-sm text-gray-500 truncate">{adminEmail}</p>
        </div>
        <button onClick={logout} className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 shrink-0">Log out</button>
      </div>

      {/* ── Latest live-session recording ── */}
      <section className="space-y-3">
        <h2 className="font-extrabold text-gray-900">Latest session recording</h2>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-xs text-gray-500 mb-3">
            Paste the newest recording link (Google Drive). It <strong>replaces</strong> the previous one at the
            top of the Videos page and in the session popup&apos;s &ldquo;Watch the recording&rdquo; button.
          </p>
          <form onSubmit={saveRecording} className="flex flex-col sm:flex-row gap-2">
            <input type="url" value={recordingUrl} onChange={e => setRecordingUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/…/view"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={recSaving}
              className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60 shrink-0">
              {recSaving ? 'Saving…' : 'Update recording'}
            </button>
          </form>
          {recMsg && <p className="text-green-600 text-sm mt-2">{recMsg}</p>}
        </div>
      </section>

      {/* ── 1. Grant access by email ── */}
      <section className="space-y-3">
        <h2 className="font-extrabold text-gray-900">Member access</h2>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-xs text-gray-500 mb-3">
            Add a member directly. <strong>Set a password</strong> to create a new account and grant access in one step
            (give the member the email + password to log in). Leave password blank to grant to an account that already exists.
          </p>
          <form onSubmit={grant} className="flex flex-col sm:flex-row gap-2">
            <input type="email" required value={gEmail} onChange={e => setGEmail(e.target.value)}
              placeholder="member@example.com"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" value={gPassword} onChange={e => setGPassword(e.target.value)}
              placeholder="Password (optional)"
              autoComplete="off"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2">
              <input type="number" min={1} value={gDays} onChange={e => setGDays(Number(e.target.value))} className="w-16 text-sm focus:outline-none" />
              <span className="text-sm text-gray-400">days</span>
            </div>
            <button type="submit" disabled={gBusy}
              className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60 shrink-0">
              {gBusy ? 'Working…' : gPassword ? 'Create & grant' : 'Grant access'}
            </button>
          </form>
          {gErr && <p className="text-red-500 text-sm mt-2">{gErr}</p>}
          {gOk && <p className="text-green-600 text-sm mt-2">{gOk}</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100"><h3 className="font-bold text-gray-800 text-sm">Members with access ({grants.length})</h3></div>
          {grants.length === 0 ? <p className="text-sm text-gray-500 px-5 py-6 text-center">No access grants yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><tbody className="divide-y divide-gray-100">
              {grants.map(g => {
                const expired = g.expires_at && new Date(g.expires_at) <= new Date()
                return (<tr key={g.user_id}>
                  <td className="px-5 py-3 text-gray-700">{g.email}</td>
                  <td className="px-5 py-3 text-gray-500">{g.source}</td>
                  <td className="px-5 py-3"><span className={expired ? 'text-gray-400' : 'text-green-700'}>{fmtDate(g.expires_at)}</span></td>
                  <td className="px-5 py-3 text-right"><button onClick={() => revokeGrant(g.user_id)} className="text-xs font-semibold text-red-600 hover:underline">Revoke</button></td>
                </tr>)
              })}
            </tbody></table></div>
          )}
        </div>
      </section>

      {/* ── 2. Admin Pass Link ── */}
      <section className="space-y-3">
        <h2 className="font-extrabold text-gray-900">Admin Pass</h2>
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Anyone with this link can register and get 60 days of free access automatically.
            </p>
            <div className="font-mono text-xs break-all text-blue-700">{origin}/admin-pass</div>
          </div>
          <button onClick={() => copy(`${origin}/admin-pass`, 'adminpass')} className="text-xs font-semibold bg-blue-700 text-white px-4 py-2 rounded-lg shrink-0">
            {copied === 'adminpass' ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </section>

      {/* ── 3. Signup links ── */}
      <section className="space-y-3">
        <h2 className="font-extrabold text-gray-900">Signup links</h2>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-xs text-gray-500 mb-3">Create a unique link for a manually-added member. It works <strong>once</strong>, for the <strong>first email</strong> that registers with it, and grants that account 60 days of access.</p>
          <form onSubmit={createLink} className="flex flex-col sm:flex-row gap-2">
            <input value={lLabel} onChange={e => setLLabel(e.target.value)} placeholder="Member name / WhatsApp number (optional)" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2"><input type="number" min={1} value={lDays} onChange={e => setLDays(Number(e.target.value))} className="w-16 text-sm focus:outline-none" /><span className="text-sm text-gray-400">days</span></div>
            <button type="submit" disabled={lBusy} className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60 shrink-0">{lBusy ? 'Creating…' : 'Create link'}</button>
          </form>
          {lErr && <p className="text-red-500 text-sm mt-2">{lErr}</p>}
          {lNew && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="text-sm text-green-800 min-w-0"><div className="font-semibold mb-0.5">Send this link to the member:</div><div className="font-mono text-xs break-all">{linkUrl(lNew)}</div></div>
              <button onClick={() => copy(linkUrl(lNew), 'newlink')} className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg shrink-0">{copied === 'newlink' ? 'Copied!' : 'Copy'}</button>
            </div>
          )}
        </div>
        {links.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide"><tr><th className="text-left px-5 py-2 font-semibold">Member</th><th className="text-left px-5 py-2 font-semibold">Status</th><th className="text-left px-5 py-2 font-semibold">Used by</th><th className="text-right px-5 py-2 font-semibold">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {links.map(l => {
                  const st = linkStatus(l)
                  const cls = st === 'registered' ? 'bg-green-100 text-green-700' : st === 'ready' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  return (<tr key={l.id}>
                    <td className="px-5 py-3 text-gray-700">{l.label || '—'}</td>
                    <td className="px-5 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{st}</span></td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{l.usedByEmail || '—'}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {l.status === 'ready' && <button onClick={() => copy(linkUrl(l.token), l.id)} className="text-xs font-semibold text-blue-700 hover:underline mr-3">{copied === l.id ? 'Copied!' : 'Copy link'}</button>}
                      <button onClick={() => deleteLink(l.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>)
                })}
              </tbody>
            </table></div>
          </div>
        )}
      </section>

      {/* ── 3. Affiliate payouts ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-gray-900">Affiliate payouts</h2>
          <span className="text-sm text-amber-700 font-semibold">Owed: {rand(totalOwed)}</span>
        </div>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {payouts.length === 0 ? <p className="text-sm text-gray-500 px-5 py-8 text-center">No affiliates yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide"><tr>
                <th className="text-left px-4 py-2 font-semibold">Affiliate</th>
                <th className="text-left px-4 py-2 font-semibold">Bank details</th>
                <th className="text-right px-4 py-2 font-semibold">Owed</th>
                <th className="text-right px-4 py-2 font-semibold">Earned / Paid</th>
                <th className="text-right px-4 py-2 font-semibold">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map(r => (
                  <tr key={r.id} className={r.pendingCents > 0 ? 'bg-amber-50/40' : ''}>
                    <td className="px-4 py-3"><div className="font-semibold text-gray-900">{r.name}</div><div className="text-xs text-gray-400">{r.email} · <span className="font-mono">{r.code}</span></div></td>
                    <td className="px-4 py-3 text-gray-600"><div>{r.bankAccountName || '—'}</div><div className="text-xs text-gray-400">{r.bankName} {r.accountType && `· ${r.accountType}`}</div><div className="text-xs text-gray-400 font-mono">{r.accountNumber}</div></td>
                    <td className="px-4 py-3 text-right font-extrabold text-gray-900">{rand(r.pendingCents)}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500"><div>{rand(r.earnedCents)} earned</div><div>{rand(r.paidCents)} paid</div></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.pendingCents > 0 ? (<>
                        <button onClick={() => copyBank(r)} className="text-xs font-semibold text-gray-600 hover:underline mr-3">{copied === `bank-${r.id}` ? 'Copied!' : 'Copy'}</button>
                        <button onClick={() => markPaid(r)} disabled={payBusy === r.id} className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60">{payBusy === r.id ? '…' : 'Mark paid'}</button>
                      </>) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      </section>
    </main>
  )
}
