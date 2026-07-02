/**
 * GET /api/me/access — does the current visitor have full access, and (if so)
 * the latest live-session recording link for the popup. Used client-side so
 * the app stays static. Never throws.
 */
import { NextResponse } from 'next/server'
import { hasFullAccess } from '@/lib/access'
import { getLatestRecordingUrl } from '@/lib/settings'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Visible to paid members OR any logged-in user (so members can join
    // the live 8pm sessions even if they haven't purchased an access pass).
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const fullAccess = !!user || await hasFullAccess()
    const recordingUrl = fullAccess ? await getLatestRecordingUrl() : null
    return NextResponse.json({ fullAccess, recordingUrl }, {
      headers: {
        // Private (browser-only cache): reuse for 60 s without a round-trip.
        // CDN must NOT cache this — it is user-specific.
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch {
    return NextResponse.json({ fullAccess: false, recordingUrl: null })
  }
}
