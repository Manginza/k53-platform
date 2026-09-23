/**
 * lib/settings.ts — admin-editable app settings (server-only).
 *
 * Currently: the latest live-session recording link. Updating it replaces the
 * recording shown at the top of the Videos page and in the session popup.
 */
import { unstable_cache, revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase-admin'
import { LIVE_SESSION_RECORDING_URL, LIVE_SESSION_RECORDING_FILE_ID } from '@/lib/contact'

const RECORDING_KEY = 'live_recording_url'

// app_settings is read on hot, per-visitor paths (getLatestRecordingUrl runs
// for every full-access visitor via /api/me/access; getPromoWindow runs per
// request whenever the hardcoded promo is not active). These rows change only
// when an admin edits them, so cache them briefly and bust the cache on write.
// This turns a per-visitor DB read into roughly one read per minute under load.
const SETTINGS_TAG = 'app-settings'

/** Extract a Google Drive file id from a share URL (…/file/d/<id>/…). */
export function driveFileId(url: string): string | null {
  return url.match(/\/file\/d\/([^/]+)/)?.[1]
    ?? new URL(url, 'https://x').searchParams.get('id')
    ?? null
}

/** The latest live-session recording URL (admin-set), or the built-in default. */
export const getLatestRecordingUrl = unstable_cache(
  async (): Promise<string> => {
    try {
      const { data } = await createAdminClient()
        .from('app_settings').select('value').eq('key', RECORDING_KEY).maybeSingle()
      return data?.value?.trim() || LIVE_SESSION_RECORDING_URL
    } catch {
      return LIVE_SESSION_RECORDING_URL
    }
  },
  ['app-settings:recording-url'],
  { revalidate: 60, tags: [SETTINGS_TAG] },
)

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
  revalidateTag(SETTINGS_TAG)
}

const PROMO_FROM_KEY  = 'free_promo_from'
const PROMO_UNTIL_KEY = 'free_promo_until'

export interface PromoWindow { from: string; until: string }

export const getPromoWindow = unstable_cache(
  async (): Promise<PromoWindow> => {
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
  },
  ['app-settings:promo-window'],
  { revalidate: 60, tags: [SETTINGS_TAG] },
)

export async function setPromoWindow(from: string, until: string): Promise<void> {
  const db = createAdminClient()
  const now = new Date().toISOString()
  await Promise.all([
    db.from('app_settings').upsert({ key: PROMO_FROM_KEY, value: from, updated_at: now }, { onConflict: 'key' }),
    db.from('app_settings').upsert({ key: PROMO_UNTIL_KEY, value: until, updated_at: now }, { onConflict: 'key' }),
  ])
  revalidateTag(SETTINGS_TAG)
}

export function isPromoActiveNow(window: PromoWindow): boolean {
  if (!window.until) return false
  const now = Date.now()
  const from = window.from ? Date.parse(window.from) : 0
  const until = Date.parse(window.until)
  return now >= from && now < until
}
