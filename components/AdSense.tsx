'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ADSENSE_SCRIPT_SRC, adsenseAllowed } from '@/lib/adsense'

/** Auto-placed ad slots, removed if a visitor moves from a public page onto a blocked one. */
const PLACED_ADS = 'ins.adsbygoogle, .google-auto-placed'

/**
 * Loads adsbygoogle.js only on public content pages.
 * Sign-in, account, admin, payment, quiz and members' routes are excluded
 * in lib/adsense.ts. GA4, Tag Manager and the Meta Pixel stay in the root layout.
 */
export default function AdSense() {
  const pathname = usePathname()
  const allowed = !!pathname && adsenseAllowed(pathname)

  useEffect(() => {
    if (allowed) return
    document.querySelectorAll(PLACED_ADS).forEach(node => node.remove())
  }, [allowed, pathname])

  if (!allowed) return null

  return (
    <script
      async
      src={ADSENSE_SCRIPT_SRC}
      crossOrigin="anonymous"
    />
  )
}
