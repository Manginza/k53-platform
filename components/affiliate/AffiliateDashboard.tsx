'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { Affiliate, AffiliateStats, AffiliateCommission } from '@/lib/types'

function rand(cents: number) {
  return `R${(cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AffiliateDashboard({
  affiliate, stats, commissions,
}: {
  affiliate: Affiliate
  stats: AffiliateStats
  commissions: AffiliateCommission[]
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const link = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/?ref=${affiliate.code}`
  }, [affiliate.code])

  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }
  async function logout() {
    await createClient().auth.signOut(); router.push('/'); router.refresh()
  }

  // ── Bank detail editing ────────────────────────────────────────────────────
  const [editingBank, setEditingBank] = useState(false)
  const [bank, setBank] = useState({
    bankAccountName: affiliate.bank_account_name ?? '',
    bankName: affiliate.bank_name ?? '',
    accountNumber: affiliate.account_number ?? '',
    accountType: affiliate.account_type ?? 'cheque',
  })
  const [bankSaving, setBankSaving] = useState(false)
  const [bankMsg, setBankMsg] = useState('')

  async function saveBank(e: React.FormEvent) {
    e.preventDefault()
    setBankSaving(true); setBankMsg('')
    const res = await fetch('/api/affiliate/bank', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bank),
    })
    const data = await res.json()
    setBankSaving(false)
    if (res.ok) { setBankMsg('Bank details saved.'); setEditingBank(false) }
    else setBankMsg(data.error ?? 'Could not save.')
  }

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  const missingBank = !affiliate.bank_account_name || !affiliate.bank_name || !affiliate.account_number

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700">Affiliate dashboard</h1>
          <p className="text-sm text-gray-500">
            {affiliate.first_name} {affiliate.last_name} · earn {Math.round(affiliate.commission_rate * 100)}% on every payment through your link
          </p>
        </div>
        <button onClick={logout} className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 shrink-0">Log out</button>
      </div>

      {/* Missing bank details warning */}
      {missingBank && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-bold text-amber-800">Add your bank details to receive payouts</p>
            <p className="text-xs text-amber-700 mt-0.5">You won&apos;t receive any payments until your bank account is on file.</p>
            <button onClick={() => setEditingBank(true)} className="text-xs font-bold text-amber-800 underline mt-1">Add now →</button>
          </div>
        </div>
      )}

      {/* Referral link */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your referral link</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input readOnly value={link} onFocus={e => e.currentTarget.select()} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700" />
          <button onClick={copy} className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors shrink-0">
            {copied ? '✓ Copied!' : 'Copy link'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Code: <span className="font-mono font-semibold text-gray-700">{affiliate.code}</span> · Share this link — you earn {Math.round(affiliate.commission_rate * 100)}% of every sale it generates.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Clicks', value: String(stats.clicks) },
          { label: 'Sign-ups', value: String(stats.signups) },
          { label: 'Sales', value: String(stats.conversions) },
          { label: 'Total earned', value: rand(stats.earnedCents) },
          { label: 'Commission rate', value: `${Math.round(affiliate.commission_rate * 100)}%` },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="text-2xl font-extrabold text-gray-800">{c.value}</div>
            <div className="text-xs text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Balance */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="text-xs text-amber-700 font-bold uppercase tracking-wide mb-1">Pending payout</div>
          <div className="text-3xl font-extrabold text-amber-800">{rand(stats.pendingCents)}</div>
          <p className="text-xs text-amber-600 mt-1">Paid out every Monday to your bank account</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="text-xs text-green-700 font-bold uppercase tracking-wide mb-1">Total paid out</div>
          <div className="text-3xl font-extrabold text-green-800">{rand(stats.paidCents)}</div>
          <p className="text-xs text-green-600 mt-1">Lifetime payouts received</p>
        </div>
      </div>

      {/* Bank details */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">Payout bank account</h2>
          <button onClick={() => setEditingBank(!editingBank)} className="text-xs text-blue-600 font-semibold hover:underline">
            {editingBank ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editingBank ? (
          <form onSubmit={saveBank} className="space-y-3">
            <input value={bank.bankAccountName} onChange={e => setBank(b => ({ ...b, bankAccountName: e.target.value }))} required placeholder="Account holder name" className={inp} />
            <div className="grid grid-cols-2 gap-3">
              <input value={bank.bankName} onChange={e => setBank(b => ({ ...b, bankName: e.target.value }))} required placeholder="Bank (e.g. FNB)" className={inp} />
              <select value={bank.accountType} onChange={e => setBank(b => ({ ...b, accountType: e.target.value as 'cheque' | 'savings' }))} className={inp}>
                <option value="cheque">Cheque</option>
                <option value="savings">Savings</option>
              </select>
            </div>
            <input value={bank.accountNumber} onChange={e => setBank(b => ({ ...b, accountNumber: e.target.value }))} required placeholder="Account number" inputMode="numeric" className={inp} />
            {bankMsg && <p className={`text-xs ${bankMsg.includes('saved') ? 'text-green-600' : 'text-red-500'}`}>{bankMsg}</p>}
            <button type="submit" disabled={bankSaving} className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60">
              {bankSaving ? 'Saving…' : 'Save bank details'}
            </button>
          </form>
        ) : (
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">Account holder</dt><dd className="text-gray-800 text-right font-medium">{affiliate.bank_account_name || '—'}</dd>
            <dt className="text-gray-500">Bank</dt><dd className="text-gray-800 text-right">{affiliate.bank_name || '—'}</dd>
            <dt className="text-gray-500">Account number</dt><dd className="text-gray-800 text-right font-mono">{affiliate.account_number || '—'}</dd>
            <dt className="text-gray-500">Account type</dt><dd className="text-gray-800 text-right capitalize">{affiliate.account_type || '—'}</dd>
          </dl>
        )}
        {bankMsg && !editingBank && <p className="text-xs text-green-600 mt-2">{bankMsg}</p>}
      </div>

      {/* Commission history */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Commission history</h2>
        </div>
        {commissions.length === 0 ? (
          <p className="text-sm text-gray-500 px-5 py-8 text-center">No commissions yet. Share your link to start earning!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-2 font-semibold">Date</th>
                  <th className="text-right px-5 py-2 font-semibold">Payment</th>
                  <th className="text-right px-5 py-2 font-semibold">Your {Math.round(affiliate.commission_rate * 100)}%</th>
                  <th className="text-right px-5 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commissions.map(c => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 text-gray-600">{new Date(c.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{rand(c.amount_cents)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">{rand(c.commission_cents)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
