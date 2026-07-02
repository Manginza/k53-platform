'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export const LANGS = [
  { code: 'en',  label: 'English' },
  { code: 'af',  label: 'Afrikaans' },
  { code: 'zu',  label: 'isiZulu' },
  { code: 'xh',  label: 'isiXhosa' },
  { code: 'sot', label: 'Sesotho' },
  { code: 've',  label: 'Tshivenda' },
  { code: 'ts',  label: 'Xitsonga' },
  { code: 'tn',  label: 'Setswana' },
  { code: 'nso', label: 'Sepedi' },
  { code: 'ss',  label: 'siSwati' },
]

interface LangCtx {
  lang: string
  setLang: (code: string) => void
  langs: typeof LANGS
  currentLabel: string
}

const LanguageContext = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  langs: LANGS,
  currentLabel: 'English',
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState('en')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sk_lang')
      if (stored && LANGS.some(l => l.code === stored)) setLangState(stored)
    } catch {}
  }, [])

  function setLang(code: string) {
    setLangState(code)
    try { localStorage.setItem('sk_lang', code) } catch {}
  }

  const currentLabel = LANGS.find(l => l.code === lang)?.label ?? 'English'

  return (
    <LanguageContext.Provider value={{ lang, setLang, langs: LANGS, currentLabel }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
