/**
 * lib/supabase-public.ts — cacheable, build-safe reads of PUBLIC tables.
 *
 * lib/supabase.ts deliberately disables Next's data cache (every read is
 * no-store) and throws at import time when env vars are missing. That is right
 * for quiz answers and paywalled pages, but it forces public marketing pages
 * (course list, centre and school directories) to render dynamically with
 * `Cache-Control: no-store`.
 *
 * This helper talks to the PostgREST endpoint with the anon key (RLS still
 * applies — only tables with a public-read policy are readable) and lets the
 * page opt in to ISR via `revalidate`.
 *
 * Failure policy:
 *   - During `next build` (or when env vars are absent) a failed read returns
 *     `null`, so a build without Supabase access still succeeds; the page is
 *     regenerated with real data on its first revalidation.
 *   - At runtime a failed read THROWS. During ISR regeneration Next.js then
 *     keeps serving the last good copy instead of caching an empty page.
 */

const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build'

export interface PublicSelectOptions {
  /** Seconds before Next.js refetches. */
  revalidate: number
  /** Cache tags, for on-demand revalidation if ever wired up. */
  tags?: string[]
}

/**
 * `publicSelect('dltc_centers', 'select=id,name&order=name')`
 * Returns the rows, or null when Supabase is unreachable at build time.
 */
export async function publicSelect<T>(
  table: string,
  query: string,
  { revalidate, tags }: PublicSelectOptions,
): Promise<T[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    if (IS_BUILD) return null
    throw new Error('Supabase env vars are not set (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).')
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${table}?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
      next: { revalidate, tags },
      signal: AbortSignal.timeout(IS_BUILD ? 8000 : 15000),
    })
    if (!res.ok) throw new Error(`Supabase ${table} read failed: HTTP ${res.status}`)
    return (await res.json()) as T[]
  } catch (err) {
    if (IS_BUILD) {
      console.warn(`[supabase-public] ${table}: ${err instanceof Error ? err.message : String(err)} — building without it.`)
      return null
    }
    throw err
  }
}
