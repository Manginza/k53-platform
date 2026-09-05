"use client"

import { useEffect, useState } from 'react'
import LanguageSelector from '@/components/LanguageSelector'
import TranslatableAbout from '@/components/TranslatableAbout'

export default function AboutPage() {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sk_lang')
      if (stored) setLang(stored)
    } catch {
      // ignore
    }
  }, [])

  function handleLanguageChange(code: string) {
    setLang(code)
    try {
      localStorage.setItem('sk_lang', code)
    } catch {
      // ignore
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">About Us</h1>
          <p className="text-sm text-gray-600 mt-2">Select a language below to translate the About page.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Language</span>
          <LanguageSelector value={lang} onChange={handleLanguageChange} />
        </div>
      </div>

      <TranslatableAbout lang={lang} />
    </main>
  )
}
