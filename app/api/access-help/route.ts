/**
 * POST /api/access-help — "Still can't log in?" with proof of payment.
 *
 * A client who paid but cannot get in uploads their proof of payment here
 * with their name, surname and the email they registered with. The proof is
 * stored in the PRIVATE `proof-of-payment` bucket, the request is recorded in
 * `access_help_requests`, and a time-limited link to the proof comes back.
 * The page then opens the client's own email app, addressed to
 * ACCESS_HELP_EMAIL, with that link in the message — so the email comes from
 * the client, and the proof reaches us whether or not they remember to attach
 * anything.
 *
 * Anyone can reach this without signing in (that is the point), so it is
 * deliberately strict: images and PDFs only, checked by their actual bytes,
 * 4 MB at most, and a few submissions per hour per address.
 *
 * Body: multipart/form-data — firstName, surname, email, phone?, paidOn?, proof (file)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomUUID } from 'crypto'
import { createAdminClient } from '@/lib/supabase-admin'
import { ACCESS_HELP_EMAIL } from '@/lib/contact'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const BUCKET = 'proof-of-payment'
/** Under Vercel's 4.5 MB request limit, multipart overhead included. */
const MAX_BYTES = 4 * 1024 * 1024
/** Long enough for the request to be handled, short enough not to linger. */
const LINK_SECONDS = 60 * 60 * 24 * 30
const PER_HOUR = 5

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/heic': 'heic', 'image/heif': 'heif', 'application/pdf': 'pdf',
}

/** The file's real type from its first bytes, or null. A renamed file is caught here. */
function sniff(b: Uint8Array): string | null {
  const at = (i: number, ...v: number[]) => v.every((x, k) => b[i + k] === x)
  const ascii = (i: number, s: string) => s.split('').every((c, k) => b[i + k] === c.charCodeAt(0))
  if (at(0, 0xff, 0xd8, 0xff)) return 'image/jpeg'
  if (at(0, 0x89, 0x50, 0x4e, 0x47)) return 'image/png'
  if (ascii(0, '%PDF')) return 'application/pdf'
  if (ascii(0, 'RIFF') && ascii(8, 'WEBP')) return 'image/webp'
  if (ascii(4, 'ftyp')) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11])
    if (['heic', 'heix', 'heim', 'heis', 'mif1', 'msf1', 'hevc'].includes(brand)) return 'image/heic'
  }
  return null
}

function text(v: FormDataEntryValue | null, max: number): string {
  return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

const FALLBACK = `Please email your proof of payment, name and surname to ${ACCESS_HELP_EMAIL}.`

export async function POST(req: NextRequest) {
  let form: FormData
  try { form = await req.formData() } catch { return fail('Please fill in the form and attach your proof of payment.') }

  const firstName = text(form.get('firstName'), 60)
  const surname   = text(form.get('surname'), 60)
  const email     = text(form.get('email'), 120).toLowerCase()
  const phone     = text(form.get('phone'), 30)
  const paidOn    = text(form.get('paidOn'), 30)
  const proof     = form.get('proof')

  if (!firstName || !surname) return fail('Please enter your name and surname.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter the email address you registered with.')
  if (!(proof instanceof File) || proof.size === 0) return fail('Please attach your proof of payment.')
  if (proof.size > MAX_BYTES) return fail('That file is larger than 4 MB. Please attach a screenshot or a smaller PDF.')

  const bytes = new Uint8Array(await proof.arrayBuffer())
  const realType = sniff(bytes)
  if (!realType) return fail('Please attach a photo, screenshot or PDF of your proof of payment.')

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
  const ipHash = createHash('sha256').update(`sk-access-help:${ip}`).digest('hex').slice(0, 32)

  const db = createAdminClient()

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error: countError } = await db
    .from('access_help_requests')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since)
  if (countError) {
    console.error('[access-help] rate check failed', countError.message)
    return fail(`We could not take your request right now. ${FALLBACK}`, 503)
  }
  if ((count ?? 0) >= PER_HOUR) {
    return fail(`We have already received several requests from you. ${FALLBACK}`, 429)
  }

  const id = randomUUID()
  const path = `${new Date().toISOString().slice(0, 7)}/${id}.${EXT[realType]}`

  const { error: uploadError } = await db.storage.from(BUCKET)
    .upload(path, bytes, { contentType: realType, upsert: false })
  if (uploadError) {
    console.error('[access-help] upload failed', uploadError.message)
    return fail(`We could not save your proof of payment. ${FALLBACK}`, 500)
  }

  const { error: insertError } = await db.from('access_help_requests').insert({
    id, first_name: firstName, surname, email,
    phone: phone || null, paid_on: paidOn || null,
    proof_path: path, ip_hash: ipHash,
  })
  if (insertError) {
    console.error('[access-help] insert failed', insertError.message)
    await db.storage.from(BUCKET).remove([path]).catch(() => {})
    return fail(`We could not save your request. ${FALLBACK}`, 500)
  }

  const { data: signed, error: signError } = await db.storage.from(BUCKET)
    .createSignedUrl(path, LINK_SECONDS)
  if (signError || !signed?.signedUrl) {
    console.error('[access-help] signed link failed', signError?.message)
    return fail(`Your proof was saved, but we could not create a link to it. ${FALLBACK}`, 500)
  }

  console.log('[access-help] request saved', { id, email })
  return NextResponse.json({
    reference: id.slice(0, 8).toUpperCase(),
    proofUrl: signed.signedUrl,
  })
}
