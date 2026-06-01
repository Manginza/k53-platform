'use client'

/**
 * /subscribe/success?token=XXXX — landing after a successful Yoco payment.
 * The buyer now creates their account using the registration token.
 */
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessInner() {
  const token = useSearchParams().get('token') ?? ''

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment successful!</h1>
        <p className="text-sm text-gray-500 mb-6">
          One last step: create your account to unlock <strong>60 days of full access</strong> —
          you&apos;ll use it to log in on any device.
        </p>

        {token ? (
          <Link
            href={`/register?token=${encodeURIComponent(token)}`}
            className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors"
          >
            Create my account →
          </Link>
        ) : (
          <Link href="/pricing" className="block w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">
            Continue
          </Link>
        )}

        <p className="text-xs text-gray-400 mt-5">
          If you paid but this page didn&apos;t open the account step, contact us at{' '}
          <a href="mailto:support@skdriving.co.za" className="underline">support@skdriving.co.za</a>.
        </p>
      </div>
    </main>
  )
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  )
}
