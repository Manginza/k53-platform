'use client'

/**
 * AffiliatePayouts — admin view of what each affiliate is owed, with their
 * bank details and a "Mark as paid" button to clear the pending balance after
 * the weekly (Monday) bank transfer.
 */
import { useMemo, useState } from 'react'
import Link from 'next/link'

export interface PayoutRow {
  id: string
  name: string
  email: string
  code: string
  bankAccountName: string
  bankName: string
  accountNumber: string
  accountType: string
  pendingCents: number
  earnedCents: number
  paidCents: number
  /**
   * The exact commission IDs that were pending at page-render time. We
   * pass THESE (not just the affiliateId) to /api/admin/payouts, so any
   * new commissions that landed while the admin was reviewing the page
   * stay pending — never silently marked paid by a "clear all pending"
   * bulk update.
   */
  pendingCommissionIds: string[]
}

function rand(cents: number) {
  return `R${(cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AffiliatePayouts({
  adminEmail, initialRows,
}: {
  adminEmail: string
  initialRows: PayoutRow[]
}) {
  const [rows, setRows] = useState<PayoutRow[]>(initialRows)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const totalOwed = useMemo(() => rows.reduce((s, r) => s + r.pendingCents, 0), [rows])
  const owedCount = rows.filter(r => r.pendingCents > 0).length

  async function markPaid(r: PayoutRow) {
    if (r.pendingCommissionIds.length === 0) return
    if (!confirm(`Mark ${rand(r.pendingCents)} as paid to ${r.name}? Do this only after the bank transfer has gone through.`)) return
    setBusyId(r.id)
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Pass the specific IDs we saw at render — the endpoint verifies
        // they still belong to this affiliate and are still pending,
        // then marks ONLY those paid. Any commission that arrived after
        // render stays pending for next week's payout.
        body: JSON.stringify({ affiliateId: r.id, commissionIds: r.pendingCommissionIds }),
      })
      const body = await res.json()
      if (res.ok) {
        setRows(rs => rs.map(x => x.id === r.id
          ? { ...x, pendingCents: 0, pendingCommissionIds: [], paidCents: x.paidCents + (body.paidCents ?? 0) }
          : x))
      } else {
        alert(body.error ?? 'Could not mark as paid.')
      }
    } finally {
      setBusyId(null)
    }
  }

  function copyBank(r: PayoutRow) {
    const text = `${r.bankAccountName}\n${r.bankName} (${r.accountType})\nAcc: ${r.accountNumber}\nAmount: ${rand(r.pendingCents)}`
    navigator.clipboard.writeText(text).then(() => { setCopied(r.id); setTimeout(() => setCopied(null), 1500) }).catch(() => {})
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700">Affiliate payouts</h1>
          <p className="text-sm text-gray-500 truncate">{adminEmail} · pay weekly (Mondays)</p>
        </div>
        <Link href="/admin" className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 shrink-0">← Admin</Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold text-amber-800">{rand(totalOwed)}</div>
          <div className="text-xs text-amber-700 mt-1">Total owed</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <div className="text-2xl font-extrabold text-gray-900">{owedCount}</div>
          <div className="text-xs text-gray-500 mt-1">Awaiting payout</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <div className="text-2xl font-extrabold text-gray-900">{rows.length}</div>
          <div className="text-xs text-gray-500 mt-1">Affiliates</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100"><h2 className="font-bold text-gray-800">Affiliates</h2></div>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500 px-5 py-8 text-center">No affiliates yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Affiliate</th>
                  <th className="text-left px-4 py-2 font-semibold">Bank details</th>
                  <th className="text-right px-4 py-2 font-semibold">Owed</th>
                  <th className="text-right px-4 py-2 font-semibold">Earned / Paid</th>
                  <th className="text-right px-4 py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(r => (
                  <tr key={r.id} className={r.pendingCents > 0 ? 'bg-amber-50/40' : ''}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{r.name}</div>
                      <div className="text-xs text-gray-400">{r.email} · <span className="font-mono">{r.code}</span></div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{r.bankAccountName || '—'}</div>
                      <div className="text-xs text-gray-400">{r.bankName} {r.accountType && `· ${r.accountType}`}</div>
                      <div className="text-xs text-gray-400 font-mono">{r.accountNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-gray-900">{rand(r.pendingCents)}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      <div>{rand(r.earnedCents)} earned</div>
                      <div>{rand(r.paidCents)} paid</div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.pendingCents > 0 ? (
                        <>
                          <button onClick={() => copyBank(r)} className="text-xs font-semibold text-gray-600 hover:underline mr-3">
                            {copied === r.id ? 'Copied!' : 'Copy'}
                          </button>
                          <button onClick={() => markPaid(r)} disabled={busyId === r.id}
                            className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60">
                            {busyId === r.id ? '…' : 'Mark paid'}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
