import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { normalizeReferralCode, REF_COOKIE, REF_COOKIE_MAX_AGE } from '@/lib/referral'
import { provinceFromParam } from '@/lib/directory'

/**
 * Directory province views moved from /centers?province=Gauteng to
 * /centers/gauteng (same for /driving-schools). Permanently redirect the old
 * URLs so links and search results carry over. Unknown values go to the
 * all-provinces page. Other query params (e.g. ?ref=) are kept.
 */
function legacyProvinceRedirect(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl
  if (pathname !== '/centers' && pathname !== '/driving-schools') return null
  if (!searchParams.has('province')) return null
  const province = provinceFromParam(searchParams.get('province'))
  const url = request.nextUrl.clone()
  url.pathname = province ? `${pathname}/${province.slug}` : pathname
  url.searchParams.delete('province')
  return NextResponse.redirect(url, 308)
}

export async function middleware(request: NextRequest) {
  const legacy = legacyProvinceRedirect(request)
  if (legacy) return legacy

  const referralCode = normalizeReferralCode(request.nextUrl.searchParams.get('ref'))
  if (referralCode) request.cookies.set(REF_COOKIE, referralCode)

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  // This call refreshes the auth token if expired but the refresh token is
  // still valid. The refreshed tokens are written back to the response
  // cookies via setAll above, so downstream server components and API routes
  // see a valid session instead of null.
  await supabase.auth.getUser()

  if (referralCode) {
    supabaseResponse.cookies.set(REF_COOKIE, referralCode, {
      path: '/',
      maxAge: REF_COOKIE_MAX_AGE,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      httpOnly: true,
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // api/yoco/webhook, api/whatsapp/webhook and api/cron are machine-to-machine
    // and carry no session cookie, so refreshing an auth token for them is
    // pure latency (and a Supabase blip must not fail Meta's webhook check).
    '/((?!_next/static|_next/image|favicon.ico|api/yoco/webhook|api/whatsapp/webhook|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
