/**
 * POST /api/whatsapp/link — the "Yes, link this number" button on /whatsapp/link.
 *
 * Requires a logged-in account and a form posted from this site (Origin
 * check), so another site cannot quietly link a number to a learner's account.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { userHasFullAccess } from '@/lib/access'
import { linkNumberToAccount } from '@/lib/whatsapp/bot'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (!origin || !host || new URL(origin).host !== host) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const form = await req.formData().catch(() => null)
  const code = String(form?.get('code') ?? '').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 20)
  const pay = form?.get('then') === 'pay'
  const back = new URL(`/whatsapp/link?code=${code}${pay ? '&then=pay' : ''}`, req.url)

  const { data: { user } } = await createClient().auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(back.pathname + back.search)}`, req.url), 303)
  }

  const result = await linkNumberToAccount(code, user.id)
  if (!result.ok) return NextResponse.redirect(back, 303)   // the page explains why (used / expired)

  if (pay && !(await userHasFullAccess(user.id))) {
    return NextResponse.redirect(new URL('/pricing', req.url), 303)
  }
  return NextResponse.redirect(new URL('/whatsapp/link?done=1', req.url), 303)
}
