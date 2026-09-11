/**
 * lib/trial.ts — one-time, per-browser free trial of full access (shared).
 *
 * After the free promo closes, a locked visitor may start a single short
 * trial that unlocks everything (quizzes, Live Notes, videos, resources)
 * for TRIAL_SECONDS. This module holds only the client-safe constants and
 * pure helpers, so it can be imported from Client Components. The server-side
 * cookie logic (which needs next/headers) lives in lib/trial-server.ts.
 */
export const TRIAL_SECONDS = 120
export const TRIAL_START_COOKIE = 'k53_trial_start'
export const TRIAL_USED_COOKIE = 'k53_trial_used'
/** Mirrors the used marker to the client for instant UI (button hidden). */
export const TRIAL_USED_STORAGE = 'k53_trial_used'
/** Client-only: when the active trial ends (epoch ms), for the countdown. */
export const TRIAL_ENDS_STORAGE = 'k53_trial_ends'

/** Seconds left in a trial that started at startMs, clamped to >= 0. */
export function trialRemainingSeconds(startMs: number, now = Date.now()): number {
  const elapsed = (now - startMs) / 1000
  return Math.max(0, Math.ceil(TRIAL_SECONDS - elapsed))
}
