import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
