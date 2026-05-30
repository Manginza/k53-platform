import Link from 'next/link'

export default function SubscribeFailedPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">

        <div className="text-6xl mb-4">❌</div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Payment unsuccessful
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Your payment could not be processed. You have not been charged.
          Please check your card details and try again.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6 text-left space-y-1">
          <div className="font-semibold mb-1">Common reasons for failure:</div>
          <div>• Insufficient funds</div>
          <div>• Card details entered incorrectly</div>
          <div>• 3D Secure authentication was cancelled</div>
          <div>• Card not enabled for online transactions</div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/pricing"
            className="block bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try again →
          </Link>
          <Link
            href="/"
            className="block border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors"
          >
            Back to home
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:support@skdriving.co.za" className="underline">
            support@skdriving.co.za
          </a>
        </p>
      </div>
    </main>
  )
}
