'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/**
 * Fired whenever this banner appears or is accepted. The floating WhatsApp
 * button and the WhatsApp group popup both sit above the banner, so they
 * listen for this and re-measure. The banner mounts hidden and only decides
 * to show inside an effect, so a one-off measurement taken by those
 * components on their own mount would miss it.
 */
export const COOKIE_BANNER_EVENT = 'sk:cookie-banner-change'

/** The banner element carries this so others can measure its height. */
export const COOKIE_BANNER_ATTR = 'data-sk-cookie-banner'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('k53_cookie_consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  // Runs after the banner has actually been added to or removed from the DOM,
  // so listeners measure the real height rather than a stale one.
  useEffect(() => {
    window.dispatchEvent(new Event(COOKIE_BANNER_EVENT))
  }, [showBanner])

  function acceptCookies() {
    localStorage.setItem('k53_cookie_consent', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div data-sk-cookie-banner className="fixed bottom-0 left-0 right-0 bg-brand-950/95 backdrop-blur-md border-t border-white/10 p-4 shadow-2xl z-[999]">
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
