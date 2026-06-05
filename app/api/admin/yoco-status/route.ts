/**
 * GET /api/admin/yoco-status — admin-only payment-config diagnostic.
 *
 * Reports whether Yoco is in TEST or LIVE mode and whether the secret key is
 * actually accepted by Yoco — without ever exposing the key. Use this to
 * diagnose card declines (a test key in production declines all real cards).
 */
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const key = process.env.YOCO_SECRET_KEY ?? ''
  const mode = key.startsWith('sk_test') ? 'TEST'
    : key.startsWith('sk_live') ? 'LIVE'
    : key ? 'UNKNOWN (key has no sk_test/sk_live prefix)'
    : 'MISSING'

  // Does Yoco accept the key? GET a non-existent checkout:
  //   401 → key rejected (wrong/revoked).  404 → key accepted (works).
  let keyAccepted: boolean | null = null
  let yocoStatus: number | null = null
  if (key) {
    try {
      const res = await fetch('https://payments.yoco.com/api/checkouts/ch_diagnostic_nonexistent', {
        headers: { Authorization: `Bearer ${key}` },
      })
      yocoStatus = res.status
      keyAccepted = res.status !== 401
    } catch {
      keyAccepted = false
    }
  }

  return NextResponse.json({
    mode,
    keyConfigured: !!key,
    keyAccepted,
    yocoStatus,
    webhookSecretConfigured: !!process.env.YOCO_WEBHOOK_SECRET,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? '(default)',
    note: mode === 'TEST'
      ? 'TEST MODE — real customer cards WILL be declined. Switch YOCO_SECRET_KEY (and YOCO_WEBHOOK_SECRET) to the sk_live_ pair in Vercel and redeploy.'
      : 'If mode is LIVE and cards still decline, check the decline reason in the Yoco dashboard (Sales → the failed payment) and that online card payments are activated for the account.',
  })
}
