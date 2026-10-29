'use client'

/**
 * AlternativeQuestion — one traffic-department-style variation the learner can
 * answer for practice. Tapping an option reveals which is correct and why.
 * Practice only: it never counts towards scores or progress.
 */
import { useState } from 'react'
import type { AltQuestion } from '@/lib/learn-mode-logic'

const LETTERS = ['A', 'B', 'C', 'D']

export default function AlternativeQuestion({ alt, index }: { alt: AltQuestion; index: number }) {
  const [picked, setPicked] = useState<number | null>(null)
  const revealed = picked !== null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
        Practice variation {index + 1}
      </p>
      <p className="mb-2 text-sm font-semibold text-gray-900">{alt.question}</p>

      <div className="space-y-2">
        {alt.options.map((opt, i) => {
          const isCorrect = i === alt.correct
          const isPicked = i === picked
          let cls = 'border-gray-200 bg-white hover:border-blue-400'
          if (revealed && isCorrect) cls = 'border-green-500 bg-green-50'
          else if (revealed && isPicked) cls = 'border-red-400 bg-red-50'
          else if (revealed) cls = 'border-gray-100 bg-gray-50 opacity-60'
          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => setPicked(i)}
              className={`flex w-full items-start gap-2 rounded-lg border-2 px-3 py-2 text-left text-sm transition-colors ${cls}`}
            >
              <span className="shrink-0 font-bold text-gray-500">{LETTERS[i]}</span>
              <span className="pt-px">{opt}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${
          picked === alt.correct ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'
        }`}>
          <span className="font-semibold">
            {picked === alt.correct ? 'Correct. ' : `Answer: ${LETTERS[alt.correct]}. `}
          </span>
          {alt.reason}
          <span className="mt-1 block text-[11px] text-gray-400">
            Practice only — this does not affect your score.
          </span>
        </div>
      )}
    </div>
  )
}
