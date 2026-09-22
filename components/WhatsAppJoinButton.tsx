'use client'

/**
 * WhatsAppJoinButton — the standing invitation to the WhatsApp study group.
 *
 * The first-visit popup appears once and then stays quiet; this button is how
 * every later visit still offers the group, without interrupting anyone.
 *
 * It sits above the cookie banner while that banner is up. The banner is
 * full-width and its height changes with the viewport (it stacks on narrow
 * screens), so the offset is measured from the element itself rather than
 * guessed, and re-measured on resize and when the banner is accepted.
 */
import { useCallback, useEffect, useState } from 'react'
import { WHATSAPP_GROUP_URL } from '@/lib/contact'
import { COOKIE_BANNER_ATTR, COOKIE_BANNER_EVENT } from '@/components/CookieBanner'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'

/** Gap between the button and whatever sits below it. */
const GAP_PX = 20

export default function WhatsAppJoinButton() {
  const [bottomPx, setBottomPx] = useState(GAP_PX)

  const measure = useCallback(() => {
    const banner = document.querySelector<HTMLElement>(`[${COOKIE_BANNER_ATTR}]`)
    setBottomPx(banner ? banner.offsetHeight + GAP_PX : GAP_PX)
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    // The banner decides whether to show inside its own effect, so it tells us
    // when it appears or is accepted rather than us measuring once and hoping.
    window.addEventListener(COOKIE_BANNER_EVENT, measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener(COOKIE_BANNER_EVENT, measure)
    }
  }, [measure])

  return (
    <a
      href={WHATSAPP_GROUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join our WhatsApp group"
      title="Join our WhatsApp group"
      style={{ bottom: bottomPx }}
      className="fixed right-4 sm:right-5 z-[90] flex items-center gap-2 bg-green-600 text-white font-bold rounded-full shadow-lg
                 pl-3.5 pr-4 py-3 hover:bg-green-700 active:scale-[0.97] transition-all duration-200"
    >
      <WhatsAppIcon className="w-6 h-6 shrink-0" />
      <span className="hidden sm:inline text-sm whitespace-nowrap">Join our WhatsApp group</span>
    </a>
  )
}
