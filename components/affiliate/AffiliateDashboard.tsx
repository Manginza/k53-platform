'use client'

/**
 * AffiliateDashboard — referral link, earnings, payout/bank info and
 * commission history. 30% of every successful payment; paid out weekly.
 */
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

  const cards = [
    { label: 'Clicks', value: String(stats.clicks) },
    { label: 'Sales', value: String(stats.conversions) },
    { label: 'Earned', value: rand(stats.earnedCents) },
    { label: 'Rate', value: `${Math.round(affiliate.commission_rate * 100)}%` },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700">Affiliate dashboard</h1>
          <p className="text-sm text-gray-500">
            {affiliate.first_name} {affiliate.last_name} · earn {Math.round(affiliate.commission_rate * 100)}% on every payment through your link.
          </p>
        </div>
        <button onClick={logout} className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 shrink-0">Log out</button>
      </div>

      {/* Referral link */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your referral link</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input readOnly value={link} onFocus={e => e.currentTarget.select()} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700" />
          <button onClick={copy} className="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors shrink-0">
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Code: <span className="font-mono font-semibold text-gray-600">{affiliate.code}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="text-2xl font-extrabold text-gray-800">{c.value}</div>
            <div className="text-xs text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Balance + payout info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="text-xs text-amber-700 font-semibold uppercase tracking-wide">Pending payout</div>
          <div className="text-xl font-extrabold text-amber-800 mt-1">{rand(stats.pendingCents)}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="text-xs text-green-700 font-semibold uppercase tracking-wide">Paid out</div>
          <div className="text-xl font-extrabold text-green-800 mt-1">{rand(stats.paidCents)}</div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 text-sm text-blue-800">
        💸 Payouts are made to your bank account <strong>every Monday</strong>.
      </div>

      {/* Bank details */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="font-bold text-gray-800 mb-3">Payout bank account</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">Account holder</dt><dd className="text-gray-800 text-right">{affiliate.bank_account_name ?? '—'}</dd>
          <dt className="text-gray-500">Bank</dt><dd className="text-gray-800 text-right">{affiliate.bank_name ?? '—'}</dd>
          <dt className="text-gray-500">Account number</dt><dd className="text-gray-800 text-right">{affiliate.account_number ?? '—'}</dd>
          <dt className="text-gray-500">Account type</dt><dd className="text-gray-800 text-right capitalize">{affiliate.account_type ?? '—'}</dd>
        </dl>
        <p className="text-xs text-gray-400 mt-3">To update your bank details, contact support@skdriving.co.za.</p>
      </div>

      {/* Commission history */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100"><h2 className="font-bold text-gray-800">Commission history</h2></div>
        {commissions.length === 0 ? (
          <p className="text-sm text-gray-500 px-5 py-8 text-center">No commissions yet. Share your link to start earning!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-2 font-semibold">Date</th>
                  <th className="text-right px-5 py-2 font-semibold">Payment</th>
                  <th className="text-right px-5 py-2 font-semibold">Your 30%</th>
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
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
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
