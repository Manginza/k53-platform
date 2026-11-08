/**
 * lib/email-check.ts — decides whether an email address is worth sending mail to.
 *
 * Used in the browser (to catch a typo while someone is typing) and on the
 * server (the real gate, because anything can be sent to the API directly).
 * It has no server-only imports, so both sides run exactly the same rules.
 *
 * It rejects:
 *   - text that is not an email address at all,
 *   - domains that cannot receive mail (no dot, or a mistyped provider such as
 *     "gmai.com" or "gmail.con"), with a suggested correction,
 *   - disposable and throwaway inboxes,
 *   - example / test addresses.
 *
 * It deliberately does NOT reject unfamiliar but well-formed domains, such as
 * a school or a South African company. Those are checked separately, against
 * DNS, by lib/email-mx.ts on the server.
 */

/** Providers most South African learners use. A near-miss on one of these is almost always a typo. */
const POPULAR_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'live.com', 'aol.com', 'msn.com',
]

/** Real domains that look like a provider but are genuinely different services. Never flagged. */
const KNOWN_GOOD = new Set([
  ...POPULAR_PROVIDERS, 'mail.com', 'protonmail.com', 'proton.me', 'gmx.com', 'gmx.net',
  'yahoo.co.za', 'outlook.co.za', 'hotmail.co.za', 'live.co.za', 'icloud.co.za', 'telkomsa.net',
  'webmail.co.za', 'vodamail.co.za', 'iafrica.com', 'absa.co.za',
])

/** Exact mistakes seen in real sign-ups on this site, and the correction for each. */
const EXPLICIT_TYPOS: Record<string, string> = {
  'gmail.co.za': 'gmail.com', 'gmail.com.za': 'gmail.com', 'gmail.za': 'gmail.com',
  'gmail': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.con': 'gmail.com',
  'gmail.comm': 'gmail.com', 'gmail.comn': 'gmail.com', 'gmail.cok': 'gmail.com',
  'gmail.vom': 'gmail.com', 'gmail.ocm': 'gmail.com', 'gmail.coom': 'gmail.com',
}

/** Throwaway inboxes. Mail to these is a bounce or a deliberate fake. */
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'sharklasers.com',
  '10minutemail.com', 'tempmail.com', 'temp-mail.org', 'tempmail.net', 'yopmail.com', 'trashmail.com',
  'throwawaymail.com', 'getnada.com', 'maildrop.cc', 'fakeinbox.com', 'mohmal.com', 'dispostable.com',
  'mailnesia.com', 'emailondeck.com', 'mintemail.com', 'spamgourmet.com', 'mytemp.email', 'tempail.com',
  'mailcatch.com', 'spam4.me', 'discard.email', 'burnermail.io', 'mailsac.com',
])

/** Example and test domains. Never a real learner. */
const TEST_DOMAINS = new Set(['example.com', 'example.net', 'example.org', 'test.com', 'localhost', 'invalid'])

export type EmailProblem =
  | 'empty' | 'format' | 'typo' | 'disposable' | 'test'

export type EmailCheck =
  | { ok: true; email: string }
  | { ok: false; email: string; problem: EmailProblem; message: string; suggestion?: string }

/** Trims, lowercases and strips invisible characters. Safe to call on any input. */
export function normaliseEmail(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  return raw
    .normalize('NFKC')
    .replace(/[​-‍﻿ ]/g, '')   // zero-width characters and non-breaking spaces
    .replace(/\s+/g, '')                            // people paste with spaces; an address has none
    .toLowerCase()
}

/** Optimal-string-alignment distance: edit distance that counts a swapped pair as one edit. */
function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) d[i][0] = i
  for (let j = 0; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[a.length][b.length]
}

