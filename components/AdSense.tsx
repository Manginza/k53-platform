'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ADSENSE_SCRIPT_SRC, adsenseAllowed } from '@/lib/adsense'
import { CONSENT_GRANTED_EVENT, hasConsent } from '@/lib/analytics'

/** Auto-placed ad slots, removed if a visitor moves from a public page onto a blocked one. */
const PLACED_ADS = 'ins.adsbygoogle, .google-auto-placed'

/** Marks the live ads script once added, so it is never added twice. */
const LIVE_MARK = 'data-sk-adsense-live'

/**
 * Loads adsbygoogle.js only on public content pages, and only after the
 * visitor has tapped Accept on the cookie banner.
 *
 *   - Sign-in, account, admin, payment, quiz and members' routes are excluded
 *     in lib/adsense.ts.
 *   - Before consent (and for ever after Decline) the page carries only an
 *     inert placeholder (type="text/plain": browsers never run it). It keeps
 *     the AdSense address visible in the page source, but sets no cookie and
 *     contacts no Google ad server.
 *   - On Accept, the real script is added by hand. React cannot do this for
 *     us: it deliberately stops script tags it creates on the client from
 *     running.
 *
 * GA4, Tag Manager and the Meta Pixel stay in the root layout, with their own
 * consent handling.
 */
export default function AdSense() {
  const pathname = usePathname()
  const allowed = !!pathname && adsenseAllowed(pathname)
  const [consented, setConsented] = useState(false)

  // Pick up an earlier Accept, and a new one made on this page.
  useEffect(() => {
    setConsented(hasConsent())
    const onAccept = () => setConsented(true)
    window.addEventListener(CONSENT_GRANTED_EVENT, onAccept)
    return () => window.removeEventListener(CONSENT_GRANTED_EVENT, onAccept)
  }, [])

  // Add the real script once, when this page may show ads and consent is given.
  useEffect(() => {
    if (!allowed || !consented) return
    if (document.querySelector(`script[${LIVE_MARK}]`)) return
    const script = document.createElement('script')
    script.async = true
    script.src = ADSENSE_SCRIPT_SRC
    script.crossOrigin = 'anonymous'
    script.setAttribute(LIVE_MARK, '1')
    document.head.appendChild(script)
  }, [allowed, consented])

  // Moving from a public page onto a blocked one: take any placed ads down.
  useEffect(() => {
    if (allowed) return
    document.querySelectorAll(PLACED_ADS).forEach(node => node.remove())
  }, [allowed, pathname])

  if (!allowed) return null
  return <script type="text/plain" data-sk-adsense-src={ADSENSE_SCRIPT_SRC} />
}
