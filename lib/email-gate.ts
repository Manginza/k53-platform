/**
 * lib/email-gate.ts — the server-side gate every route runs before an email
 * address is used to create an account or to send mail.
 *
 * It does two things that the browser check cannot:
 *   1. Runs the shared rules from lib/email-check.ts (typos, disposable and test
 *      addresses, malformed input).
 *   2. Asks DNS whether the domain can receive mail at all. A domain with no MX
 *      record (and no A record) cannot receive mail, so an email sent to it can
 *      only ever bounce. This catches what no list can, such as "gmail.comz".
 *
 * Server-only: it uses Node's DNS module.
 */
import { promises as dns } from 'dns'
import { checkEmail, type EmailCheck } from '@/lib/email-check'

const TIMEOUT_MS = 3000
const cache = new Map<string, { accepts: boolean; until: number }>()
const HOUR = 60 * 60 * 1000
const TEN_MINUTES = 10 * 60 * 1000

function withTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS))])
}

/**
 * true  — the domain has mail servers (or an A record, which mail falls back to),
 * false — DNS says the domain does not exist or cannot receive mail,
 * null  — DNS could not answer in time. We let these through: a slow DNS server
 *         must never stop a real learner from signing up.
 */
export async function domainAcceptsMail(domain: string): Promise<boolean | null> {
  const cached = cache.get(domain)
  if (cached && cached.until > Date.now()) return cached.accepts

  let accepts: boolean | null = null
  try {
    const mx = await withTimeout(dns.resolveMx(domain))
    accepts = mx.length > 0
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOTFOUND' || code === 'ENODATA') {
      // No MX. Mail can still fall back to an A record.
      try {
        const a = await withTimeout(dns.resolve4(domain))
        accepts = a.length > 0
      } catch (aError) {
        const aCode = (aError as NodeJS.ErrnoException).code
        accepts = aCode === 'ENOTFOUND' || aCode === 'ENODATA' ? false : null
      }
    } else {
      accepts = null     // timeout, SERVFAIL, network trouble: unknown, so allow
    }
  }

  if (accepts !== null) cache.set(domain, { accepts, until: Date.now() + (accepts ? HOUR : TEN_MINUTES) })
  return accepts
}

export type EmailGateResult =
  | { ok: true; email: string }
  | { ok: false; status: 400; message: string; suggestion?: string; problem: string }

/** Full server-side check. Use this before creating an account or sending any email. */
export async function gateEmail(raw: unknown): Promise<EmailGateResult> {
  const check: EmailCheck = checkEmail(raw)
  if (!check.ok) {
    return { ok: false, status: 400, message: check.message, suggestion: check.suggestion, problem: check.problem }
  }
  const domain = check.email.split('@')[1]
  const accepts = await domainAcceptsMail(domain)
  if (accepts === false) {
    return {
      ok: false, status: 400, problem: 'no_mail_domain',
      message: `The domain "${domain}" does not receive email. Please check the address for a typing mistake.`,
    }
  }
  return { ok: true, email: check.email }
}
