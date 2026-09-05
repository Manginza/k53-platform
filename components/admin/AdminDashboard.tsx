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
  /**
   * Commission IDs that were pending at page-render time. Passed to
   * /api/admin/payouts on "Mark paid" so only those specific IDs are
   * cleared — new commissions arriving after render stay pending.
   */
  pendingCommissionIds: string[]
}
export interface CommissionRow {
  id: string; affiliate_id: string; amount_cents: number; commission_cents: number
  status: string; created_at: string
}
export interface TrainerRow {
  id: string; name: string; email: string; slug: string; province: string; phone: string
  learner_price_cents: number; is_active: boolean; fee_paid_until: string | null; created_at: string
}

function fmtDate(iso: string | null): string {
  if (!iso) return 'Lifetime'
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}
function rand(cents: number) {
  return `R${(cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminDashboard({
  adminEmail, initialGrants, initialLinks, initialPayouts, initialCommissions = [], initialRecordingUrl = '', initialTrainers = [], initialPromo = { from: '', until: '' },
}: {
  adminEmail: string
  initialGrants: AdminGrant[]
  initialLinks: SignupLink[]
  initialPayouts: PayoutRow[]
  initialCommissions?: CommissionRow[]
  initialRecordingUrl?: string
  initialTrainers?: TrainerRow[]
  initialPromo?: { from: string; until: string }
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

  // ── Free promo toggle ───────────────────────────────────────────────────────
  const [promoUntil, setPromoUntil] = useState(initialPromo.until ? new Date(initialPromo.until).toLocaleString('sv-SE', { timeZone: 'Africa/Johannesburg' }).replace(' ', 'T').slice(0, 16) : '')
  const [promoActive, setPromoActive] = useState(() => {
    if (!initialPromo.until) return false
    const now = Date.now()
    const f = initialPromo.from ? Date.parse(initialPromo.from) : 0
    const u = Date.parse(initialPromo.until)
    return now >= f && now < u
  })
  const [promoBusy, setPromoBusy] = useState(false)
  const [promoMsg, setPromoMsg] = useState('')

  async function activatePromo(e: React.FormEvent) {
    e.preventDefault(); setPromoBusy(true); setPromoMsg('')
    if (!promoUntil) { setPromoMsg('Pick an end time.'); setPromoBusy(false); return }
    const until = new Date(promoUntil + ':00+02:00').toISOString()
    try {
      const res = await fetch('/api/admin/promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: '', until }),
      })
      const body = await res.json()
      if (res.ok) { setPromoActive(body.active); setPromoMsg(body.active ? 'Free promo is LIVE!' : 'Promo scheduled.') }
      else setPromoMsg(body.error ?? 'Could not save.')
    } catch { setPromoMsg('Could not save.') } finally { setPromoBusy(false) }
  }

  async function stopPromo() {
    setPromoBusy(true); setPromoMsg('')
    try {
      const res = await fetch('/api/admin/promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: '', until: '' }),
      })
      if (res.ok) { setPromoActive(false); setPromoUntil(''); setPromoMsg('Promo stopped.') }
      else setPromoMsg('Could not stop.')
    } catch { setPromoMsg('Could not stop.') } finally { setPromoBusy(false) }
  }

  function quickPromo(hours: number) {
    const d = new Date(Date.now() + hours * 60 * 60 * 1000)
    d.setMinutes(0, 0, 0)
    const local = d.toLocaleString('sv-SE', { timeZone: 'Africa/Johannesburg' }).replace(' ', 'T').slice(0, 16)
    setPromoUntil(local)
  }

  // ── Payment reconciliation ──────────────────────────────────────────────
  const [reconBusy, setReconBusy] = useState(false)
  const [reconResult, setReconResult] = useState<{ checked: number; fixed: number; results: Array<{ checkout_id: string; user_id: string; email?: string; status: string; action: string }> } | null>(null)
  const [reconErr, setReconErr] = useState('')
  async function runReconciliation() {
    setReconBusy(true); setReconErr(''); setReconResult(null)
    try {
      const res = await fetch('/api/admin/reconcile', { method: 'POST' })
      const body = await res.json()
      if (!res.ok) { setReconErr(body.error ?? 'Failed.'); return }
      setReconResult(body)
      if (body.fixed > 0) router.refresh()
    } catch { setReconErr('Could not reach the server.') } finally { setReconBusy(false) }
  }

  // ── Access code lookup ──────────────────────────────────────────────────
  interface CodeRow {
    code: string; status: string; durationDays: number
    validUntil: string | null; redeemedAt: string | null; emailedAt: string | null
    createdAt: string; source: string
  }
  const [codeQuery, setCodeQuery] = useState('')
  const [codeBusy, setCodeBusy] = useState(false)
  const [codeErr, setCodeErr] = useState('')
  const [codeMsg, setCodeMsg] = useState('')
  const [codeResult, setCodeResult] = useState<{ codes: CodeRow[]; accountEmail: string; emailConfigured?: boolean } | null>(null)

  async function lookupCodes(e: React.FormEvent) {
    e.preventDefault()
    setCodeBusy(true); setCodeErr(''); setCodeMsg(''); setCodeResult(null)
    try {
      const res = await fetch(`/api/admin/access-codes?q=${encodeURIComponent(codeQuery.trim())}`)
      const body = await res.json()
      if (!res.ok) { setCodeErr(body.error ?? 'Lookup failed.'); return }
      setCodeResult(body)
      if (body.notFound) setCodeErr('No account with that email address.')
      else if (!body.codes.length) setCodeErr('That account has no access codes. Codes are only issued by a payment.')
    } catch { setCodeErr('Could not reach the server.') } finally { setCodeBusy(false) }
  }

  async function resendCode(code: string) {
    setCodeBusy(true); setCodeErr(''); setCodeMsg('')
    try {
      const res = await fetch('/api/admin/access-codes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
      })
      const body = await res.json()
      if (!res.ok || !body.sent) { setCodeErr(body.error ?? 'Could not send.'); return }
      setCodeMsg(`Emailed to ${body.to}.`)
    } catch { setCodeErr('Could not reach the server.') } finally { setCodeBusy(false) }
  }

  function codeStatusLabel(row: CodeRow): { text: string; cls: string } {
    if (row.status === 'revoked') return { text: 'revoked', cls: 'bg-gray-100 text-gray-500' }
    if (row.redeemedAt || row.status === 'redeemed') return { text: 'used', cls: 'bg-gray-100 text-gray-500' }
    if (row.validUntil && new Date(row.validUntil) <= new Date()) return { text: 'expired', cls: 'bg-gray-100 text-gray-500' }
    return { text: 'usable', cls: 'bg-green-100 text-green-700' }
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
  const [commissions] = useState(initialCommissions)
  const [payBusy, setPayBusy] = useState<string | null>(null)
  const [expandedAff, setExpandedAff] = useState<string | null>(null)
  const [addingAff, setAddingAff] = useState(false)
  const [affForm, setAffForm] = useState({ firstName: '', lastName: '', email: '', bankAccountName: '', bankName: '', accountNumber: '', accountType: 'cheque' })
  const [affBusy, setAffBusy] = useState(false); const [affErr, setAffErr] = useState(''); const [affOk, setAffOk] = useState('')

  const totalOwed = useMemo(() => payouts.reduce((s, r) => s + r.pendingCents, 0), [payouts])
  const totalEarned = useMemo(() => payouts.reduce((s, r) => s + r.earnedCents, 0), [payouts])
  const totalPaid = useMemo(() => payouts.reduce((s, r) => s + r.paidCents, 0), [payouts])

  const commsByAff = useMemo(() => {
    const m = new Map<string, CommissionRow[]>()
    for (const c of commissions) {
      if (!m.has(c.affiliate_id)) m.set(c.affiliate_id, [])
      m.get(c.affiliate_id)!.push(c)
    }
    return m
  }, [commissions])

  async function markPaid(r: PayoutRow) {
    if (r.pendingCommissionIds.length === 0) return
    if (!confirm(`Mark ${rand(r.pendingCents)} as paid to ${r.name}?\n\nBank: ${r.bankName}\nAcc: ${r.accountNumber}\nHolder: ${r.bankAccountName}\n\nOnly confirm after the bank transfer is done.`)) return
    setPayBusy(r.id)
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the specific pending commission IDs we saw at render so
        // any commissions that arrived later stay pending for next week.
        body: JSON.stringify({ affiliateId: r.id, commissionIds: r.pendingCommissionIds }),
      })
      const body = await res.json()
      if (res.ok) setPayouts(ps => ps.map(x => x.id === r.id ? { ...x, pendingCents: 0, pendingCommissionIds: [], paidCents: x.paidCents + (body.paidCents ?? 0) } : x))
      else alert(body.error ?? 'Could not mark as paid.')
    } finally { setPayBusy(null) }
  }

  function copyBank(r: PayoutRow) {
    const text = `Affiliate: ${r.name}\nEmail: ${r.email}\nCode: ${r.code}\nAmount due: ${rand(r.pendingCents)}\n\nBank: ${r.bankName}\nAccount type: ${r.accountType}\nAccount holder: ${r.bankAccountName}\nAccount number: ${r.accountNumber}`
    copy(text, `bank-${r.id}`)
  }

  async function addAffiliate(e: React.FormEvent) {
    e.preventDefault(); setAffBusy(true); setAffErr(''); setAffOk('')
    try {
      const res = await fetch('/api/admin/affiliates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(affForm) })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not add affiliate.')
      const a = body.affiliate
      setPayouts(ps => [{ id: a.id, name: [a.first_name, a.last_name].filter(Boolean).join(' ') || '—', email: a.email ?? '', code: a.code, bankAccountName: a.bank_account_name ?? '', bankName: a.bank_name ?? '', accountNumber: a.account_number ?? '', accountType: a.account_type ?? '', pendingCents: 0, earnedCents: 0, paidCents: 0, pendingCommissionIds: [] }, ...ps])
      setAffOk(`Affiliate added. Invite email sent to ${affForm.email}.`)
      setAffForm({ firstName: '', lastName: '', email: '', bankAccountName: '', bankName: '', accountNumber: '', accountType: 'cheque' })
      setAddingAff(false)
    } catch (err) { setAffErr(err instanceof Error ? err.message : 'Something went wrong.') } finally { setAffBusy(false) }
  }

  // ── Trainers ──────────────────────────────────────────────────────────────
  const [trainers, setTrainers] = useState(initialTrainers)
  const [tName, setTName] = useState(''); const [tEmail, setTEmail] = useState(''); const [tSlug, setTSlug] = useState('')
  const [tProvince, setTProvince] = useState(''); const [tPhone, setTPhone] = useState(''); const [tPrice, setTPrice] = useState('')
  const [tPaidUntil, setTPaidUntil] = useState(''); const [tBusy, setTBusy] = useState(false); const [tErr, setTErr] = useState(''); const [tOk, setTOk] = useState('')
  function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

  async function addTrainer(e: React.FormEvent) {
    e.preventDefault(); setTBusy(true); setTErr(''); setTOk('')
    try {
      const res = await fetch('/api/admin/trainers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tName, email: tEmail, slug: tSlug, province: tProvince, phone: tPhone, learner_price_cents: tPrice ? Math.round(parseFloat(tPrice) * 100) : 0, fee_paid_until: tPaidUntil || null }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not add trainer.')
      setTrainers(ts => [body.trainer, ...ts])
      setTOk(`Trainer added. Invite email sent to ${tEmail}.`)
      setTName(''); setTEmail(''); setTSlug(''); setTProvince(''); setTPhone(''); setTPrice(''); setTPaidUntil('')
    } catch (err) { setTErr(err instanceof Error ? err.message : 'Something went wrong.') } finally { setTBusy(false) }
  }

  async function toggleTrainer(t: TrainerRow) {
    const res = await fetch('/api/admin/trainers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, is_active: !t.is_active, fee_paid_until: t.fee_paid_until }) })
    if (res.ok) setTrainers(ts => ts.map(x => x.id === t.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function deleteTrainer(id: string) {
    if (!confirm('Delete this trainer? This cannot be undone.')) return
    const res = await fetch('/api/admin/trainers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) setTrainers(ts => ts.filter(x => x.id !== id))
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

      {/* ── Free promo toggle ── */}
      <section className="space-y-3">
        <h2 className="font-extrabold text-gray-900">Free access promo</h2>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-block w-3 h-3 rounded-full ${promoActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className={`text-sm font-bold ${promoActive ? 'text-green-700' : 'text-gray-500'}`}>
              {promoActive ? 'LIVE — course is free right now' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Make the entire course free until a specific time. No deploy needed — takes effect instantly.
          </p>
          <form onSubmit={activatePromo} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="datetime-local" value={promoUntil} onChange={e => setPromoUntil(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button type="submit" disabled={promoBusy}
                className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60 shrink-0">
                {promoBusy ? 'Saving…' : 'Activate free promo'}
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs text-gray-500 py-1">Quick:</span>
              <button type="button" onClick={() => quickPromo(1)} className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 font-medium">+1 hour</button>
              <button type="button" onClick={() => quickPromo(2)} className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 font-medium">+2 hours</button>
              <button type="button" onClick={() => quickPromo(3)} className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 font-medium">+3 hours</button>
              <button type="button" onClick={() => quickPromo(6)} className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 font-medium">+6 hours</button>
            </div>
          </form>
          {promoActive && (
            <button onClick={stopPromo} disabled={promoBusy}
              className="mt-3 w-full bg-red-50 text-red-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-red-100 disabled:opacity-60 border border-red-200">
              Stop promo now
            </button>
          )}
          {promoMsg && <p className="text-sm mt-2 font-medium text-green-600">{promoMsg}</p>}
        </div>
      </section>

      {/* ── Payment reconciliation ── */}
      <section className="space-y-3">
        <h2 className="font-extrabold text-gray-900">Payment recovery</h2>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-xs text-gray-500 mb-3">
            Checks all checkout sessions against Yoco. If someone paid but didn&apos;t get access (e.g. browser closed, session expired), this fixes it automatically.
          </p>
          <button onClick={runReconciliation} disabled={reconBusy}
            className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60">
            {reconBusy ? 'Checking Yoco…' : 'Recover missing payments'}
          </button>
          {reconErr && <p className="text-red-500 text-sm mt-2">{reconErr}</p>}
          {reconResult && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">
                Checked {reconResult.checked} users — <span className="text-green-600 font-bold">{reconResult.fixed} recovered</span>
              </p>
              {reconResult.results.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-gray-600 max-h-48 overflow-y-auto">
                  {reconResult.results.map(r => (
                    <li key={r.checkout_id} className={r.action === 'granted' ? 'text-green-700 font-medium' : 'text-gray-500'}>
                      {r.email ?? r.user_id.slice(0, 8)} — {r.status} — {r.action}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Access code lookup ── */}
      <section className="space-y-3">
        <h2 className="font-extrabold text-gray-900">Find an access code</h2>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-xs text-gray-500 mb-3">
            For a caller who paid but cannot get in. Search by the email they paid with, or by the
            code itself. Read the code out and have them enter it at <strong>/access-code</strong> while
            signed in to the account they want unlocked — it unlocks whichever account they are
            signed in to, which is the fix when someone has signed up twice.
          </p>
          <form onSubmit={lookupCodes} className="flex flex-col sm:flex-row gap-2">
            <input
              value={codeQuery}
              onChange={e => setCodeQuery(e.target.value)}
              placeholder="email@example.com or SK-A3F9-KM2P-7QXW"
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={codeBusy || !codeQuery.trim()}
              className="bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-800 disabled:opacity-60 shrink-0"
            >
              {codeBusy ? 'Searching…' : 'Search'}
            </button>
          </form>
          {codeErr && <p className="text-red-600 text-sm mt-3">{codeErr}</p>}
          {codeMsg && <p className="text-green-700 text-sm mt-3">{codeMsg}</p>}
          {codeResult?.emailConfigured === false && codeResult.codes.length > 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
              Email sending is not set up, so codes are not reaching customers by themselves.
              Read this one out. Set RESEND_API_KEY and EMAIL_FROM to turn sending on.
            </p>
          )}
        </div>

        {codeResult && codeResult.codes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {codeResult.accountEmail && (
              <p className="px-5 pt-4 text-xs text-gray-500">Account: <strong className="text-gray-700">{codeResult.accountEmail}</strong></p>
            )}
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide"><tr>
                <th className="text-left px-5 py-2 font-semibold">Code</th>
                <th className="text-left px-5 py-2 font-semibold">Status</th>
                <th className="text-left px-5 py-2 font-semibold">Days</th>
                <th className="text-left px-5 py-2 font-semibold">Issued</th>
                <th className="text-right px-5 py-2 font-semibold">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {codeResult.codes.map(row => {
                  const st = codeStatusLabel(row)
                  return (
                    <tr key={row.code}>
                      <td className="px-5 py-3 font-mono font-bold tracking-wide whitespace-nowrap">{row.code}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.text}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{row.durationDays}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {fmtDate(row.createdAt)}
                        <span className="block text-gray-400">{row.emailedAt ? 'emailed' : 'not emailed'}</span>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button onClick={() => copy(row.code, row.code)} className="text-xs font-semibold text-blue-700 hover:underline mr-3">
                          {copied === row.code ? 'Copied!' : 'Copy'}
                        </button>
                        <button onClick={() => resendCode(row.code)} disabled={codeBusy} className="text-xs font-semibold text-gray-600 hover:underline disabled:opacity-50">
                          Resend
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table></div>
          </div>
        )}
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

      {/* ── Affiliate dashboard ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-extrabold text-gray-900">Affiliates ({payouts.length})</h2>
          <button onClick={() => setAddingAff(a => !a)} className="text-xs font-bold bg-blue-700 text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors">
            {addingAff ? 'Cancel' : '+ Add affiliate'}
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-xl font-extrabold text-amber-800">{rand(totalOwed)}</p>
            <p className="text-xs text-amber-600 mt-0.5 font-semibold">Total owed now</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-xl font-extrabold text-gray-800">{rand(totalEarned)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total earned (lifetime)</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-xl font-extrabold text-green-800">{rand(totalPaid)}</p>
            <p className="text-xs text-green-600 mt-0.5">Total paid out</p>
          </div>
        </div>

        {/* Add affiliate form */}
        {addingAff && (
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-xs text-gray-500 mb-3">An invite email is sent so the affiliate can set their password and access their dashboard.</p>
            <form onSubmit={addAffiliate} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={affForm.firstName} onChange={e => setAffForm(f => ({ ...f, firstName: e.target.value }))} required placeholder="First name *" className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input value={affForm.lastName} onChange={e => setAffForm(f => ({ ...f, lastName: e.target.value }))} required placeholder="Last name *" className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input value={affForm.email} onChange={e => setAffForm(f => ({ ...f, email: e.target.value }))} type="email" required placeholder="Email address *" className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input value={affForm.bankAccountName} onChange={e => setAffForm(f => ({ ...f, bankAccountName: e.target.value }))} placeholder="Account holder name" className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input value={affForm.bankName} onChange={e => setAffForm(f => ({ ...f, bankName: e.target.value }))} placeholder="Bank name (e.g. FNB)" className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input value={affForm.accountNumber} onChange={e => setAffForm(f => ({ ...f, accountNumber: e.target.value }))} placeholder="Account number" inputMode="numeric" className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {affErr && <p className="text-xs text-red-600">{affErr}</p>}
              {affOk && <p className="text-xs text-green-600">{affOk}</p>}
              <button type="submit" disabled={affBusy} className="bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-800 disabled:opacity-50 text-sm">
                {affBusy ? 'Adding…' : 'Add Affiliate & Send Invite'}
              </button>
            </form>
          </div>
        )}

        {/* Per-affiliate cards */}
        {payouts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No affiliates yet.</p>
        ) : (
          <div className="space-y-3">
            {payouts.map(r => {
              const affComms = commsByAff.get(r.id) ?? []
              const isExpanded = expandedAff === r.id
              const missingBank = !r.bankAccountName || !r.bankName || !r.accountNumber
              return (
                <div key={r.id} className={`bg-white rounded-2xl shadow-sm border ${r.pendingCents > 0 ? 'border-amber-300' : 'border-gray-200'}`}>
                  {/* Header row */}
                  <div className="p-4 flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900">{r.name}</span>
                        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.code}</span>
                        {missingBank && <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">⚠ No bank details</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{r.email}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {r.pendingCents > 0 && (
                        <span className="text-sm font-extrabold text-amber-700">{rand(r.pendingCents)} due</span>
                      )}
                      <button onClick={() => setExpandedAff(isExpanded ? null : r.id)} className="text-xs text-blue-600 hover:underline font-semibold">
                        {isExpanded ? 'Close ▲' : 'Details ▼'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 space-y-4">
                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-amber-50 rounded-xl p-3"><p className="font-extrabold text-amber-800">{rand(r.pendingCents)}</p><p className="text-xs text-amber-600 mt-0.5">Pending</p></div>
                        <div className="bg-gray-50 rounded-xl p-3"><p className="font-extrabold text-gray-800">{rand(r.earnedCents)}</p><p className="text-xs text-gray-500 mt-0.5">Earned</p></div>
                        <div className="bg-green-50 rounded-xl p-3"><p className="font-extrabold text-green-800">{rand(r.paidCents)}</p><p className="text-xs text-green-600 mt-0.5">Paid out</p></div>
                      </div>

                      {/* Bank details */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Bank details</p>
                        {missingBank ? (
                          <p className="text-sm text-red-500">No bank details on file. Affiliate must update from their dashboard.</p>
                        ) : (
                          <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
                            <dt className="text-gray-500">Account holder</dt><dd className="text-gray-800 font-medium text-right">{r.bankAccountName}</dd>
                            <dt className="text-gray-500">Bank</dt><dd className="text-gray-800 text-right">{r.bankName}</dd>
                            <dt className="text-gray-500">Account number</dt><dd className="text-gray-800 font-mono text-right">{r.accountNumber}</dd>
                            <dt className="text-gray-500">Account type</dt><dd className="text-gray-800 text-right capitalize">{r.accountType || '—'}</dd>
                          </dl>
                        )}
                      </div>

                      {/* Actions */}
                      {r.pendingCents > 0 && !missingBank && (
                        <div className="flex gap-2">
                          <button onClick={() => copyBank(r)} className="flex-1 text-sm font-semibold border-2 border-gray-300 rounded-xl py-2.5 hover:border-blue-400 transition-colors">
                            {copied === `bank-${r.id}` ? '✓ Copied!' : '📋 Copy bank details'}
                          </button>
                          <button onClick={() => markPaid(r)} disabled={payBusy === r.id}
                            className="flex-1 text-sm font-bold bg-green-600 text-white rounded-xl py-2.5 hover:bg-green-700 disabled:opacity-60 transition-colors">
                            {payBusy === r.id ? 'Saving…' : `✓ Mark ${rand(r.pendingCents)} as paid`}
                          </button>
                        </div>
                      )}

                      {/* Commission history */}
                      {affComms.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Commission history ({affComms.length})</p>
                          <div className="rounded-xl overflow-hidden border border-gray-200">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50 text-gray-400">
                                <tr>
                                  <th className="text-left px-3 py-2 font-medium">Date</th>
                                  <th className="text-right px-3 py-2 font-medium">Payment</th>
                                  <th className="text-right px-3 py-2 font-medium">Commission</th>
                                  <th className="text-right px-3 py-2 font-medium">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {affComms.slice(0, 20).map(c => (
                                  <tr key={c.id}>
                                    <td className="px-3 py-2 text-gray-600">{new Date(c.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td className="px-3 py-2 text-right text-gray-500">{rand(c.amount_cents)}</td>
                                    <td className="px-3 py-2 text-right font-semibold text-gray-800">{rand(c.commission_cents)}</td>
                                    <td className="px-3 py-2 text-right">
                                      <span className={`px-2 py-0.5 rounded-full font-medium ${c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {affComms.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No commissions yet.</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Trainers ── */}
      <section className="space-y-3">
        <h2 className="font-extrabold text-gray-900">Trainers ({trainers.length})</h2>
        <div className="bg-white rounded-2xl shadow-md p-5 space-y-4">
          <form onSubmit={addTrainer} className="space-y-3">
            <p className="text-xs text-gray-500">Add a trainer manually. An invite email is sent so they can set their password.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={tName} onChange={e => { setTName(e.target.value); if (!tSlug || tSlug === slugify(tName)) setTSlug(slugify(e.target.value)) }} required placeholder="Full name *"
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={tEmail} onChange={e => setTEmail(e.target.value)} type="email" required placeholder="Email address *"
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <span className="px-3 py-2.5 text-xs text-gray-400 bg-gray-50 border-r border-gray-300 whitespace-nowrap">/t/</span>
                <input value={tSlug} onChange={e => setTSlug(slugify(e.target.value))} required placeholder="page-url *"
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none" />
              </div>
              <input value={tProvince} onChange={e => setTProvince(e.target.value)} placeholder="Province"
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={tPhone} onChange={e => setTPhone(e.target.value)} placeholder="Phone"
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={tPrice} onChange={e => setTPrice(e.target.value)} type="number" min="0" placeholder="Learner price (R)"
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div>
                <label className="text-xs text-gray-500 block mb-1">Fee paid until</label>
                <input value={tPaidUntil} onChange={e => setTPaidUntil(e.target.value)} type="date"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {tErr && <p className="text-xs text-red-600">{tErr}</p>}
            {tOk && <p className="text-xs text-green-600">{tOk}</p>}
            <button type="submit" disabled={tBusy} className="bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-800 disabled:opacity-50 text-sm transition-colors">
              {tBusy ? 'Adding…' : 'Add Trainer & Send Invite'}
            </button>
          </form>

          {trainers.length > 0 && (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Page</th>
                  <th className="pb-2 pr-4 font-medium">Province</th>
                  <th className="pb-2 pr-4 font-medium">Price</th>
                  <th className="pb-2 pr-4 font-medium">Paid until</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium"></th>
                </tr></thead>
                <tbody>
                  {trainers.map(t => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900">{t.name}<br /><span className="text-gray-400 font-normal">{t.email}</span></td>
                      <td className="py-2 pr-4">
                        <a href={`/t/${t.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/t/{t.slug}</a>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{t.province || '—'}</td>
                      <td className="py-2 pr-4 text-gray-700">{t.learner_price_cents ? `R${(t.learner_price_cents / 100).toFixed(0)}` : '—'}</td>
                      <td className="py-2 pr-4 text-gray-500">{t.fee_paid_until ? new Date(t.fee_paid_until).toLocaleDateString('en-ZA') : '—'}</td>
                      <td className="py-2 pr-4">
                        <button onClick={() => toggleTrainer(t)}
                          className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${t.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                          {t.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-2 text-right">
                        <button onClick={() => deleteTrainer(t.id)} className="text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
