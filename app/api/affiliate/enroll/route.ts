/**
 * POST /api/affiliate/enroll
 *
 * Enrols the CURRENTLY LOGGED-IN user as an affiliate (no new account). Used
 * when a member wants to also become an affiliate. Collects bank details.
 *
 * Body: { firstName, lastName, bankAccountName, bankName, accountNumber, accountType }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { generateAffiliateCode, COMMISSION_RATE } from '@/lib/affiliate'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please log in first.' }, { status: 401 })

  let b: Record<string, string>
  try { b = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }

  const firstName = b.firstName?.trim()
  const lastName  = b.lastName?.trim()
  const bankAccountName = b.bankAccountName?.trim()
  const bankName  = b.bankName?.trim()
  const accountNumber = b.accountNumber?.trim()
  const accountType = b.accountType?.trim().toLowerCase()

  if (!firstName || !lastName) return NextResponse.json({ error: 'Please enter your name and surname.' }, { status: 400 })
  if (!bankAccountName || !bankName || !accountNumber) return NextResponse.json({ error: 'Please provide your bank account details.' }, { status: 400 })
  if (accountType !== 'cheque' && accountType !== 'savings') return NextResponse.json({ error: 'Account type must be Cheque or Savings.' }, { status: 400 })

  const admin = createAdminClient()

  // Already an affiliate?
  const { data: existing } = await admin.from('affiliates').select('id').eq('user_id', user.id).maybeSingle()
  if (existing) return NextResponse.json({ ok: true })

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAffiliateCode()
    const { error } = await admin.from('affiliates').insert({
      user_id: user.id,
      code,
      first_name: firstName,
      last_name: lastName,
      email: user.email,
      bank_account_name: bankAccountName,
      bank_name: bankName,
      account_number: accountNumber,
      account_type: accountType,
      commission_rate: COMMISSION_RATE,
    })
    if (!error) return NextResponse.json({ ok: true })
    if (error.code !== '23505') return NextResponse.json({ error: 'Could not enrol you as an affiliate.' }, { status: 500 })
  }
  return NextResponse.json({ error: 'Could not generate a unique code. Please try again.' }, { status: 500 })
}
