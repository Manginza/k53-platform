/**
 * lib/affiliate-scoreboard.ts — the programme-wide earnings leaderboard.
 *
 * Every enrolled affiliate sees who is earning: the top earners by name, with
 * their sales count and commission, plus their own row and rank wherever they
 * sit. Only affiliates who have actually earned appear, so the board answers
 * "who is making money here", not "who signed up".
 *
 * The ranking lives in the `affiliate_scoreboard` view (migration 20), which
 * aggregates across EVERY affiliate and therefore cannot be exposed through
 * the per-affiliate RLS the base tables use. The view is revoked from the
 * client roles and read here with the service-role key — so this module is
 * server-only, and callers MUST have established that the viewer is an
 * enrolled affiliate before calling it (getScoreboard takes their affiliate
 * id, which only an enrolled affiliate has).
 */
import { createAdminClient } from '@/lib/supabase-admin'
import type { Scoreboard, ScoreboardEntry } from '@/lib/types'

/** How many earners the board lists before falling back to "your row". */
export const SCOREBOARD_SIZE = 10

/** Cap on the programme admin's full board — well above any realistic count. */
export const SCOREBOARD_ADMIN_SIZE = 500

interface ScoreboardRow {
  rank: number
  affiliate_id: string
  code: string
  name: string | null
  sales: number
  earned_cents: number
}

const SELECT = 'rank, affiliate_id, code, name, sales, earned_cents'

const EMPTY: Scoreboard = { top: [], viewer: null, earnerCount: 0 }

function toEntry(row: ScoreboardRow, viewerAffiliateId: string): ScoreboardEntry {
  return {
    rank: row.rank,
    // An affiliate added before names were collected has none — the referral
    // code is the only label that still identifies them.
    name: row.name?.trim() || row.code,
    sales: row.sales,
    earnedCents: row.earned_cents,
    isViewer: row.affiliate_id === viewerAffiliateId,
  }
}

/**
 * The leaderboard as `viewerAffiliateId` should see it.
 *
 * Never throws: the board is one panel on the affiliate's dashboard, and a
 * reporting failure must not take the whole dashboard (referral link, bank
 * details, commission history) down with it. Failures are logged and render
 * as an empty board.
 */
export async function getScoreboard(
  viewerAffiliateId: string,
  size: number = SCOREBOARD_SIZE,
): Promise<Scoreboard> {
  const db = createAdminClient()

  try {
    const [topResult, viewerResult, countResult] = await Promise.all([
      db.from('affiliate_scoreboard').select(SELECT)
        .order('rank', { ascending: true })
        .order('name', { ascending: true })
        .limit(size),
      db.from('affiliate_scoreboard').select(SELECT)
        .eq('affiliate_id', viewerAffiliateId)
        .maybeSingle(),
      db.from('affiliate_scoreboard').select('affiliate_id', { count: 'exact', head: true }),
    ])

    if (topResult.error) throw new Error(topResult.error.message)

    const top = (topResult.data as ScoreboardRow[] ?? []).map(r => toEntry(r, viewerAffiliateId))

    // The viewer's own row, but only when the board above doesn't already
    // show it. An affiliate with no sales yet isn't in the view at all.
    const viewerRow = viewerResult.error ? null : (viewerResult.data as ScoreboardRow | null)
    const viewer = viewerRow && !top.some(e => e.isViewer)
      ? toEntry(viewerRow, viewerAffiliateId)
      : null

    return { top, viewer, earnerCount: countResult.count ?? top.length }
  } catch (error) {
    console.error('[affiliate-scoreboard] could not build the scoreboard', {
      viewerAffiliateId,
      error: error instanceof Error ? error.message : String(error),
    })
    return EMPTY
  }
}
