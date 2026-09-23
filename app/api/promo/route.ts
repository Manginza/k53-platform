import { NextResponse } from 'next/server'
import { getPromoWindow, isPromoActiveNow } from '@/lib/settings'
import { FREE_PROMO_FROM, FREE_PROMO_UNTIL, isFreePromoActive } from '@/lib/contact'

export const dynamic = 'force-dynamic'

// This route is fetched by the promo banner on every page load. The response
// is the same for everyone, so let the CDN serve it and collapse a spike into
// a few origin hits. The banner runs its own client-side countdown from
// `from`/`until`, so a few seconds of staleness on `active` is harmless.
const SHARED_CACHE = {
  'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60, max-age=0',
  'CDN-Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
}

export async function GET() {
  // Check hardcoded promo first (reliable, no caching issues)
  if (FREE_PROMO_UNTIL) {
    return NextResponse.json({
      active: isFreePromoActive(),
      from: FREE_PROMO_FROM,
      until: FREE_PROMO_UNTIL,
    }, { headers: SHARED_CACHE })
  }

  // Fall back to DB-backed promo window
  try {
    const window = await getPromoWindow()
    if (window.until) {
      return NextResponse.json({
        active: isPromoActiveNow(window),
        from: window.from,
        until: window.until,
      }, { headers: SHARED_CACHE })
    }
  } catch { /* fall through */ }

  return NextResponse.json({
    active: false,
    from: '',
    until: '',
  }, { headers: SHARED_CACHE })
}
