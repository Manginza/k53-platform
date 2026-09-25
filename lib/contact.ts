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

/**
 * Community WhatsApp group. Every visitor is invited once on their first
 * visit, and the floating join button keeps the invitation available on every
 * visit after that.
 */
export const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/Kruy1Kw8iQ40VbJNvRlfeY'

/**
 * Temporary takeover of the first-visit popup.
 *
 * While this window is open the popup promotes the live YouTube session
 * instead of the WhatsApp group. It reverts on its own at LIVE_TAKEOVER_UNTIL
 * with no deploy needed, and dismissing the live popup does NOT use up a
 * visitor's one-time WhatsApp group invite — the two remember separately.
 *
 * To end it early, set LIVE_TAKEOVER_UNTIL to ''. To run another one, set a
 * new URL and a new end time.
 */
export const LIVE_TAKEOVER_URL   = 'https://youtube.com/live/ra1m8VlOJLk?feature=share'
export const LIVE_TAKEOVER_UNTIL = '2026-09-25T22:00:00+02:00'  // 10pm SAST (Thu 25 Sep) — after the 9pm lesson

/** True while the popup should show the live session rather than the group. */
export function isLiveTakeoverActive(): boolean {
  if (!LIVE_TAKEOVER_UNTIL || !LIVE_TAKEOVER_URL) return false
  const until = Date.parse(LIVE_TAKEOVER_UNTIL)
  return Number.isFinite(until) && Date.now() < until
}

/**
 * Support line for checkout / payment queries — the number shown to someone
 * who has paid but cannot get in. Deliberately separate from
 * WHATSAPP_NUMBER, which is the sales line: these reach different people and
 * changing one must not silently change the other.
 */
export const WHATSAPP_QUERIES_NUMBER = '27661063292'   // +27 66 106 3292
export const WHATSAPP_QUERIES_MESSAGE = 'Hi, I have a query about my course payment / checkout.'
export const WHATSAPP_QUERIES_URL =
  `https://wa.me/${WHATSAPP_QUERIES_NUMBER}?text=${encodeURIComponent(WHATSAPP_QUERIES_MESSAGE)}`

/** Our live sessions on YouTube (the channel's live/streams tab). */
export const LIVE_SESSIONS_URL = 'https://www.youtube.com/@lungi09/streams'

/**
 * Learners Licence class booking line (the first-visit popup CTA). Booked over
 * WhatsApp at the special R99 price (down from R150).
 */
export const WHATSAPP_CLASS_NUMBER = '27631721259'          // +27 63 172 1259
export const WHATSAPP_CLASS_MESSAGE =
  "Hi, I'd like to join the Learners Licence class for R99 (special, down from R150)."
export const WHATSAPP_CLASS_URL =
  `https://wa.me/${WHATSAPP_CLASS_NUMBER}?text=${encodeURIComponent(WHATSAPP_CLASS_MESSAGE)}`

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
export const FREE_PROMO_FROM  = '2026-09-24T08:00:00+02:00'  // 8am SAST (Thu 24 Sep)
export const FREE_PROMO_UNTIL = '2026-09-24T20:00:00+02:00'  // 8pm SAST

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

/**
 * The window customers were buying before it was shortened. Anyone who had
 * already paid keeps this on every future purchase — see lib/entitlement.ts.
 */
export const LEGACY_ACCESS_DURATION_DAYS = 60

/**
 * The moment the shorter window took effect.
 *
 * SET THIS TO THE DATE THIS ACTUALLY GOES LIVE. Anyone whose first payment
 * predates it is treated as being on the old plan and keeps the longer
 * window. Because the shorter window does not exist until this ships, every
 * payment before that moment was by definition made on the old plan, so a
 * cutover equal to the deploy date classifies everyone correctly.
 *
 * Setting it EARLIER than the deploy date is the harmful mistake: customers
 * who bought the long plan in the gap would be renewed on the short one.
 *
 * ⚠️ BUMP THIS TO THE EXACT GO-LIVE DAY WHEN YOU MERGE THIS STACK TO main.
 * It is deliberately set to a forward date so that, until it ships, every
 * live purchase (still the 60-day plan in production) stays grandfathered.
 * A date slightly after deploy is safe — at worst a few brand-new buyers get
 * the longer window. A date before deploy is NOT safe: it short-changes real
 * 60-day customers, which is the mistake this guard exists to prevent.
 */
export const LEGACY_PLAN_CUTOVER = '2026-09-15T00:00:00+02:00'
