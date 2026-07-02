"use client"

import { useEffect, useState } from 'react'
import LanguageSelector from './LanguageSelector'

type T = {
    title: string
    intro: string
    visionTitle: string
    vision: string
    whyTitle: string
    whyPoints: string[]
}

const TRANSLATIONS: Record<string, Partial<T>> = {
    en: {
          title: 'About Us',
          intro: `Welcome to the K53 Learner's Licence Platform! Our mission is to provide the most accessible, comprehensive, and easy-to-use study materials for the South African K53 Learner's Licence test.`,
          visionTitle: 'Our Vision',
          vision: `We believe that learning the rules of the road should be an engaging and straightforward experience. By combining high-quality study notes with interactive quizzes, we ensure our users are fully prepared to pass their tests on the first try.`,
          whyTitle: 'Why Choose Us?',
          whyPoints: [
                  'Comprehensive Coverage: From road signs to vehicle controls, we cover everything.',
                  'Interactive Quizzes: Test your knowledge with our timed, exam-style questions.',
                  'Accessible Anywhere: Study on your phone, tablet, or computer.',
                ],
    },
    // Other languages default to English for now. Provide translations later.
    af: {},
    zu: {},
    xh: {},
    sot: {},
    ve: {},
    ts: {},
    tn: {},
    nso: {},
    ss: {},
}

function getFor(lang: string): T {
    const base = TRANSLATIONS['en'] as T
    const t = TRANSLATIONS[lang]
    if (!t || Object.keys(t).length === 0) return base
    return { ...base, ...t }
}

export default function TranslatableAbout() {
    const [lang, setLang] = useState('en')
    const [t, setT] = useState<T>(getFor('en'))

  useEffect(() => {
        try {
                const stored = localStorage.getItem('sk_lang')
                if (stored) setLang(stored)
        } catch {}
  }, [])

  useEffect(() => {
        setT(getFor(lang))
  }, [lang])

  return (
        <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
              <div className="flex items-center justify-between mb-8">
                      <h1 className="text-3xl font-extrabold text-gray-900">{t.title}</h1>h1>
                      <LanguageSelector onChange={setLang} />
              </div>div>
        
              <div className="prose prose-blue max-w-none text-gray-600">
                      <p className="mb-4">{t.intro}</p>p>
              
                      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">{t.visionTitle}</h2>h2>
                      <p className="mb-4">{t.vision}</p>p>
              
                      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">{t.whyTitle}</h2>h2>
                      <ul className="list-disc pl-5 mb-4 space-y-2">
                        {t.whyPoints.map(p => (
                      <li key={p}><span dangerouslySetInnerHTML={{ __html: p }} /></li>li>
                    ))}
                      </ul>ul>
              </div>div>
        </main>main>
      )
}</main>
