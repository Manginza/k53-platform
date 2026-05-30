import Link from 'next/link'

export default function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: { plan?: string }
}) {
  const isAnnual = searchParams.plan === 'premium-annual'

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">

        <div className="text-6xl mb-4">🎉</div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Payment successful!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Thank you for subscribing to SK Driving Premium
          {isAnnual ? ' (Annual)' : ' (Monthly)'}.
          Your account is being activated — this usually takes less than a minute.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 mb-6 text-left space-y-1">
          <div className="font-semibold mb-2">✅ What you now have access to:</div>
          <div>• All Code 8 and Code 10 practice tests</div>
          <div>• Live Notes — Road Signs Manual (18 chapters + quizzes)</div>
          <div>• Unlimited retakes with full explanations</div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/live-notes"
            className="block bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Start Live Notes →
          </Link>
          <Link
            href="/courses"
            className="block border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors"
          >
            Go to Courses
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          A confirmation email will be sent to your registered email address.
          If you have any issues, contact us at{' '}
          <a href="mailto:support@skdriving.co.za" className="underline">
            support@skdriving.co.za
          </a>.
        </p>
      </div>
    </main>
  )
}
