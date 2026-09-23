/**
 * lib/sa-id.ts — South African ID number helpers.
 *
 * A 13-digit SA ID is YYMMDD SSSS C A Z. Digits 7–10 (SSSS, zero-indexed
 * 6..10) are a gender sequence: 0000–4999 = female, 5000–9999 = male. We use
 * that to classify gender rather than guessing from a name, which is
 * unreliable and misgenders people.
 */

/** Strip everything but digits from a raw ID entry. */
export function saIdDigits(raw: string | null | undefined): string {
  return (raw ?? '').replace(/\D/g, '')
}

/** A well-formed SA ID is exactly 13 digits. (Not a full checksum test.) */
export function isSaIdShaped(raw: string | null | undefined): boolean {
  return saIdDigits(raw).length === 13
}

export type Gender = 'Male' | 'Female'

/**
 * Gender classified from the SA ID gender sequence, or null when the ID is
 * not a 13-digit number we can read.
 */
export function genderFromSaId(raw: string | null | undefined): Gender | null {
  const digits = saIdDigits(raw)
  if (digits.length !== 13) return null
  const seq = Number(digits.slice(6, 10))
  if (!Number.isFinite(seq)) return null
  return seq < 5000 ? 'Female' : 'Male'
}
