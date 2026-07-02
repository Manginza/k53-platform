"use client"

import { useLang } from '@/lib/language-context'
import TranslatableAbout from '@/components/TranslatableAbout'

export default function AboutPage() {
  const { lang } = useLang()

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">About Us</h1>
      <TranslatableAbout lang={lang} />
    </main>
  )
}
