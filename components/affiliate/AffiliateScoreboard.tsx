/**
 * AffiliateScoreboard — "who's earning" leaderboard on the affiliate
 * dashboard. Shows the top earners by name with their sales and commission,
 * and always shows the viewer their own rank, even when they sit below the
 * listed places.
 *
 * Presentational only: the ranking is built server-side in
 * lib/affiliate-scoreboard.ts.
 */
import type { Scoreboard, ScoreboardEntry } from '@/lib/types'

function rand(cents: number) {
  return `R${(cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

function Row({ entry }: { entry: ScoreboardEntry }) {
  const medal = MEDALS[entry.rank]
  return (
    <li
      className={`flex items-center gap-3 px-5 py-3 ${entry.isViewer ? 'bg-blue-50' : ''}`}
      aria-current={entry.isViewer ? 'true' : undefined}
    >
      <span
        className={`shrink-0 w-8 text-center font-extrabold ${medal ? 'text-lg' : 'text-sm text-gray-400'}`}
        aria-label={`Position ${entry.rank}`}
      >
        {medal ?? entry.rank}
      </span>

      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-semibold ${entry.isViewer ? 'text-blue-800' : 'text-gray-800'}`}>
          {entry.name}
          {entry.isViewer && <span className="ml-2 text-xs font-bold uppercase tracking-wide text-blue-600">You</span>}
        </span>
        <span className="block text-xs text-gray-400">
          {entry.sales} {entry.sales === 1 ? 'sale' : 'sales'}
        </span>
      </span>

      <span className={`shrink-0 text-right text-sm font-extrabold ${entry.isViewer ? 'text-blue-800' : 'text-gray-800'}`}>
        {rand(entry.earnedCents)}
      </span>
    </li>
  )
}

export default function AffiliateScoreboard({ scoreboard }: { scoreboard: Scoreboard }) {
  const { top, viewer, earnerCount } = scoreboard
  const hidden = earnerCount - top.length

  return (
    <section className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-baseline justify-between gap-3">
        <h2 className="font-bold text-gray-800">Who&apos;s earning</h2>
        {earnerCount > 0 && (
          <p className="text-xs text-gray-400 shrink-0">
            {earnerCount} {earnerCount === 1 ? 'affiliate' : 'affiliates'} earning
          </p>
        )}
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-gray-500 px-5 py-8 text-center">
          Nobody has earned yet. The first sale through your link puts you top of this board.
        </p>
      ) : (
        <>
          <ol className="divide-y divide-gray-100">
            {top.map(entry => <Row key={`${entry.rank}-${entry.name}`} entry={entry} />)}
          </ol>

          {viewer && (
            <>
              <div className="px-5 py-1 text-center text-gray-300 text-xs" aria-hidden="true">···</div>
              <ol className="divide-y divide-gray-100 border-t border-gray-100">
                <Row entry={viewer} />
              </ol>
            </>
          )}

          <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
            {viewer
              ? `You're ${ordinal(viewer.rank)} of ${earnerCount} earning affiliates.`
              : hidden > 0
                ? `Top ${top.length} of ${earnerCount} earning affiliates.`
                : 'Everyone earning on the programme is listed.'}
          </p>
        </>
      )}
    </section>
  )
}

function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th'
    : n % 10 === 1 ? 'st'
    : n % 10 === 2 ? 'nd'
    : n % 10 === 3 ? 'rd'
    : 'th'
  return `${n}${suffix}`
}
