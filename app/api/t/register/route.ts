// POST /api/t/register — creates trainer profile row after Supabase auth signup
//
// The browser signs the trainer up with supabase.auth.signUp() and then calls
// this route with the new user id. That id comes from the request body, so it
// is NOT trusted on its own: it must belong to a real account that was created
// moments ago with the same email, and that account must not already have a
// trainer profile. Without this, anyone could attach a trainer profile to an
// arbitrary existing account (including an admin's) by guessing its id.
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { allow, clientIp } from '@/lib/rate-limit'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
/** How recent the auth account must be for it to claim a trainer profile. */
const FRESH_ACCOUNT_MS = 30 * 60 * 1000

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: NextRequest) {
  if (!allow(`trainer-reg-ip:${clientIp(req.headers)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }

  const user_id = str(body.user_id, 64)
  const name = str(body.name, 120)
  const email = str(body.email, 200).toLowerCase()
  const slug = str(body.slug, 60)
  const phone = str(body.phone, 30)
  const province = str(body.province, 60)
  const bio = str(body.bio, 2000)
  const priceRaw = Number(body.learner_price_cents ?? 0)
  const learner_price_cents = Number.isInteger(priceRaw) && priceRaw >= 0 && priceRaw <= 10_000_000 ? priceRaw : 0

  if (!UUID.test(user_id) || !name || !email || !slug)
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  if (!SLUG.test(slug))
    return NextResponse.json({ error: 'The page URL may only contain lowercase letters, numbers and dashes.' }, { status: 400 })

  const db = createAdminClient()

  // The id must be a just-created account for this same email.
  const { data: authData, error: authError } = await db.auth.admin.getUserById(user_id)
  const authUser = authData?.user
  if (authError || !authUser) return NextResponse.json({ error: 'Account not found.' }, { status: 404 })
  const createdAt = Date.parse(authUser.created_at)
  if (
    authUser.email?.toLowerCase() !== email ||
    !Number.isFinite(createdAt) || Date.now() - createdAt > FRESH_ACCOUNT_MS
  ) {
    return NextResponse.json({ error: 'Registration could not be verified. Please sign up again.' }, { status: 403 })
  }

  const { data: already } = await db.from('trainers').select('id').eq('user_id', user_id).maybeSingle()
  if (already) return NextResponse.json({ error: 'This account already has a trainer profile.' }, { status: 409 })

  // Check slug uniqueness
  const { data: existing } = await db.from('trainers').select('id').eq('slug', slug).maybeSingle()
  if (existing) return NextResponse.json({ error: 'That page URL is already taken. Try a different one.' }, { status: 409 })

  const { error } = await db.from('trainers').insert({
    user_id, name, email: authUser.email, phone, province, bio, slug,
    learner_price_cents,
    is_active: false,
  })
  if (error) {
    console.error('[t/register] insert failed', error.message)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
