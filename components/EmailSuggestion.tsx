'use client'

/**
 * EmailSuggestion — shows the browser-side email check's verdict under an
 * email field, with a one-tap "Use this" when we can tell what was meant
 * (for example "gmail.con" → "gmail.com").
 *
 * It never blocks typing. The server checks again on submit and is the real gate.
 */
import { checkEmail } from '@/lib/email-check'

export function emailProblemMessage(raw: string): string | null {
  const r = checkEmail(raw)
  return r.ok || r.problem === 'empty' ? null : r.message
}

export default function EmailSuggestion({
  value, onAccept, touched,
}: {
  value: string
  onAccept: (corrected: string) => void
  touched: boolean
}) {
  if (!touched) return null
  const r = checkEmail(value)
  if (r.ok || r.problem === 'empty') return null

  return (
    <div role="alert" className="mt-1.5 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      <p>{r.message}</p>
      {r.suggestion && (
        <button
          type="button"
          onClick={() => onAccept(r.suggestion!)}
          className="mt-1 font-semibold text-blue-700 underline underline-offset-2"
        >
          Use {r.suggestion}
        </button>
      )}
    </div>
  )
}
