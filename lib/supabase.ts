import { createClient } from '@supabase/supabase-js'

function requireEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): string {
  const value = process.env[name]
  if (!value) {
    // This module is imported at build time (page-data collection), so a missing
    // variable surfaces as an opaque "supabaseUrl is required" crash from the
    // Supabase SDK. Name the variable and the environment instead.
    throw new Error(
      `Missing ${name}. Set it for every Vercel environment the build runs in ` +
      `(Production, Preview and Development), not just Production.`,
    )
  }
  return value
}

const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    // Next.js's Data Cache can otherwise serve a stale response for this
    // fetch() indefinitely, even on `force-dynamic` routes — it caches at the
    // request level, separate from page-level rendering mode. Content here
    // (quiz answers, courses, centres, schools) is edited directly via SQL
    // with no cache-invalidation hook, so every read must hit Supabase fresh.
    fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
  },
})
