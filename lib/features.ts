/**
 * lib/features.ts — site-wide on/off switches for features that can be
 * hidden without deleting anything.
 *
 * EXPLAINERS_ENABLED
 *   false → no question shows an explanation anywhere on the practice tests:
 *           not the "Learn" button and panel, not the short text under the
 *           correct answer on the results screen, and not the WhatsApp bot's
 *           "why". All the written explanations stay in the database and in
 *           lib/explanations.ts, so setting this back to true brings every
 *           one of them back exactly as it was.
 *
 * Hidden on request, 24 Nov 2026.
 */
export const EXPLAINERS_ENABLED = false
