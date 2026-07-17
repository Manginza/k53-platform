/**
 * lib/access-cache.ts — client-side cache for /api/me/access.
 *
 * Both LiveSessionPopup and K53UnpackedPopup call this endpoint, and it fires
 * on every page navigation. This module:
 *   1. Deduplicates concurrent calls within the same page load via a
 *      module-level promise (one in-flight request shared by all callers).
 *   2. Persists the result in sessionStorage for CACHE_TTL ms so navigating
 *      between pages doesn't trigger a new round-trip.
 *
 * Net effect: at most ONE /api/me/access request per 5-minute window per tab,
 * down from one per component mount (= one per page load × N components).
 */

export interface AccessStatus {
  /** STRICT — true only for admin, active grant, or free promo. Gate content on this. */
  fullAccess:   boolean
  /** LOOSE — true for any signed-in visitor. Use for marketing surfaces (popups), not content unlock. */
  isLoggedIn:   boolean
  recordingUrl: string | null
}

const CACHE_TTL = 5 * 60 * 1000          // 5 minutes
const STORAGE_KEY = 'sk_access_v1'

let inFlight: Promise<AccessStatus> | null = null
let inFlightAt = 0

function fromStorage(): AccessStatus | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw) as { data: AccessStatus; ts: number }
    if (Date.now() - ts < CACHE_TTL) return data
  } catch {}
  return null
}

function toStorage(data: AccessStatus) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

export async function getAccessStatus(): Promise<AccessStatus> {
  // 1. In-memory: reuse a live in-flight request (deduplicates parallel callers)
  if (inFlight && Date.now() - inFlightAt < CACHE_TTL) return inFlight

  // 2. sessionStorage: reuse a recent cached result across navigations
  const stored = fromStorage()
  if (stored) return stored

  // 3. Fetch, cache, return.
  // `cache: 'no-store'` bypasses the browser HTTP cache — the endpoint sets
  // Cache-Control: max-age=60, which otherwise held the pre-payment "false"
  // response for a full minute after a user paid, keeping the paywall shown.
  // Our sessionStorage layer above is the one caching strategy we want.
  inFlightAt = Date.now()
  inFlight = fetch('/api/me/access', { cache: 'no-store' })
    .then(r => r.json() as Promise<AccessStatus>)
    .then(d => { toStorage(d); return d })
    .catch(() => ({ fullAccess: false, isLoggedIn: false, recordingUrl: null }))
    .finally(() => { inFlight = null })

  return inFlight
}

/**
 * Call after a successful payment / login: clears the sessionStorage cache
 * AND kicks off a fresh no-store fetch immediately, so the very next
 * `getAccessStatus()` call sees the new state instead of another 5-minute
 * window of the old cached value.
 */
export function invalidateAccessCache() {
  inFlight = null
  try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
  // Warm the cache with a fresh value — fire-and-forget.
  void getAccessStatus()
}
