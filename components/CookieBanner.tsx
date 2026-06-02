'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Only show if user hasn't accepted yet
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
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 shadow-2xl z-[999]">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-300">
          We use cookies to improve your experience, personalize content, and serve relevant ads. By continuing to use our site, you consent to our use of cookies as described in our <Link href="/cookie-policy" className="text-blue-400 hover:underline">Cookie Policy</Link> and <Link href="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
        </div>
        <button 
          onClick={acceptCookies}
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors shrink-0 whitespace-nowrap"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
