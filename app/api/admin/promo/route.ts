import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, isPrimaryAdminEmail } from '@/lib/admin'
import { getPromoWindow, setPromoWindow, isPromoActiveNow } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin || !isPrimaryAdminEmail(admin.email)) return NextResponse.json({ error: 'This area is restricted to the primary admin.' }, { status: 403 })
  const window = await getPromoWindow()
  return NextResponse.json({ ...window, active: isPromoActiveNow(window) })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin || !isPrimaryAdminEmail(admin.email)) return NextResponse.json({ error: 'This area is restricted to the primary admin.' }, { status: 403 })

  const body = await req.json()
  const from  = (body.from  ?? '').toString().trim()
  const until = (body.until ?? '').toString().trim()

  await setPromoWindow(from, until)
  const window = { from, until }
  return NextResponse.json({ ok: true, ...window, active: isPromoActiveNow(window) })
}
