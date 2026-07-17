/**
 * GET /api/me/access — the client-side gate for popups + gated pages.
 *
 * Returns three fields:
 *   - fullAccess:  the STRICT gate — true only for admins, users with an
 *                  active access_grants row, or during a free promo.
 *                  Client-gated CONTENT (Resources PDFs, etc.) must check
 *                  this field, not isLoggedIn.
 *   - isLoggedIn:  whether the visitor has a session at all. Used by the
 *                  live-session popups so any registered account can be
 *                  reminded about the 8pm session (a marketing nudge, not
 *                  a content unlock).
 *   - recordingUrl: shown to fullAccess members AND any logged-in user.
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
    // Recording is a low-value marketing surface — show it to full-access
    // members AND any logged-in user (preserves the previous nudge for
    // members without an active grant).
    const recordingUrl = (fullAccess || isLoggedIn) ? await getLatestRecordingUrl() : null
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
