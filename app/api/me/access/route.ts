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
import { createAdminClient } from '@/lib/supabase-admin'
import { hasPendingCheckout, recoverPaidAccess } from '@/lib/payment-recovery'

export const dynamic = 'force-dynamic'

/**
 * Last line of defence for a buyer whose payment never reached an access
 * grant: if they are signed in, have no access, and have a recent checkout
 * the payment ledger has never seen, verify it with Yoco and apply it here.
 *
 * That turns "message us and we'll sort it out" into a page load. Every
 * visitor hits this endpoint, so the expensive part is gated behind
 * hasPendingCheckout(), which is two indexed reads and no call to Yoco —
 * a visitor who never started a checkout costs nothing extra.
 *
 * Returns true when access was granted, so the caller can re-read it.
 */
async function tryRecoverAccess(userId: string): Promise<boolean> {
  try {
    const db = createAdminClient()
    if (!await hasPendingCheckout(db, userId)) return false
    const report = await recoverPaidAccess(db, { userIds: [userId], withinDays: 7 })
    if (report.fixed > 0) {
      console.log('[me/access] recovered access for a paid account', { userId, fixed: report.fixed })
      return true
    }
  } catch (error) {
    // A failed recovery must never take down the access check itself.
    console.error('[me/access] recovery attempt failed', {
      userId, error: error instanceof Error ? error.message : String(error),
    })
  }
  return false
}

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isLoggedIn = !!user
    let fullAccess = await hasFullAccess()
    if (!fullAccess && user && await tryRecoverAccess(user.id)) {
      fullAccess = await hasFullAccess()
    }
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
