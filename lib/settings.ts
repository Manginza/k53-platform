/**
 * lib/settings.ts — admin-editable app settings (server-only).
 *
 * Currently: the latest live-session recording link. Updating it replaces the
 * recording shown at the top of the Videos page and in the session popup.
 */
import { createAdminClient } from '@/lib/supabase-admin'
import { LIVE_SESSION_RECORDING_URL, LIVE_SESSION_RECORDING_FILE_ID } from '@/lib/contact'

const RECORDING_KEY = 'live_recording_url'

/** Extract a Google Drive file id from a share URL (…/file/d/<id>/…). */
export function driveFileId(url: string): string | null {
  return url.match(/\/file\/d\/([^/]+)/)?.[1]
    ?? new URL(url, 'https://x').searchParams.get('id')
    ?? null
}

/** The latest live-session recording URL (admin-set), or the built-in default. */
export async function getLatestRecordingUrl(): Promise<string> {
  try {
    const { data } = await createAdminClient()
      .from('app_settings').select('value').eq('key', RECORDING_KEY).maybeSingle()
    return data?.value?.trim() || LIVE_SESSION_RECORDING_URL
  } catch {
    return LIVE_SESSION_RECORDING_URL
  }
}

/** Latest recording as { url, fileId } for the Videos page. */
export async function getLatestRecording(): Promise<{ url: string; fileId: string }> {
  const url = await getLatestRecordingUrl()
  return { url, fileId: driveFileId(url) ?? LIVE_SESSION_RECORDING_FILE_ID }
}

/** Admin: set the latest recording URL. */
export async function setLatestRecordingUrl(url: string): Promise<void> {
  await createAdminClient()
    .from('app_settings')
    .upsert({ key: RECORDING_KEY, value: url, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}

const PROMO_FROM_KEY  = 'free_promo_from'
const PROMO_UNTIL_KEY = 'free_promo_until'

export interface PromoWindow { from: string; until: string }

export async function getPromoWindow(): Promise<PromoWindow> {
  try {
    const db = createAdminClient()
    const [{ data: fromRow }, { data: untilRow }] = await Promise.all([
      db.from('app_settings').select('value').eq('key', PROMO_FROM_KEY).maybeSingle(),
      db.from('app_settings').select('value').eq('key', PROMO_UNTIL_KEY).maybeSingle(),
    ])
    return { from: fromRow?.value ?? '', until: untilRow?.value ?? '' }
  } catch {
    return { from: '', until: '' }
  }
}

export async function setPromoWindow(from: string, until: string): Promise<void> {
  const db = createAdminClient()
  const now = new Date().toISOString()
  await Promise.all([
    db.from('app_settings').upsert({ key: PROMO_FROM_KEY, value: from, updated_at: now }, { onConflict: 'key' }),
    db.from('app_settings').upsert({ key: PROMO_UNTIL_KEY, value: until, updated_at: now }, { onConflict: 'key' }),
  ])
}

export function isPromoActiveNow(window: PromoWindow): boolean {
  if (!window.until) return false
  const now = Date.now()
  const from = window.from ? Date.parse(window.from) : 0
  const until = Date.parse(window.until)
  return now >= from && now < until
}
