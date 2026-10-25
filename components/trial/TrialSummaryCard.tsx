/**
 * TrialSummaryCard — "Each Once" progress, combined score and upgrade pitch.
 *
 * Shown on the results screen after a free attempt, and in place of the quiz
 * when a learner reopens a test they already used. Once every test for the
 * code is done it shows one combined score and invites them to buy access.
 */
import Link from 'next/link'
import BuyAccessButton from '@/components/BuyAccessButton'
import { WHATSAPP_URL, ACCESS_PRICE } from '@/lib/contact'
import type { TrialSummary } from '@/lib/trial'

export default function TrialSummaryCard({ summary }: { summary: TrialSummary }) {
  const { tests, completed, allDone, nextTest, courseId, courseTitle } = summary
  const passed = summary.overallPercentage >= 75

  return (
    <section className="rounded-2xl border-2 border-blue-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-blue-700 px-5 py-4 text-white">
        <div className="text-xs font-bold uppercase tracking-widest text-blue-200">Each Once Special</div>
        <h2 className="text-lg font-extrabold">
          {allDone ? `Your overall ${courseTitle} score` : `Free attempts used: ${completed} of ${tests.length}`}
        </h2>
      </div>

      <div className="p-5">
        {allDone && summary.overallTotal > 0 && (
          <div className="mb-4 text-center">
            <div className={`text-5xl font-extrabold ${passed ? 'text-green-600' : 'text-amber-600'}`}>
              {summary.overallPercentage}%
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {summary.overallScore} correct out of {summary.overallTotal} across all {tests.length} tests
            </div>
          </div>
        )}

        <ul className="mb-4 divide-y divide-gray-100 rounded-xl border border-gray-100 text-sm">
          {tests.map(t => (
            <li key={t.testNumber} className="flex items-center justify-between px-4 py-2.5">
              <span className="font-medium text-gray-800">Test {t.testNumber}</span>
              {t.done ? (
                <span className="text-gray-600">
                  {t.score != null && t.total ? `${t.score}/${t.total} · ${Math.round((t.score / t.total) * 100)}%` : 'Time ran out'}
                </span>
              ) : (
                <Link href={`/quiz/${courseId}?test=${t.testNumber}`} className="font-semibold text-blue-700 hover:underline">
                  Take it free →
                </Link>
              )}
            </li>
          ))}
        </ul>

        {!allDone && nextTest != null && (
          <Link
            href={`/quiz/${courseId}?test=${nextTest}`}
            className="mb-4 block w-full rounded-xl bg-blue-600 py-3 text-center font-bold text-white hover:bg-blue-700 transition-colors"
          >
            Continue with Test {nextTest} →
          </Link>
        )}

        <div className="rounded-xl bg-blue-50 p-4">
          <p className="mb-3 text-sm text-blue-900">
            {allDone
              ? passed
                ? 'Great work! Keep it sharp until test day — get full access and retake every test as often as you like until you pass.'
                : 'You are close. Get full access to retake every test as often as you like, with notes and videos, until you pass.'
              : `Each test is free once. Want unlimited retakes, notes and videos? Get full access for ${ACCESS_PRICE}.`}
          </p>
          <BuyAccessButton />
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center text-sm font-semibold text-green-700 hover:underline"
          >
            Or pay {ACCESS_PRICE} via WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
