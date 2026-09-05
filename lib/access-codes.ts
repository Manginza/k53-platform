/**
 * lib/access-codes.ts — the single-use code a payment mints.
 *
 * Access is granted automatically by four separate routes (see
 * lib/payment-recovery.ts). This is the fifth, and the only one the customer
 * can operate themselves: a code they were emailed and can type in.
 *
 * It earns its place in the cases automation cannot reach. The commonest is a
 * buyer who registered twice, paid on one account and is signed in to the
 * other; nothing can detect that, because from the server's point of view the
 * payment was applied correctly and a different person is asking. A code they
 * hold in their inbox unlocks whichever account they are actually using.
 *
 * The code is minted as soon as the payment is claimed in the ledger, BEFORE
 * access is granted, so it exists even when the grant is what failed.
 */
import type { createAdminClient } from '@/lib/supabase-admin'
import { randomInt } from 'crypto'

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Deliberately excludes 0/O/1/I/L/U. People read these off a phone screen and
 * type them on another device, and those are the characters they get wrong.
 * U is dropped so the alphabet cannot spell anything unfortunate.
 */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ'
const GROUPS = 3
const GROUP_SIZE = 4

/** How long a minted code stays redeemable. */
export const CODE_VALID_DAYS = 120

const PREFIX = 'SK'
const BODY_LENGTH = GROUPS * GROUP_SIZE

/**
 * `SK-A3F9-KM2P-7QXW`. Twelve characters from a thirty-character alphabet is
 * about sixty bits, which is far past guessing even without a rate limit.
 */
export function generateCode(): string {
  const groups: string[] = []
  for (let g = 0; g < GROUPS; g++) {
    let group = ''
    for (let i = 0; i < GROUP_SIZE; i++) group += ALPHABET[randomInt(ALPHABET.length)]
    groups.push(group)
  }
  return `SK-${groups.join('-')}`
}

/**
 * Turns whatever the customer typed into the stored form.
 *
 * They paste it with spaces, lose the dashes, leave the prefix off, or type
 * O for 0. Rejecting any of that would send a paying customer back to
 * support, which is the outcome this feature exists to avoid.
 */
export function normaliseCode(input: string): string | null {
  if (!input) return null
  const stripped = input.toUpperCase().replace(/[^A-Z0-9]/g, '')

  // The prefix is only removed when doing so leaves a body of the right
  // length. S and K are both in the alphabet, so a body can legitimately
  // begin "SK" — stripping unconditionally would mangle those codes.
  let body = stripped
  if (stripped.length === PREFIX.length + BODY_LENGTH && stripped.startsWith(PREFIX)) {
    body = stripped.slice(PREFIX.length)
  }

  if (body.length !== BODY_LENGTH) return null
  // No lookalike substitution: the alphabet already excludes every character
  // people confuse (0/O, 1/I/L, U/V). Anything outside it is a real typo, and
  // guessing what was meant would silently look up a different code.
  if (!body.split('').every(char => ALPHABET.includes(char))) return null

  const groups: string[] = []
  for (let i = 0; i < body.length; i += GROUP_SIZE) groups.push(body.slice(i, i + GROUP_SIZE))
  return `${PREFIX}-${groups.join('-')}`
}

export interface MintedCode {
  code: string
  durationDays: number
  validUntil: string
}

/**
 * Issues the code for a paid checkout, or returns the one already issued.
 *
 * Idempotent on the checkout id: several routes apply the same payment, and a
 * unique index means whoever loses the race reads back the existing code
 * rather than minting a second usable one.
 *
 * Never throws. A code is a convenience on top of access that was granted
 * anyway, and must not be able to fail a payment.
 */
export async function mintCodeForCheckout(
  db: AdminClient,
  params: { userId: string; checkoutId: string; durationDays: number },
): Promise<MintedCode | null> {
  const { userId, checkoutId, durationDays } = params
  try {
    const existing = await findCodeForCheckout(db, checkoutId)
    if (existing) return existing

    const code = generateCode()
    const validUntil = new Date(Date.now() + CODE_VALID_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { error } = await db.from('access_codes').insert({
      code,
      user_id: userId,
      yoco_checkout_id: checkoutId,
      source: 'payment',
      status: 'active',
      duration_days: durationDays,
      valid_until: validUntil,
      label: 'Issued on payment',
    })
    if (error) {
      // Lost the race to another route applying the same checkout.
      const existingAfterRace = await findCodeForCheckout(db, checkoutId)
      if (existingAfterRace) return existingAfterRace
      console.error('[access-codes] mint failed', { userId, checkoutId, error: error.message })
      return null
    }
    return { code, durationDays, validUntil }
  } catch (error) {
    console.error('[access-codes] mint threw', {
      userId, checkoutId, error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

async function findCodeForCheckout(db: AdminClient, checkoutId: string): Promise<MintedCode | null> {
  const { data, error } = await db
    .from('access_codes')
    .select('code, duration_days, valid_until')
    .eq('yoco_checkout_id', checkoutId)
    .maybeSingle()
  if (error || !data) return null
  return {
    code: data.code as string,
    durationDays: (data.duration_days as number) ?? 0,
    validUntil: (data.valid_until as string) ?? '',
  }
}

export type RedeemFailure = 'not_found' | 'already_redeemed' | 'revoked' | 'expired'

export interface CodeRow {
  id: string
  code: string
  status: string
  duration_days: number
  valid_until: string | null
  redeemed_at: string | null
}

/**
 * Why this code may not be redeemed, or null when it may.
 *
 * Split out from the route so the rules can be tested without a database.
 */
export function redeemRejection(row: CodeRow | null, now: number): RedeemFailure | null {
  if (!row) return 'not_found'
  if (row.status === 'revoked') return 'revoked'
  if (row.redeemed_at || row.status === 'redeemed') return 'already_redeemed'
  if (row.valid_until) {
    const validUntil = Date.parse(row.valid_until)
    if (Number.isFinite(validUntil) && validUntil <= now) return 'expired'
  }
  return null
}

/** What to tell the customer. Never says whether a code exists, only what to do. */
export function redeemFailureMessage(reason: RedeemFailure): string {
  switch (reason) {
    case 'already_redeemed':
      return 'This code has already been used. If your access still is not showing, message us and we will sort it out.'
    case 'revoked':
      return 'This code is no longer valid. Please message us and we will sort it out.'
    case 'expired':
      return 'This code has expired. Please message us and we will sort it out.'
    default:
      return 'We could not find that code. Check it against the email we sent you, or message us.'
  }
}
