'use client'

/**
 * AdminAffiliateDashboard — what the programme admin sees at /affiliate
 * instead of the normal earner dashboard.
 *
 * Their own referral link, programme-wide totals, the full scoreboard, and a
 * roster where every affiliate can be edited or removed. Removal archives the
 * affiliate's commissions before deleting, so the books survive it.
 */
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import AffiliateScoreboard from '@/components/affiliate/AffiliateScoreboard'
import type { Affiliate, ManagedAffiliate, Scoreboard } from '@/lib/types'

function rand(cents: number) {
  return `R${(cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

type Draft = {
  firstName: string; lastName: string; email: string
  bankAccountName: string; bankName: string; accountNumber: string
  accountType: '' | 'cheque' | 'savings'
  commissionPercent: string
  status: 'active' | 'suspended'
}

function draftFrom(a: ManagedAffiliate): Draft {
  return {
    firstName: a.firstName, lastName: a.lastName, email: a.email,
    bankAccountName: a.bankAccountName, bankName: a.bankName, accountNumber: a.accountNumber,
    accountType: a.accountType,
    commissionPercent: String(Math.round(a.commissionRate * 100)),
    status: a.status,
  }
}

const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function AdminAffiliateDashboard({
  affiliate, scoreboard, initialAffiliates,
}: {
  affiliate: Affiliate
  scoreboard: Scoreboard
  initialAffiliates: ManagedAffiliate[]
}) {
  const router = useRouter()
  const [rows, setRows] = useState(initialAffiliates)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [copied, setCopied] = useState(false)
  const [query, setQuery] = useState('')

  const link = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/?ref=${affiliate.code}`
  }, [affiliate.code])

  const totals = useMemo(() => rows.reduce((t, r) => ({
    sales: t.sales + r.sales,
    earned: t.earned + r.earnedCents,
    pending: t.pending + r.pendingCents,
    clicks: t.clicks + r.clicks,
  }), { sales: 0, earned: 0, pending: 0, clicks: 0 }), [rows])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r =>
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q)
      || r.email.toLowerCase().includes(q)
      || r.code.toLowerCase().includes(q))
  }, [rows, query])

  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }
  async function logout() {
    await createClient().auth.signOut(); router.push('/'); router.refresh()
  }

  function startEdit(a: ManagedAffiliate) {
    setError(''); setNotice('')
    setEditingId(a.id); setDraft(draftFrom(a))
  }

  async function save(id: string) {
    if (!draft) return
    setBusyId(id); setError(''); setNotice('')
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          firstName: draft.firstName, lastName: draft.lastName, email: draft.email,
          bankAccountName: draft.bankAccountName, bankName: draft.bankName,
          accountNumber: draft.accountNumber, accountType: draft.accountType,
          commissionRate: Number(draft.commissionPercent) / 100,
          status: draft.status,
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not save the changes.')
      const a = body.affiliate
      setRows(rs => rs.map(r => r.id === id ? {
        ...r,
        firstName: a.first_name ?? '', lastName: a.last_name ?? '', email: a.email ?? '',
        bankAccountName: a.bank_account_name ?? '', bankName: a.bank_name ?? '',
        accountNumber: a.account_number ?? '', accountType: a.account_type ?? '',
        commissionRate: Number(a.commission_rate), status: a.status,
      } : r))
      setEditingId(null); setDraft(null)
      setNotice('Saved.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setBusyId(null) }
  }

  async function remove(a: ManagedAffiliate) {
    const owed = a.pendingCents > 0 ? `\n\nThey are still owed ${rand(a.pendingCents)}.` : ''
    if (!confirm(
      `Remove ${a.firstName} ${a.lastName} (${a.code}) from the programme?${owed}\n\n`
      + 'Their commission records are archived first, so nothing is lost. '
      + 'Their login account stays.',
    )) return

    setBusyId(a.id); setError(''); setNotice('')
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not remove the affiliate.')
      setRows(rs => rs.filter(r => r.id !== a.id))
      setNotice(`${a.firstName} ${a.lastName} removed and archived.`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setBusyId(null) }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-blue-700">Affiliate programme</h1>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <p className="text-sm text-gray-500">
            {affiliate.first_name} {affiliate.last_name} · you manage every affiliate and see the whole board
          </p>
        </div>
        <button onClick={logout} className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 shrink-0">Log out</button>
      </div>

      {error &&  <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</p>}
      {notice && <p className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">{notice}</p>}

      {/* Programme totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Affiliates', value: String(rows.length) },
          { label: 'Sales', value: String(totals.sales) },
          { label: 'Commission earned', value: rand(totals.earned) },
          { label: 'Owed now', value: rand(totals.pending) },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="text-xl font-extrabold text-gray-800">{c.value}</div>
            <div className="text-xs text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* The admin's own link */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your own referral link</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input readOnly value={link} onFocus={e => e.currentTarget.select()} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700" />
          <button onClick={copy} className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors shrink-0">
            {copied ? '✓ Copied!' : 'Copy link'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Code: <span className="font-mono font-semibold text-gray-700">{affiliate.code}</span></p>
      </div>

      {/* Full scoreboard */}
      <AffiliateScoreboard scoreboard={scoreboard} />

      {/* Roster */}
      <section className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <h2 className="font-bold text-gray-800">Affiliates ({rows.length})</h2>
          <Link href="/admin" className="text-xs text-blue-600 font-semibold hover:underline shrink-0">Add affiliate →</Link>
        </div>

        {rows.length > 5 && (
          <div className="px-5 py-3 border-b border-gray-100">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, email or code" className={inp} />
          </div>
        )}

        {visible.length === 0 ? (
          <p className="text-sm text-gray-500 px-5 py-8 text-center">
            {rows.length === 0 ? 'No affiliates on the programme yet.' : 'No affiliate matches that search.'}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visible.map(a => {
              const editing = editingId === a.id
              const busy = busyId === a.id
              return (
                <li key={a.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {`${a.firstName} ${a.lastName}`.trim() || a.code}
                        {a.isAdmin && <span className="ml-2 text-xs font-bold uppercase tracking-wide text-blue-600">Admin</span>}
                        {a.status === 'suspended' && <span className="ml-2 text-xs font-bold uppercase tracking-wide text-amber-600">Suspended</span>}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {a.email || 'no email'} · <span className="font-mono">{a.code}</span> · joined {a.joined}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {a.sales} {a.sales === 1 ? 'sale' : 'sales'} · {a.clicks} clicks · {a.signups} sign-ups ·{' '}
                        earned <strong className="text-gray-700">{rand(a.earnedCents)}</strong>
                        {a.pendingCents > 0 && <> · owed <strong className="text-amber-700">{rand(a.pendingCents)}</strong></>}
                        {' '}· {Math.round(a.commissionRate * 100)}%
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <button
                        onClick={() => editing ? (setEditingId(null), setDraft(null)) : startEdit(a)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        {editing ? 'Cancel' : 'Edit'}
                      </button>
                      {!a.isAdmin && (
                        <button
                          onClick={() => remove(a)}
                          disabled={busy}
                          className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
                        >
                          {busy ? 'Working…' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>

                  {editing && draft && (
                    <form
                      onSubmit={e => { e.preventDefault(); save(a.id) }}
                      className="mt-4 space-y-3 bg-gray-50 rounded-xl p-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <input value={draft.firstName} onChange={e => setDraft({ ...draft, firstName: e.target.value })} placeholder="First name" className={inp} />
                        <input value={draft.lastName} onChange={e => setDraft({ ...draft, lastName: e.target.value })} placeholder="Surname" className={inp} />
                      </div>
                      <input value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} placeholder="Email" type="email" className={inp} />

                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Payout account</p>
                      <input value={draft.bankAccountName} onChange={e => setDraft({ ...draft, bankAccountName: e.target.value })} placeholder="Account holder name" className={inp} />
                      <div className="grid grid-cols-2 gap-3">
                        <input value={draft.bankName} onChange={e => setDraft({ ...draft, bankName: e.target.value })} placeholder="Bank" className={inp} />
                        <select value={draft.accountType} onChange={e => setDraft({ ...draft, accountType: e.target.value as Draft['accountType'] })} className={inp}>
                          <option value="">Account type</option>
                          <option value="cheque">Cheque</option>
                          <option value="savings">Savings</option>
                        </select>
                      </div>
                      <input value={draft.accountNumber} onChange={e => setDraft({ ...draft, accountNumber: e.target.value })} placeholder="Account number" inputMode="numeric" className={inp} />

                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-xs text-gray-500">
                          Commission %
                          <input
                            value={draft.commissionPercent}
                            onChange={e => setDraft({ ...draft, commissionPercent: e.target.value })}
                            type="number" min={1} max={100} step={1}
                            className={`${inp} mt-1`}
                          />
                        </label>
                        <label className="text-xs text-gray-500">
                          Status
                          <select
                            value={draft.status}
                            onChange={e => setDraft({ ...draft, status: e.target.value as Draft['status'] })}
                            className={`${inp} mt-1`}
                          >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </label>
                      </div>

                      <button type="submit" disabled={busy} className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60">
                        {busy ? 'Saving…' : 'Save changes'}
                      </button>
                    </form>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <p className="text-xs text-gray-400 text-center">
        Removing an affiliate archives their referrals, commissions and clicks first, and leaves their login account alone.
        Pay out pending commission from <Link href="/admin/payouts" className="text-blue-600 font-semibold hover:underline">admin payouts</Link>.
      </p>
    </div>
  )
}
