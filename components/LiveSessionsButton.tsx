'use client'

/**
 * LiveSessionsButton — the standing, always-available link to our live
 * sessions on YouTube. Replaces the old WhatsApp group join button.
 *
 * It sits above the cookie banner while that banner is up. The banner is
 * full-width and its height changes with the viewport (it stacks on narrow
 * screens), so the offset is measured from the element itself rather than
 * guessed, and re-measured on resize and when the banner is accepted.
 */
import { useCallback, useEffect, useState } from 'react'
import { LIVE_SESSIONS_URL } from '@/lib/contact'
import { COOKIE_BANNER_ATTR, COOKIE_BANNER_EVENT } from '@/components/CookieBanner'

/** Gap between the button and whatever sits below it. */
const GAP_PX = 20

export default function LiveSessionsButton() {
  const [bottomPx, setBottomPx] = useState(GAP_PX)

  const measure = useCallback(() => {
    const banner = document.querySelector<HTMLElement>(`[${COOKIE_BANNER_ATTR}]`)
    setBottomPx(banner ? banner.offsetHeight + GAP_PX : GAP_PX)
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener(COOKIE_BANNER_EVENT, measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener(COOKIE_BANNER_EVENT, measure)
    }
  }, [measure])

  return (
    <a
      href={LIVE_SESSIONS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Watch our live sessions on YouTube"
      title="Watch our live sessions on YouTube"
      style={{ bottom: bottomPx }}
      className="fixed right-4 sm:right-5 z-[90] flex items-center gap-2 bg-red-600 text-white font-bold rounded-full shadow-lg
                 pl-3.5 pr-4 py-3 hover:bg-red-700 active:scale-[0.97] transition-all duration-200"
    >
      {/* YouTube play glyph */}
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.5 20.45 12 20.45 12 20.45s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.57V8.43L15.82 12l-6.22 3.57Z" />
      </svg>
      <span className="hidden sm:inline text-sm whitespace-nowrap">Watch our live sessions</span>
    </a>
  )
}
