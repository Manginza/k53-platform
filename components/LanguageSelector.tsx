"use client"

import { useEffect, useState } from 'react'

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

const STORAGE_KEY = 'sk_lang'

export default function LanguageSelector({ onChange }: { onChange?: (code: string) => void }) {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setLang(stored)
    } catch {}
  }, [])

  function change(code: string) {
    setLang(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch {}
    onChange?.(code)
  }

  return (
    <div className="inline-block">
      <label className="sr-only">Language</label>
      <select
        aria-label="Language"
        value={lang}
        onChange={e => change(e.target.value)}
        className="border rounded-md px-3 py-1 text-sm bg-white"
      >
        {LANGS.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  )
}
