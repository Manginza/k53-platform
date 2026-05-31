/**
 * QuizPaywall — shown when a free user's 3-minute preview has expired.
 * Server-safe (links only) so it can render from both the quiz page
 * (server) and QuizClient (client).
 */
import Link from 'next/link'

export default function QuizPaywall({
  courseId,
  isLoggedIn,
}: {
  courseId: number
  isLoggedIn: boolean
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="text-5xl mb-4">⏱️</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Your free preview is up</h1>
        <p className="text-sm text-gray-500 mb-6">
          You&apos;ve used your free 3 minutes on this test. Get an access pass to keep practising —
          unlimited timed tests, plus Live Notes, resources and videos.
        </p>

        <div className="grid grid-cols-3 gap-2 mb-6 text-sm">
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="font-extrabold text-gray-900">R49</div>
            <div className="text-xs text-gray-400">14 days</div>
          </div>
          <div className="rounded-xl border-2 border-blue-600 p-3">
            <div className="font-extrabold text-blue-700">R150</div>
            <div className="text-xs text-gray-400">50 days</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="font-extrabold text-gray-900">R399</div>
            <div className="text-xs text-gray-400">lifetime</div>
          </div>
        </div>

        <Link
          href="/pricing"
          className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors"
        >
          View access passes
        </Link>
        <Link
          href={`/courses/${courseId}`}
          className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 transition-colors text-sm"
        >
          Back to course
        </Link>

        {!isLoggedIn && (
          <p className="text-sm text-gray-500 mt-2">
            Already paid?{' '}
            <Link href="/login" className="text-blue-700 font-medium hover:underline">Log in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
