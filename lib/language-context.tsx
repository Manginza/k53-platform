'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

/**
 * Site-wide language switcher backed by the Google Website Translator.
 *
 * Selecting a language sets the `googtrans` cookie (which the Google Translate
 * script reads on load) and reloads the page. Google then translates ALL
 * visible page content — every route, including database-driven quiz text —
 * into the chosen language. `code` below is the Google Translate language code.
 */
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

const COOKIE = 'googtrans'

/** Read the current Google Translate target language from the cookie. */
function readCookieLang(): string {
  if (typeof document === 'undefined') return 'en'
  const m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/)
  if (!m) return 'en'
  // Value looks like "/en/xh" — the last segment is the target language.
  const parts = decodeURIComponent(m[1]).split('/')
  const target = parts[parts.length - 1]
  return LANGS.some(l => l.code === target) ? target : 'en'
}

/** Set (or clear) the googtrans cookie across the apex + www domains. */
function writeCookie(code: string) {
  const host = typeof location !== 'undefined' ? location.hostname : ''
  const pair = `/en/${code}`
  const isEnglish = code === 'en'
  const base = isEnglish
    ? `${COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
    : `${COOKIE}=${pair};`

  // Host-only (covers localhost and the exact host).
  document.cookie = `${base} path=/;`

  // Domain-wide, so the choice sticks across apex + www (skip for localhost / IPs).
  if (host && host.includes('.') && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    document.cookie = `${base} path=/; domain=.${host};`
    const bare = host.replace(/^www\./, '')
    if (bare !== host) document.cookie = `${base} path=/; domain=.${bare};`
  }
}

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

  // On mount, reflect whatever Google Translate is currently applying.
  useEffect(() => {
    setLangState(readCookieLang())
  }, [])

  function setLang(code: string) {
    if (code === lang) return
    setLangState(code)
    writeCookie(code)
    // Reload so the Google Translate script picks up the new cookie and
    // re-translates the whole page from the original English source.
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
