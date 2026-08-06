/**
 * lib/contact.ts — WhatsApp purchase contact details + headline price.
 *
 * Paid access is arranged over WhatsApp or via Yoco card payment for R139 →
 * 60 days of full access.
 */
export const WHATSAPP_NUMBER = '27631721259'           // +27 63 172 1259
export const WHATSAPP_MESSAGE = "I'm interested in buying the course for R99 (special, down from R150)."
export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

/** Support line for checkout / payment queries. */
export const WHATSAPP_QUERIES_NUMBER = '27679609012'   // +27 67 960 9012
export const WHATSAPP_QUERIES_MESSAGE = 'Hi, I have a query about my course payment / checkout.'
export const WHATSAPP_QUERIES_URL =
  `https://wa.me/${WHATSAPP_QUERIES_NUMBER}?text=${encodeURIComponent(WHATSAPP_QUERIES_MESSAGE)}`

/** Live online evening study sessions on YouTube. */
export const LIVE_SESSION_URL = 'https://youtube.com/live/uaYQ746Kr2Q?feature=share'
export const LIVE_SESSION_SCHEDULE = 'Every day, 8pm–9pm'
export const LIVE_SESSION_NOTE = 'Sessions are recorded, so you can catch up if you miss one.'
/** Recording of the live session on YouTube. */
export const LIVE_SESSION_RECORDING_URL = 'https://youtube.com/live/uaYQ746Kr2Q?feature=share'
export const LIVE_SESSION_RECORDING_FILE_ID = ''

/**
 * Free-access promotion window. During [FREE_PROMO_FROM, FREE_PROMO_UNTIL)
 * the entire course (practice tests, Live Notes, Road Rules, Resources,
 * Videos) is unlocked for EVERYONE — no payment required. Outside the
 * window it auto-reverts to the normal paid model.
 *
 * - FREE_PROMO_FROM  = '' → promo is open the moment the deploy lands
 * - FREE_PROMO_UNTIL = '' → promo is disabled entirely
 * - Both set        → the promo activates automatically at FROM and
 *                     shuts down at UNTIL, no code change needed.
 */
export const FREE_PROMO_FROM  = '2026-08-06T20:00:00+02:00' // opens at 8pm SAST tonight
export const FREE_PROMO_UNTIL = '2026-08-06T22:00:00+02:00' // closes at 10pm SAST tonight

export function isFreePromoActive(): boolean {
  if (!FREE_PROMO_UNTIL) return false
  const now = Date.now()
  const from = FREE_PROMO_FROM ? Date.parse(FREE_PROMO_FROM) : 0
  const until = Date.parse(FREE_PROMO_UNTIL)
  return now >= from && now < until
}

/** Headline price for full access (discounted from ACCESS_PRICE_ORIGINAL). */
export const ACCESS_PRICE = 'R99'
export const ACCESS_PRICE_CENTS = 9900            // R99.00 in ZAR cents (Yoco)
export const ACCESS_PRICE_ORIGINAL = 'R150'       // shown struck-through
export const ACCESS_DISCOUNT_LABEL = 'Save R51'   // (R150 − R99); ~34% off
export const ACCESS_DURATION_DAYS = 60
