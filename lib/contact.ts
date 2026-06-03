/**
 * lib/contact.ts — WhatsApp purchase contact details + headline price.
 *
 * Paid access is arranged over WhatsApp or via Yoco card payment for R99 →
 * 60 days of full access.
 */
export const WHATSAPP_NUMBER = '27631721259'           // +27 63 172 1259
export const WHATSAPP_MESSAGE = "I'm interested in buying the course for R99 (special, down from R150)."
export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

/** Headline price for full access (discounted from ACCESS_PRICE_ORIGINAL). */
export const ACCESS_PRICE = 'R99'
export const ACCESS_PRICE_CENTS = 9900            // R99.00 in ZAR cents (Yoco)
export const ACCESS_PRICE_ORIGINAL = 'R150'       // shown struck-through
export const ACCESS_DISCOUNT_LABEL = 'Save R51'   // (R150 − R99); ~34% off
export const ACCESS_DURATION_DAYS = 60
