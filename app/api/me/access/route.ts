/**
 * GET /api/me/access — does the current visitor have full access?
 * Used by the client (e.g. the live-session popup) without forcing the whole
 * app to render dynamically. Never throws; returns { fullAccess: boolean }.
 */
import { NextResponse } from 'next/server'
import { hasFullAccess } from '@/lib/access'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ fullAccess: await hasFullAccess() })
  } catch {
    return NextResponse.json({ fullAccess: false })
  }
}
