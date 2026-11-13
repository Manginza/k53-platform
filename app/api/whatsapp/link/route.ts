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
import { isSameSitePost } from '@/lib/whatsapp/origin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!isSameSitePost(req.headers.get('origin'), req.headers.get('x-forwarded-host'), req.headers.get('host'))) {
    console.warn('[whatsapp] link rejected', { reason: 'cross-site' })
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

  let result: Awaited<ReturnType<typeof linkNumberToAccount>>
  try {
    result = await linkNumberToAccount(code, user.id)
  } catch (error) {
    console.error('[whatsapp] link failed', error instanceof Error ? error.message : error)
    back.searchParams.set('notice', 'failed')
    return NextResponse.redirect(back, 303)
  }
  if (!result.ok) {
    console.warn('[whatsapp] link failed', { code: result.code })
    back.searchParams.set('notice', result.code)
    return NextResponse.redirect(back, 303)
  }

  if (pay && !(await userHasFullAccess(user.id))) {
    return NextResponse.redirect(new URL('/pricing', req.url), 303)
  }
  return NextResponse.redirect(new URL('/whatsapp/link?done=1', req.url), 303)
}
