/**
 * LockedContent — premium gate shown when a free user hits paid-only content
 * (Resources, Videos, Live Notes). Pure server-safe markup: just links.
 */
import Link from 'next/link'

export default function LockedContent({
  feature,
  description,
  isLoggedIn,
}: {
  feature: string
  description: string
  isLoggedIn: boolean
}) {
  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{feature} is a premium feature</h1>
        <p className="text-sm text-gray-500 mb-6">{description}</p>

        <ul className="text-left text-sm text-gray-600 space-y-2 mb-7 max-w-xs mx-auto">
          <li className="flex gap-2"><span className="text-green-600">✓</span> Unlimited timed practice tests</li>
          <li className="flex gap-2"><span className="text-green-600">✓</span> Full Live Notes, resources &amp; videos</li>
          <li className="flex gap-2"><span className="text-green-600">✓</span> From R49 · 14-day, 60-day &amp; lifetime passes</li>
        </ul>

        <Link
          href="/pricing"
          className="block w-full bg-blue-700 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition-colors"
        >
          View access passes
        </Link>

        {!isLoggedIn && (
          <p className="text-sm text-gray-500 mt-4">
            Already paid?{' '}
            <Link href="/login" className="text-blue-700 font-medium hover:underline">Log in</Link>
          </p>
        )}
      </div>
    </main>
  )
}
