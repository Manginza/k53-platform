/**
 * lib/daily-cash.ts — daily cash from signups.
 *
 * Values every account added to the platform at the standard full-access
 * price and totals those values per calendar day, so the admin dashboard can
 * answer "what did today bring in?" without waiting for the payment ledger.
 *
 * IMPORTANT — this is a signup-based valuation, not settled revenue. It
 * assumes every new account is worth ACCESS_PRICE_CENTS, which is not the
 * same thing as money received: accounts created during a free promo, admin
 * grants and accounts that never pay are all counted here at full price.
 * Money actually collected lives in `payment_history`, applied through
 * lib/payments.ts. Read this as pipeline value, and reconcile against the
 * payment ledger before treating any figure as cash in the bank.
 *
 * Days are bucketed in South African time. Bucketing in UTC would push a
 * signup made between midnight and 02:00 SAST onto the previous day and make
 * the daily figures disagree with the admin's own calendar.
 */
import { ACCESS_PRICE_CENTS } from '@/lib/contact'

/** What one new account is counted as being worth. */
export const SIGNUP_VALUE_CENTS = ACCESS_PRICE_CENTS

export const REPORT_TIME_ZONE = 'Africa/Johannesburg'

export interface DailyCashRow {
  /** Calendar day in South African time, as YYYY-MM-DD. */
  date: string
  /** Accounts created on that day. */
  signups: number
  /** signups * SIGNUP_VALUE_CENTS. */
  cents: number
}

export interface DailyCash {
  /** One row per calendar day, newest first. Days with no signups are kept. */
  rows: DailyCashRow[]
  todayCents: number
  todaySignups: number
  last7Cents: number
  last30Cents: number
  totalCents: number
  totalSignups: number
  /** The day the first counted account was created, or null when there are none. */
  firstDate: string | null
}

/** The calendar day an instant falls on, in South African time. */
export function toReportDate(value: string | number | Date): string | null {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  // sv-SE renders dates as YYYY-MM-DD, which sorts lexicographically.
  return date.toLocaleDateString('sv-SE', { timeZone: REPORT_TIME_ZONE })
}

/** Adds `days` to a YYYY-MM-DD string. Parsed as UTC so no zone shifts it. */
function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return shifted.toISOString().slice(0, 10)
}

export interface DailyCashOptions {
  /** Treated as "now" when deciding today and the trailing windows. */
  now?: Date
  /**
   * How many days the returned series covers, counting back from today.
   * Totals always cover every signup, not just the days returned.
   */
  maxDays?: number
  /** Override the per-signup value, in cents. Defaults to SIGNUP_VALUE_CENTS. */
  valueCents?: number
}

/**
 * Buckets account-creation timestamps into a per-day cash series.
 *
 * Unparseable timestamps are skipped rather than thrown on, so one bad row
 * from the auth API cannot take the whole dashboard down.
 */
export function buildDailyCash(
  createdAt: ReadonlyArray<string | number | Date | null | undefined>,
  options: DailyCashOptions = {},
): DailyCash {
  const { now = new Date(), maxDays = 90, valueCents = SIGNUP_VALUE_CENTS } = options

  const countByDate = new Map<string, number>()
  let totalSignups = 0
  for (const value of createdAt) {
    if (value == null) continue
    const date = toReportDate(value)
    if (!date) continue
    countByDate.set(date, (countByDate.get(date) ?? 0) + 1)
    totalSignups += 1
  }

  const today = toReportDate(now) as string
  const dates = Array.from(countByDate.keys()).sort()
  const firstDate = dates[0] ?? null

  // Walk every day from the window start to today so quiet days show as zero
  // instead of vanishing, which is what makes the series a daily report
  // rather than a list of days that happened to have signups.
  const windowStart = addDays(today, -(Math.max(1, maxDays) - 1))
  const start = firstDate && firstDate > windowStart ? firstDate : windowStart
  const rows: DailyCashRow[] = []
  for (let date = start; date <= today; date = addDays(date, 1)) {
    const signups = countByDate.get(date) ?? 0
    rows.push({ date, signups, cents: signups * valueCents })
  }
  rows.reverse()

  const since = (days: number): number => {
    const from = addDays(today, -(days - 1))
    let signups = 0
    countByDate.forEach((count, date) => { if (date >= from && date <= today) signups += count })
    return signups * valueCents
  }

  const todaySignups = countByDate.get(today) ?? 0
  return {
    rows,
    todaySignups,
    todayCents: todaySignups * valueCents,
    last7Cents: since(7),
    last30Cents: since(30),
    totalCents: totalSignups * valueCents,
    totalSignups,
    firstDate,
  }
}
