// PATCH /api/affiliate/bank — affiliate updates their own bank payout details
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'

export async function PATCH(req: NextRequest) {
  const browser = createClient()
  const { data: { user } } = await browser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { bankAccountName, bankName, accountNumber, accountType } = await req.json()
  if (!bankAccountName || !bankName || !accountNumber)
    return NextResponse.json({ error: 'All bank fields are required.' }, { status: 400 })

  const db = createAdminClient()
  const { error } = await db
    .from('affiliates')
    .update({ bank_account_name: bankAccountName, bank_name: bankName, account_number: accountNumber, account_type: accountType })
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
