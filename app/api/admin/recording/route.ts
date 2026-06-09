/**
 * POST /api/admin/recording — set the latest live-session recording link
 * (admin only). Replaces the recording shown at the top of Videos and in the
 * session popup. Body: { url: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { setLatestRecordingUrl } from '@/lib/settings'

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let url = ''
  try { url = (await req.json()).url?.toString().trim() ?? '' } catch {}
  if (!/^https?:\/\/\S+$/.test(url)) {
    return NextResponse.json({ error: 'Please enter a valid recording link (https://…).' }, { status: 400 })
  }

  await setLatestRecordingUrl(url)
  return NextResponse.json({ ok: true, url })
}
