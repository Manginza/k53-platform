import { NextResponse } from 'next/server'
import { getPromoWindow, isPromoActiveNow } from '@/lib/settings'
import { FREE_PROMO_FROM, FREE_PROMO_UNTIL, isFreePromoActive } from '@/lib/contact'

export const dynamic = 'force-dynamic'

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Surrogate-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  // Check hardcoded promo first (reliable, no caching issues)
  if (FREE_PROMO_UNTIL) {
    return NextResponse.json({
      active: isFreePromoActive(),
      from: FREE_PROMO_FROM,
      until: FREE_PROMO_UNTIL,
    }, { headers: NO_CACHE })
  }

  // Fall back to DB-backed promo window
  try {
    const window = await getPromoWindow()
    if (window.until) {
      return NextResponse.json({
        active: isPromoActiveNow(window),
        from: window.from,
        until: window.until,
      }, { headers: NO_CACHE })
    }
  } catch { /* fall through */ }

  return NextResponse.json({
    active: false,
    from: '',
    until: '',
  }, { headers: NO_CACHE })
}
