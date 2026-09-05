/**
 * lib/contact.ts — WhatsApp purchase contact details + headline price.
 *
 * Paid access is arranged over WhatsApp or via Yoco card payment. The price
 * is ACCESS_PRICE and the window is ACCESS_DURATION_DAYS; both are defined
 * below and every surface reads them rather than restating the numbers.
 */
export const WHATSAPP_NUMBER = '27699075971'           // +27 69 907 5971
export const WHATSAPP_MESSAGE = "I'm interested in buying the course for R99 (special, down from R150)."
export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

/** Support line for checkout / payment queries. */
export const WHATSAPP_QUERIES_NUMBER = '27699075971'   // +27 69 907 5971
export const WHATSAPP_QUERIES_MESSAGE = 'Hi, I have a query about my course payment / checkout.'
export const WHATSAPP_QUERIES_URL =
  `https://wa.me/${WHATSAPP_QUERIES_NUMBER}?text=${encodeURIComponent(WHATSAPP_QUERIES_MESSAGE)}`

/** Live online evening study sessions on YouTube. */
export const LIVE_SESSION_URL = 'https://www.skdriving.co.za/videos'
export const LIVE_SESSION_SCHEDULE = 'Every day, 8pm–9pm'
export const LIVE_SESSION_NOTE = 'Sessions are recorded, so you can catch up if you miss one.'
/** Recording of the live session on YouTube. */
export const LIVE_SESSION_RECORDING_URL = 'https://www.skdriving.co.za/videos'
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
export const FREE_PROMO_FROM  = '2026-09-04T20:00:00+02:00'  // 8pm SAST
export const FREE_PROMO_UNTIL = '2026-09-05T00:00:00+02:00'  // 12am SAST

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
/**
 * Every price we have ever charged for full access, in cents. A checkout is
 * created at the price current at that moment, but may be PAID after a price
 * change deploys (buyer opens checkout, pays a few minutes later). Verifying
 * against the current price alone rejected those genuine payments. Add the
 * old price here whenever ACCESS_PRICE_CENTS changes.
 */
export const ACCEPTED_ACCESS_PRICES_CENTS: readonly number[] = [ACCESS_PRICE_CENTS, 13900, 15000]
export const ACCESS_PRICE_ORIGINAL = 'R150'       // shown struck-through
export const ACCESS_DISCOUNT_LABEL = 'Save R51'   // (R150 − R99); ~34% off
/**
 * How long one full-access purchase lasts.
 *
 * Changing this only affects checkouts created from now on. A checkout
 * carries its own durationDays in its Yoco metadata, and checkoutDurationDays()
 * in lib/payments.ts prefers that, so anyone who bought at the old length
 * still gets the length they paid for even if their payment is applied later.
 */
export const ACCESS_DURATION_DAYS = 30
