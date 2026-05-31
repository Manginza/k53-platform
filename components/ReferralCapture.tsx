'use client'

/**
 * ReferralCapture — invisible component mounted in the root layout.
 *
 * When a visitor arrives on any page with ?ref=CODE it:
 *   1. stores the code in the `sk_ref` cookie (30 days) so it survives
 *      navigation, signup and checkout, and
 *   2. pings /api/affiliate/track to log the click.
 *
 * The cookie is later read at signup (record-referral) and at checkout
 * (create-checkout) to attribute the referral / commission.
 */
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const REF_COOKIE = 'sk_ref'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export default function ReferralCapture() {
  const params = useSearchParams()

  useEffect(() => {
    const code = params.get('ref')
    if (!code) return

    // Persist for cross-page / cross-session attribution
    document.cookie = `${REF_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`

    // Log the click (fire-and-forget)
    fetch('/api/affiliate/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).catch(() => {})
  }, [params])

  return null
}
