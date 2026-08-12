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
import { normalizeReferralCode, REF_COOKIE, REF_COOKIE_MAX_AGE } from '@/lib/referral'

export default function ReferralCapture() {
  const params = useSearchParams()

  useEffect(() => {
    const code = normalizeReferralCode(params.get('ref'))
    if (!code) return

    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${REF_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=${REF_COOKIE_MAX_AGE}; SameSite=Lax${secure}`

    const clickKey = `sk_ref_click_${code}`
    try {
      if (sessionStorage.getItem(clickKey)) return
      sessionStorage.setItem(clickKey, '1')
    } catch {}

    // Log the click (fire-and-forget)
    fetch('/api/affiliate/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      keepalive: true,
    }).catch(() => {})
  }, [params])

  return null
}
