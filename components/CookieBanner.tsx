'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('k53_cookie_consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  function acceptCookies() {
    localStorage.setItem('k53_cookie_consent', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-950/95 backdrop-blur-md border-t border-white/10 p-4 shadow-2xl z-[999]">
      <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-300 leading-relaxed">
          We use cookies to improve your experience, personalize content, and serve relevant ads. By continuing to use our site, you consent to our use of cookies as described in our <Link href="/cookie-policy" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">Cookie Policy</Link> and <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">Privacy Policy</Link>.
        </div>
        <button
          onClick={acceptCookies}
          className="bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-brand-500 transition-all duration-200 shrink-0 whitespace-nowrap active:scale-[0.97]"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
