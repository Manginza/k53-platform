"use client"

const LANGS: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'zu', label: 'Zulu' },
  { code: 'xh', label: 'Xhosa' },
  { code: 'sot', label: 'Sotho' },
  { code: 've', label: 'Venda' },
  { code: 'ts', label: 'Tsonga' },
  { code: 'tn', label: 'Tswana' },
  { code: 'nso', label: 'Pedi' },
  { code: 'ss', label: 'Swati' },
]

export default function LanguageSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (code: string) => void
}) {
  return (
    <div className="inline-block">
      <label className="sr-only">Language</label>
      <select
        aria-label="Language"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border rounded-md px-3 py-1 text-sm bg-white"
      >
        {LANGS.map(l => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  )
}
