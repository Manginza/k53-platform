'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

/**
 * Site-wide language switcher. The chosen language is stored in localStorage;
 * TranslationManager reads it and translates every visible text node on the
 * page (see lib/translate). Switching language reloads the page so translation
 * always starts from the site's original English.
 */
export const STORAGE_KEY = 'sk_lang'

export const LANGS = [
  { code: 'en',  label: 'English' },
  { code: 'af',  label: 'Afrikaans' },
  { code: 'zu',  label: 'isiZulu' },
  { code: 'xh',  label: 'isiXhosa' },
  { code: 'st',  label: 'Sesotho' },
  { code: 'nso', label: 'Sepedi' },
  { code: 'tn',  label: 'Setswana' },
  { code: 'ts',  label: 'Xitsonga' },
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
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && LANGS.some(l => l.code === stored)) setLangState(stored)
    } catch {}
  }, [])

  function setLang(code: string) {
    if (code === lang) return
    try { localStorage.setItem(STORAGE_KEY, code) } catch {}
    setLangState(code)
    // Reload so the page renders clean English, then TranslationManager
    // translates it into the newly selected language.
    location.reload()
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
