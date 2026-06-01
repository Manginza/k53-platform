/**
 * POST /api/affiliate/register
 *
 * Self-registration for affiliates: creates an auto-confirmed account and an
 * affiliate record (with bank payout details and a unique referral code).
 * The client signs in afterwards and lands on the affiliate dashboard.
 *
 * Body: { firstName, lastName, email, password,
 *         bankAccountName, bankName, accountNumber, accountType }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { generateAffiliateCode, COMMISSION_RATE } from '@/lib/affiliate'

export async function POST(req: NextRequest) {
  let b: Record<string, string>
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const firstName = b.firstName?.trim()
  const lastName  = b.lastName?.trim()
  const email     = b.email?.trim().toLowerCase()
  const password  = b.password
  const bankAccountName = b.bankAccountName?.trim()
  const bankName  = b.bankName?.trim()
  const accountNumber = b.accountNumber?.trim()
  const accountType = b.accountType?.trim().toLowerCase()

  if (!firstName || !lastName) return NextResponse.json({ error: 'Please enter your name and surname.' }, { status: 400 })
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  if (!bankAccountName || !bankName || !accountNumber) return NextResponse.json({ error: 'Please provide your bank account details.' }, { status: 400 })
  if (accountType !== 'cheque' && accountType !== 'savings') return NextResponse.json({ error: 'Account type must be Cheque or Savings.' }, { status: 400 })

  const admin = createAdminClient()

  // 1. Create the account (auto-confirmed so they can sign in immediately).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (createErr || !created?.user) {
    const msg = createErr?.message ?? 'Could not create the account.'
    const dup = /registered|already|exists/i.test(msg)
    return NextResponse.json(
      { error: dup ? 'An account with this email already exists. Please log in instead.' : msg },
      { status: dup ? 409 : 400 },
    )
  }

  // 2. Create the affiliate record with a unique code.
  let lastErr = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAffiliateCode()
    const { error } = await admin.from('affiliates').insert({
      user_id: created.user.id,
      code,
      first_name: firstName,
      last_name: lastName,
      email,
      bank_account_name: bankAccountName,
      bank_name: bankName,
      account_number: accountNumber,
      account_type: accountType,
      commission_rate: COMMISSION_RATE,
    })
    if (!error) return NextResponse.json({ ok: true })
    lastErr = error.message
    if (error.code !== '23505') break          // not a code collision — stop retrying
    if (error.message.includes('user_id')) break // already an affiliate
  }

  // Roll back the account if the affiliate row couldn't be created.
  await admin.auth.admin.deleteUser(created.user.id).catch(() => {})
  console.error('[affiliate/register] insert error:', lastErr)
  return NextResponse.json({ error: 'Could not complete affiliate registration. Please try again.' }, { status: 500 })
}
