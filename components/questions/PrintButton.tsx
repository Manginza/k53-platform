'use client'

/** Opens the browser print dialog, where "Save as PDF" is one of the printers. */
export default function PrintButton({ className = '' }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      Print / Save as PDF
    </button>
  )
}
