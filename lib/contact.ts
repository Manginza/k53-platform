/**
 * lib/contact.ts — WhatsApp purchase contact details.
 *
 * Paid access is arranged over WhatsApp: the visitor messages the number
 * below, pays R150, and the admin issues them an access code.
 */
export const WHATSAPP_NUMBER = '27631721259'           // +27 63 172 1259
export const WHATSAPP_MESSAGE = "I'm interested to buy the course."
export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

/** Headline price for full access. */
export const ACCESS_PRICE = 'R150'
export const ACCESS_DURATION_DAYS = 60
