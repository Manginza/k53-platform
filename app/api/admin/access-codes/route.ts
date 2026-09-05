/**
 * /api/admin/access-codes — look up a customer's access code, and resend it.
 *
 * GET  ?q=<email or code>   find the codes issued to an account
 * POST { code }             email that code to the account that paid
 *
 * Support needs this while a customer is on the phone: the code is what gets
 * someone into the account they are actually signed in to, and until a mail
 * provider is configured, reading it out IS the delivery mechanism.
 *
 * Admin-only, and every lookup is logged. These codes are bearer credentials
 * — anyone holding one can unlock an account — so who read them and when is
 * worth being able to answer later.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import { normaliseCode } from '@/lib/access-codes'
import { sendAccessCodeEmail } from '@/lib/access-code-email'
import { isEmailConfigured } from '@/lib/email'
import { ACCESS_DURATION_DAYS } from '@/lib/contact'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Resolve an email to an account id.
 *
 * The auth admin API has no server-side email filter, so this pages through
 * and matches locally. Acceptable for a lookup one person runs by hand;
 * it is not something to call on a hot path.
 */
async function findUserIdByEmail(db: AdminClient, email: string): Promise<{ id: string; email: string } | null> {
  const wanted = email.trim().toLowerCase()
  const PER_PAGE = 1000
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: PER_PAGE })
    if (error) throw new Error(`User lookup failed: ${error.message}`)
    const users = data?.users ?? []
    const found = users.find(u => (u.email ?? '').toLowerCase() === wanted)
    if (found) return { id: found.id, email: found.email ?? '' }
    if (users.length < PER_PAGE) break
  }
  return null
}

async function emailForUser(db: AdminClient, userId: string | null): Promise<string> {
  if (!userId) return ''
  try {
    const { data } = await db.auth.admin.getUserById(userId)
    return data?.user?.email ?? ''
  } catch { return '' }
}

export async function GET(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const query = (req.nextUrl.searchParams.get('q') ?? '').trim()
  if (!query) return NextResponse.json({ error: 'Enter an email address or a code.' }, { status: 400 })

  const db = createAdminClient()
  try {
    // A well-formed code is looked up directly; anything else is an email.
    const asCode = normaliseCode(query)
    let rows
    let accountEmail = ''

    if (asCode) {
      const { data, error } = await db
        .from('access_codes')
        .select('code, status, duration_days, valid_until, redeemed_at, emailed_at, created_at, user_id, source')
        .eq('code', asCode)
      if (error) throw new Error(error.message)
      rows = data ?? []
      accountEmail = await emailForUser(db, (rows[0]?.user_id as string) ?? null)
    } else {
      const account = await findUserIdByEmail(db, query)
      if (!account) {
        console.log('[admin/access-codes] lookup found no account', { by: admin.email, query })
        return NextResponse.json({ codes: [], accountEmail: '', notFound: true })
      }
      accountEmail = account.email
      const { data, error } = await db
        .from('access_codes')
        .select('code, status, duration_days, valid_until, redeemed_at, emailed_at, created_at, user_id, source')
        .eq('user_id', account.id)
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      rows = data ?? []
    }

    console.log('[admin/access-codes] lookup', { by: admin.email, query, found: rows.length })
    return NextResponse.json({
      codes: rows.map(r => ({
        code: r.code, status: r.status, durationDays: r.duration_days,
        validUntil: r.valid_until, redeemedAt: r.redeemed_at, emailedAt: r.emailed_at,
        createdAt: r.created_at, source: r.source,
      })),
      accountEmail,
      emailConfigured: isEmailConfigured(),
    })
  } catch (error) {
    console.error('[admin/access-codes] lookup failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Lookup failed.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let code: string | undefined
  try {
    ({ code } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Which code?' }, { status: 400 })
  }
  const normalised = normaliseCode(code ?? '')
  if (!normalised) return NextResponse.json({ error: 'That is not a valid code.' }, { status: 400 })

  const db = createAdminClient()
  const { data: row, error } = await db
    .from('access_codes')
    .select('code, duration_days, user_id')
    .eq('code', normalised)
    .maybeSingle()
  if (error || !row) return NextResponse.json({ error: 'Code not found.' }, { status: 404 })

  const to = await emailForUser(db, (row.user_id as string) ?? null)
  if (!to) return NextResponse.json({ error: 'That code has no account email to send to.' }, { status: 400 })

  const result = await sendAccessCodeEmail({
    to,
    code: row.code as string,
    durationDays: (row.duration_days as number) || ACCESS_DURATION_DAYS,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.skdriving.co.za',
  })
  if (!result.sent) {
    const message = result.reason === 'not_configured'
      ? 'Email is not set up yet — read the code out instead. Set RESEND_API_KEY and EMAIL_FROM to enable sending.'
      : 'Could not send the email. Read the code out instead.'
    return NextResponse.json({ sent: false, error: message }, { status: 503 })
  }

  await db.from('access_codes').update({ emailed_at: new Date().toISOString() }).eq('code', normalised)
  console.log('[admin/access-codes] resent', { by: admin.email, to })
  return NextResponse.json({ sent: true, to })
}
