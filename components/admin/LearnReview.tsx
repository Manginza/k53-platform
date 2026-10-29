'use client'

/**
 * LearnReview — admin surface to approve or edit Learn Mode explanations
 * before learners see them. Lists every unreviewed/flagged row with its
 * question, lets an admin edit the prose fields, and approve (reviewed=true).
 * A global toggle lets unreviewed content show to learners when desired.
 */
import { useState } from 'react'
import type { AltQuestion } from '@/lib/learn-mode-logic'

export interface ReviewItem {
  questionId: number
  question: string
  options: string[]
  correctAnswer: string
  imageUrl: string | null
  why: string | null
  practical: string | null
  common_mistake: string | null
  related_href: string | null
  altQuestions: AltQuestion[]
  needsReview: boolean
}

const LETTERS = ['A', 'B', 'C', 'D']

function ItemCard({ item, onApproved }: { item: ReviewItem; onApproved: (id: number) => void }) {
  const [why, setWhy] = useState(item.why ?? '')
  const [practical, setPractical] = useState(item.practical ?? '')
  const [commonMistake, setCommonMistake] = useState(item.common_mistake ?? '')
  const [related, setRelated] = useState(item.related_href ?? '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function send(patch: Record<string, unknown>, approve: boolean) {
    setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/admin/learn-explanations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: item.questionId, ...patch }),
      })
      const body = await res.json()
      if (!res.ok) { setMsg(body.error ?? 'Could not save.'); return }
      if (approve) onApproved(item.questionId)
      else setMsg('Saved.')
    } catch { setMsg('Could not reach the server.') } finally { setBusy(false) }
  }

  const fields = { why, practical, common_mistake: commonMistake, related_href: related }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Question #{item.questionId}</p>
          <p className="mt-0.5 whitespace-pre-line text-sm font-semibold text-gray-900">{item.question}</p>
        </div>
        {item.needsReview && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">Needs review</span>
        )}
      </div>

      <ul className="mb-4 space-y-1 text-sm">
        {item.options.map((opt, i) => (
          <li key={i} className={LETTERS[i] === item.correctAnswer ? 'font-semibold text-green-700' : 'text-gray-600'}>
            {LETTERS[i]}. {opt}{LETTERS[i] === item.correctAnswer ? '  ✓ correct' : ''}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <label className="block text-xs font-bold text-gray-600">Why this is the answer
          <textarea value={why} onChange={e => setWhy(e.target.value)} rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="block text-xs font-bold text-gray-600">In practical driving terms
          <textarea value={practical} onChange={e => setPractical(e.target.value)} rows={2}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="block text-xs font-bold text-gray-600">Common mistake
          <textarea value={commonMistake} onChange={e => setCommonMistake(e.target.value)} rows={2}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="block text-xs font-bold text-gray-600">Related (Study Guide URL)
          <input value={related} onChange={e => setRelated(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
      </div>

      {item.altQuestions.length > 0 && (
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <p className="mb-2 text-xs font-bold text-gray-600">Alternative questions (shown to learners)</p>
          <div className="space-y-2">
            {item.altQuestions.map((alt, i) => (
              <div key={i} className="text-xs text-gray-600">
                <p className="font-semibold text-gray-800">{alt.question}</p>
                <p>{alt.options.map((o, j) => `${LETTERS[j]}. ${o}`).join('  ·  ')}</p>
                <p className="text-green-700">Answer {LETTERS[alt.correct]} — {alt.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button onClick={() => send(fields, false)} disabled={busy}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
          {busy ? 'Saving…' : 'Save edits'}
        </button>
        <button onClick={() => send({ ...fields, reviewed: true }, true)} disabled={busy}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60">
          Approve &amp; publish
        </button>
        {msg && <span className="text-sm text-gray-500">{msg}</span>}
      </div>
    </div>
  )
}

export default function LearnReview({ items, initialShowUnreviewed }: {
  items: ReviewItem[]
  initialShowUnreviewed: boolean
}) {
  const [list, setList] = useState(items)
  const [showUnreviewed, setShowUnreviewed] = useState(initialShowUnreviewed)
  const [flagBusy, setFlagBusy] = useState(false)

  async function toggleFlag() {
    const next = !showUnreviewed
    setFlagBusy(true)
    try {
      const res = await fetch('/api/admin/learn-explanations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showUnreviewed: next }),
      })
      if (res.ok) setShowUnreviewed(next)
    } finally { setFlagBusy(false) }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-extrabold text-blue-700">Learn Mode review</h1>
        <p className="mt-1 text-sm text-gray-500">
          Approve or edit explanations before learners see them. {list.length} awaiting review.
        </p>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <input type="checkbox" checked={showUnreviewed} onChange={toggleFlag} disabled={flagBusy} className="h-4 w-4" />
        <span className="text-sm text-amber-900">
          <span className="font-bold">Show unreviewed explanations to learners.</span> Leave off to publish only approved content.
        </span>
      </label>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">
          Nothing awaiting review. 🎉
        </p>
      ) : (
        <div className="space-y-4">
          {list.map(item => (
            <ItemCard key={item.questionId} item={item} onApproved={id => setList(l => l.filter(x => x.questionId !== id))} />
          ))}
        </div>
      )}
    </main>
  )
}
