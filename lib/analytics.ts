/**
 * lib/analytics.ts — browser-side Google Analytics events and cookie consent.
 *
 * Analytics and ad cookies stay OFF until a visitor taps "Accept" on the
 * cookie banner (Google Consent Mode, set up in app/layout.tsx). Until then
 * Google only receives cookieless pings, never a cookie.
 *
 * Every function is safe to call anywhere: on the server, before the tag has
 * loaded, or with an ad-blocker. Failing to record an event must never break
 * a page.
 */

type Gtag = (...args: unknown[]) => void
interface AnalyticsWindow { gtag?: Gtag; fbq?: (...args: unknown[]) => void }

export const CONSENT_KEY = 'k53_cookie_consent'

/** Fired on window the moment a visitor taps Accept, so things that wait for consent (the ads script) can start. */
export const CONSENT_GRANTED_EVENT = 'sk:consent-granted'

/** True when this browser has already accepted cookies. */
export function hasConsent(): boolean {
  try { return localStorage.getItem(CONSENT_KEY) === 'true' } catch { return false }
}

function w(): AnalyticsWindow | null {
  return typeof window === 'undefined' ? null : (window as unknown as AnalyticsWindow)
}

/** Sends a GA4 event. `beacon` lets it finish even if the page navigates away. */
export function track(name: string, params: Record<string, string | number | boolean | undefined> = {}): void {
  try {
    const gtag = w()?.gtag
    if (typeof gtag !== 'function') return
    const clean: Record<string, string | number | boolean> = { transport_type: 'beacon' }
    for (const [k, v] of Object.entries(params)) if (v !== undefined) clean[k] = v
    gtag('event', name, clean)
  } catch { /* analytics must never break the page */ }
}

/** The visitor tapped Accept: switch analytics and ad cookies on. */
export function grantConsent(): void {
  try {
    w()?.gtag?.('consent', 'update', {
      analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted',
    })
    w()?.fbq?.('consent', 'grant')
  } catch { /* ignore */ }
  try { window.dispatchEvent(new Event(CONSENT_GRANTED_EVENT)) } catch { /* ignore */ }
}
