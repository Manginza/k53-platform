'use client'

/**
 * LearnPanel — the deeper explanation for a question. Collapsible sections,
 * "Why" open by default, scrollable and keyboard accessible. Opened either
 * automatically (first attempt, or a wrong repeat) or via the Learn button.
 */
import { useState } from 'react'
import type { QuestionExplanation } from '@/lib/learn-mode-logic'
import AlternativeQuestion from '@/components/learn/AlternativeQuestion'

function Section({ title, defaultOpen = false, children }: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-gray-100 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-3 text-left"
      >
        <span className="text-sm font-bold text-gray-900">{title}</span>
        <span aria-hidden="true" className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="pb-3 text-sm leading-relaxed text-gray-700">{children}</div>}
    </div>
  )
}

export default function LearnPanel({ explanation, correctLetter, correctLabel, wasCorrect }: {
  explanation: QuestionExplanation
  correctLetter: string
  correctLabel: string
  /** null when the panel was opened before answering. */
  wasCorrect: boolean | null
}) {
  const hasAlts = explanation.alt_questions.length > 0

  return (
    <div
      className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm"
      role="region"
      aria-label="Learn Mode explanation"
    >
      {wasCorrect !== null && (
        <div className={`px-4 py-3 text-sm font-semibold ${wasCorrect ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}>
          {wasCorrect ? '✅ Correct' : '🟡 Not quite'}
          <span className="ml-2 font-normal opacity-90">
            Correct answer: {correctLetter} — {correctLabel}
          </span>
        </div>
      )}

      <div className="max-h-[60vh] overflow-y-auto px-4 py-1">
        {explanation.why && (
          <Section title="Why this is the answer" defaultOpen>{explanation.why}</Section>
        )}
        {explanation.practical && (
          <Section title="In practical driving terms">{explanation.practical}</Section>
        )}
        {explanation.common_mistake && (
          <Section title="Common mistake">
            <span className="whitespace-pre-line">{explanation.common_mistake}</span>
          </Section>
        )}
        {hasAlts && (
          <Section title="How the traffic department could ask this">
            <div className="space-y-3">
              {explanation.alt_questions.map((alt, i) => (
                <AlternativeQuestion key={i} alt={alt} index={i} />
              ))}
            </div>
          </Section>
        )}
        {explanation.related_href && (
          <div className="border-t border-gray-100 py-3 text-sm">
            <a href={explanation.related_href} className="font-semibold text-blue-700 hover:underline">
              Related: open the Study Guide section →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