/** The provider a mistyped domain was most likely meant to be, or null. */
function likelyProvider(domain: string): string | null {
  if (EXPLICIT_TYPOS[domain]) return EXPLICIT_TYPOS[domain]

  // A mangled ending on a provider: "gmail.con", "icloud.cok", "gmail.comm".
  const ending = domain.match(/^(.+)\.(con|cm|comm|comn|cok|vom|ocm|coom)$/)
  if (ending) {
    const name = ending[1]
    const provider = POPULAR_PROVIDERS.find(p => p.split('.')[0] === name)
    return provider ?? `${name}.com`
  }

  // A provider name with something stuck on the front: "11.gmail.com",
  // "bobigmail.com", "20gmail.com".
  for (const provider of POPULAR_PROVIDERS) {
    const name = provider.split('.')[0]
    if (domain === provider) return null
    if (domain.endsWith(`.${provider}`)) return provider                                  // 11.gmail.com
    if (domain.endsWith(`${name}.com`) && domain !== provider) return provider          // bobigmail.com
  }

  // Digits in front of the whole domain: "892glomail.com" -> "glomail.com".
  const unstuck = domain.replace(/^\d+(?=[a-z])/, '')

  // One or two letters wrong: "gmai.com", "gamil.com", "hotmai.com", "glomail.com".
  if (unstuck.length >= 6) {
    let best: string | null = null, bestDistance = 3
    for (const provider of POPULAR_PROVIDERS) {
      const dist = editDistance(unstuck, provider)
      if (dist < bestDistance) { bestDistance = dist; best = provider }
    }
    if (best && bestDistance <= 2) return best
  }
  return null
}

const LOCAL_PART = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
const TLD = /^(?:[a-z]{2,}|xn--[a-z0-9-]{2,})$/

/** Full check. Returns the normalised address on success. */
export function checkEmail(raw: unknown): EmailCheck {
  const email = normaliseEmail(raw)
  const fail = (problem: EmailProblem, message: string, suggestion?: string): EmailCheck =>
    ({ ok: false, email, problem, message, ...(suggestion ? { suggestion } : {}) })

  if (!email) return fail('empty', 'Please enter your email address.')
  if (email.length > 254) return fail('format', 'That email address is too long.')

  const at = email.lastIndexOf('@')
  if (at < 1 || at !== email.indexOf('@')) {
    return fail('format', 'Please enter a valid email address, for example name@gmail.com.')
  }
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)

  if (!LOCAL_PART.test(local) || local.length > 64) {
    return fail('format', 'There is a problem with the part before the @. Please check it.')
  }

  if (TEST_DOMAINS.has(domain) || /\.(test|example|invalid|local)$/.test(domain)) {
    return fail('test', 'Please use your own real email address.')
  }
  if (DISPOSABLE.has(domain)) {
    return fail('disposable', 'Please use a permanent email address you check regularly, not a temporary one.')
  }

  if (KNOWN_GOOD.has(domain)) return { ok: true, email }

  const suggestedDomain = likelyProvider(domain)
  if (suggestedDomain && suggestedDomain !== domain) {
    const suggestion = `${local}@${suggestedDomain}`
    return fail('typo', `Did you mean ${suggestion}? Please check the address.`, suggestion)
  }

  const labels = domain.split('.')
  if (labels.length < 2 || labels.some(l => !LABEL.test(l)) || !TLD.test(labels[labels.length - 1])) {
    // "name@com", "name@co", "name@123": the provider name has slipped into the front part.
    if (!domain.includes('.')) {
      for (const provider of POPULAR_PROVIDERS) {
        const name = provider.split('.')[0]
        if (domain === 'com' && local.endsWith(name) && local.length > name.length) {
          const suggestion = `${local.slice(0, -name.length)}@${provider}`      // "...gmail@com" -> "...@gmail.com"
          return fail('typo', `Did you mean ${suggestion}? Please check the address.`, suggestion)
        }
      }
      // "name@learners" — a real word with no ending. Offer ".com" only for a plain word.
      if (/^[a-z]{4,}$/.test(domain) && !['com', 'net', 'org', 'edu', 'gov', 'info', 'biz', 'mail'].includes(domain)) {
        const suggestion = `${local}@${domain}.com`
        return fail('typo', `Did you mean ${suggestion}? Please check the address.`, suggestion)
      }
    }
    return fail('format', 'The part after the @ needs a full domain, such as gmail.com. Please check your email address.')
  }

  return { ok: true, email }
}

/** Returns the corrected address to offer the user, if there is one. */
export function suggestEmail(raw: unknown): string | null {
  const result = checkEmail(raw)
  return !result.ok && result.suggestion ? result.suggestion : null
}
