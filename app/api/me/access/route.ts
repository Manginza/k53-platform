/**
 * GET /api/me/access — the client-side gate for popups + gated pages.
 *
 * Returns three fields:
 *   - fullAccess:  the STRICT gate — true only for admins, users with an
 *                  active access_grants row, or during a free promo.
 *                  Client-gated CONTENT (Resources PDFs, etc.) must check
 *                  this field, not isLoggedIn.
 *   - isLoggedIn:  whether the visitor has a session at all. This is account
 *                  identity only and must never unlock premium content.
 *   - recordingUrl: returned only to fullAccess members.
 *
 * Previously fullAccess collapsed to `!!user || hasFullAccess()`, which
 * meant every newly-registered account (no payment) got the "you have
 * access" answer and ResourcesClient unlocked all PDFs for them. Server-
 * gated pages (quizzes, videos) correctly kept them out, so users saw
 * inconsistent access — and admins had no way to actually gate content
 * behind payment.
 *
 * Never throws.
 */
import { NextResponse } from 'next/server'
import { hasFullAccess } from '@/lib/access'
import { getLatestRecordingUrl } from '@/lib/settings'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isLoggedIn = !!user
    const fullAccess = await hasFullAccess()
    const recordingUrl = fullAccess ? await getLatestRecordingUrl() : null
    return NextResponse.json({ fullAccess, isLoggedIn, recordingUrl }, {
      headers: {
        // Private (browser-only cache): reuse for 60 s without a round-trip.
        // CDN must NOT cache this — it is user-specific.
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch {
    return NextResponse.json({ fullAccess: false, isLoggedIn: false, recordingUrl: null })
  }
}
