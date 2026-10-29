'use client'

/**
 * LearnButton — sits at the top of a question card. Toggles the Learn panel
 * open or closed, with a clear active state. Keyboard accessible by default.
 */
export default function LearnButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-label="Toggle Learn Mode explanation"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
        active ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
      }`}
    >
      <span aria-hidden="true">💡</span>
      Learn Mode
      <span aria-hidden="true" className="opacity-70">{active ? '▲' : '▼'}</span>
    </button>
  )
}
