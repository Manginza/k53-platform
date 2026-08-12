import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { normalizeReferralCode, REF_COOKIE, REF_COOKIE_MAX_AGE } from '@/lib/referral'

export async function middleware(request: NextRequest) {
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
