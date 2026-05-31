/**
 * lib/supabase-admin.ts — service-role Supabase client (server-only).
 *
 * Bypasses RLS. NEVER import this into a Client Component or expose the
 * SUPABASE_SERVICE_ROLE_KEY to the browser. Use only in API routes,
 * webhooks, and server actions that need privileged writes.
 */
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}
