import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
      global: {
        // Next.js's Data Cache caches individual fetch() responses at the
        // request level — separate from page-level rendering mode. Without
        // this, `hasFullAccess()` and auth reads may return a stale response
        // captured BEFORE a payment granted access, keeping the paywall in
        // place even though the DB has been updated. Reads here are always
        // user-scoped and short-lived, so caching is never desirable.
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  )
}
