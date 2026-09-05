/**
 * lib/free-trial.ts — the free practice-test trial for non-paying visitors.
 *
 * Kept free of server-only imports so both Server Components and client
 * components (QuizClient) can read the same numbers. Change the trial length
 * here only; every timer and every piece of copy derives from these values.
 */

/** Trial length in minutes (shown in copy). */
export const FREE_TRIAL_MINUTES = 3

/** Trial length in seconds (enforced by the server timer and client countdown). */
export const FREE_TRIAL_SECONDS = FREE_TRIAL_MINUTES * 60

/**
 * When the 3-minute trial went live. Trial windows started before this
 * belong to the old 2-minute configuration; such visitors get one fresh
 * 3-minute trial instead of landing straight on the paywall from a stale row.
 */
export const FREE_TRIAL_ROLLOUT_AT = '2026-09-05T00:00:00.000Z'

/** mm:ss label for the trial length, e.g. "3:00". */
export const FREE_TRIAL_LABEL = `${FREE_TRIAL_MINUTES}:00`
