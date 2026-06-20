'use client'

import { useState } from 'react'

type Learner = {
  id: number; name: string; email: string; phone: string | null
  is_paid: boolean; paid_at: string | null; amount_cents: number | null; created_at: string
}
type Material = {
  id: number; title: string; description: string | null; type: string
  url: string | null; content: string | null; sort_order: number
}
type Trainer = {
  slug: string; name: string; learner_price_cents: number; is_active: boolean; fee_paid_until: string | null
}

const TYPE_LABELS: Record<string, string> = { pdf: 'PDF', video: 'Video', link: 'Link', note: 'Note' }
const TYPE_ICONS: Record<string, string> = { pdf: '📄', video: '🎬', link: '🔗', note: '📝' }

export default function TrainerDashboardClient({
  trainer, initialLearners, initialMaterials,
}: {
  trainer: Trainer
  initialLearners: Learner[]
  initialMaterials: Material[]
}) {
  const [tab, setTab] = useState<'learners' | 'materials'>('learners')
  const [learners, setLearners] = useState(initialLearners)
  const [materials, setMaterials] = useState(initialMaterials)

  // ── Learner actions ────────────────────────────────────────────────────────
  async function togglePaid(l: Learner) {
    const res = await fetch('/api/t/learners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: l.id, is_paid: !l.is_paid, amount_cents: trainer.learner_price_cents || null }),
    })
    if (res.ok) setLearners(prev => prev.map(x => x.id === l.id ? { ...x, is_paid: !x.is_paid } : x))
  }

  async function removeLearner(id: number) {
    if (!confirm('Remove this learner?')) return
    const res = await fetch('/api/t/learners', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setLearners(prev => prev.filter(x => x.id !== id))
  }

  // ── Material actions ────────────────────────────────────────────────────────
  const [adding, setAdding] = useState(false)
  const [mTitle, setMTitle] = useState('')
  const [mType, setMType] = useState<'pdf' | 'video' | 'link' | 'note'>('link')
  const [mUrl, setMUrl] = useState('')
  const [mContent, setMContent] = useState('')
  const [mDesc, setMDesc] = useState('')
  const [mLoading, setMLoading] = useState(false)

  async function addMaterial(e: React.FormEvent) {
    e.preventDefault()
    setMLoading(true)
    const res = await fetch('/api/t/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: mTitle, description: mDesc, type: mType, url: mUrl || null, content: mContent || null }),
    })
    const data = await res.json()
    if (res.ok) {
      setMaterials(prev => [...prev, data.material])
      setMTitle(''); setMUrl(''); setMContent(''); setMDesc(''); setAdding(false)
    }
    setMLoading(false)
  }

  async function deleteMaterial(id: number) {
    if (!confirm('Delete this material?')) return
    const res = await fetch('/api/t/materials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setMaterials(prev => prev.filter(x => x.id !== id))
  }

  const paidCount = learners.filter(l => l.is_paid).length
  const totalEarnings = learners.filter(l => l.is_paid && l.amount_cents).reduce((s, l) => s + (l.amount_cents ?? 0), 0)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Status banner */}
      {!trainer.is_active && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-800">
          <strong>Pending activation.</strong> Your account is awaiting payment confirmation. Email proof of your Yoco payment to{' '}
          <a href="mailto:support@skdriving.co.za" className="underline">support@skdriving.co.za</a>.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total learners', value: learners.length },
          { label: 'Paid learners', value: paidCount },
          { label: 'Materials', value: materials.length },
          { label: 'Est. earnings', value: `R${(totalEarnings / 100 * 0.6667).toFixed(0)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Your link */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Your public page</p>
          <p className="text-sm font-bold text-blue-900">skdriving.co.za/t/{trainer.slug}</p>
        </div>
        <a href={`/t/${trainer.slug}`} target="_blank" rel="noopener noreferrer"
          className="shrink-0 bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors">
          View page ↗
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['learners', 'materials'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === t ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'}`}>
            {t === 'learners' ? `Learners (${learners.length})` : `Materials (${materials.length})`}
          </button>
        ))}
      </div>

      {/* Learners tab */}
      {tab === 'learners' && (
        <div className="space-y-3">
          {learners.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">No learners yet. Share your page link to get started.</p>
          )}
          {learners.map(l => (
            <div key={l.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{l.name}</p>
                <p className="text-xs text-gray-500">{l.email}{l.phone ? ` · ${l.phone}` : ''}</p>
                <p className="text-xs text-gray-400 mt-0.5">Joined {new Date(l.created_at).toLocaleDateString('en-ZA')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => togglePaid(l)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${l.is_paid ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                  {l.is_paid ? '✓ Paid' : 'Mark paid'}
                </button>
                <button onClick={() => removeLearner(l.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Materials tab */}
      {tab === 'materials' && (
        <div className="space-y-3">
          {materials.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{TYPE_ICONS[m.type] ?? '📎'}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{m.title}</p>
                  <p className="text-xs text-gray-500">{TYPE_LABELS[m.type]}{m.description ? ` · ${m.description}` : ''}</p>
                  {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{m.url}</a>}
                  {m.content && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.content}</p>}
                </div>
              </div>
              <button onClick={() => deleteMaterial(m.id)} className="shrink-0 text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                Delete
              </button>
            </div>
          ))}

          {adding ? (
            <form onSubmit={addMaterial} className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Add material</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={mTitle} onChange={e => setMTitle(e.target.value)} required placeholder="Title *"
                  className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={mType} onChange={e => setMType(e.target.value as typeof mType)}
                  className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="link">Link</option>
                  <option value="pdf">PDF link</option>
                  <option value="video">Video link</option>
                  <option value="note">Text note</option>
                </select>
              </div>
              {mType !== 'note' && (
                <input value={mUrl} onChange={e => setMUrl(e.target.value)} placeholder="URL (https://…)"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
              {mType === 'note' && (
                <textarea value={mContent} onChange={e => setMContent(e.target.value)} rows={4} placeholder="Note content…"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
              <input value={mDesc} onChange={e => setMDesc(e.target.value)} placeholder="Short description (optional)"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-2">
                <button type="submit" disabled={mLoading}
                  className="bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-800 disabled:opacity-50 text-sm transition-colors">
                  {mLoading ? 'Adding…' : 'Add material'}
                </button>
                <button type="button" onClick={() => setAdding(false)}
                  className="text-sm text-gray-500 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium">
              + Add material
            </button>
          )}
        </div>
      )}
    </div>
  )
}
