/**
 * Full-page screens the quiz page renders instead of a test when the learner's
 * free "Each Once" attempt for it is not available.
 */
import Link from 'next/link'
import TrialSummaryCard from '@/components/trial/TrialSummaryCard'
import BuyAccessButton from '@/components/BuyAccessButton'
import { WHATSAPP_URL, ACCESS_PRICE } from '@/lib/contact'
import type { TrialSummary } from '@/lib/trial'

/** The learner already used their free attempt at this test. */
export function TrialUsedScreen({ summary, testNumber }: { summary: TrialSummary; testNumber: number }) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <p className="mb-4 text-center text-sm text-gray-600">
          You have already used your free attempt at <strong>Test {testNumber}</strong>.
        </p>
        <TrialSummaryCard summary={summary} />
        <Link href={`/courses/${summary.courseId}`} className="mt-4 block text-center text-sm text-gray-500 hover:underline">
          ← Back to course
        </Link>
      </div>
    </main>
  )
}

/** Another account already claimed this course's trial from the same IP. */
export function TrialBlockedScreen({ courseId }: { courseId: number }) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-md text-center">
        <div className="mb-3 text-4xl">🔒</div>
        <h1 className="mb-2 text-xl font-extrabold text-gray-900">Free attempt already used here</h1>
        <p className="mb-6 text-sm text-gray-600">
          The free attempt for these tests has already been claimed from this connection by another account.
          The Each Once Special is one free attempt per learner. Get full access for {ACCESS_PRICE} to practise as often as you like.
        </p>
        <BuyAccessButton />
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-sm font-semibold text-green-700 hover:underline"
        >
          Think this is a mistake? Message us on WhatsApp
        </a>
        <Link href={`/courses/${courseId}`} className="mt-4 block text-sm text-gray-500 hover:underline">
          ← Back to course
        </Link>
      </div>
    </main>
  )
}
