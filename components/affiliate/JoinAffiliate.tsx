'use client'

/**
 * JoinAffiliate — enrolment CTA shown to logged-in users who aren't yet
 * affiliates. Calls /api/affiliate/join then reloads to reveal the dashboard.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinAffiliate() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function join() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/affiliate/join', { method: 'POST' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Something went wrong.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-lg mx-auto">
      <div className="text-5xl mb-4">🤝</div>
      <h1 className="text-2xl font-extrabold text-blue-700 mb-2">Become an affiliate</h1>
      <p className="text-sm text-gray-500 mb-6">
        Share K53 Learner&apos;s with friends and earn <strong>20% commission</strong> on every
        subscription they buy through your link. It&apos;s free to join.
      </p>

      <ul className="text-left text-sm text-gray-600 space-y-2 mb-6 max-w-xs mx-auto">
        <li className="flex gap-2"><span className="text-green-600">✓</span> Get your unique referral link</li>
        <li className="flex gap-2"><span className="text-green-600">✓</span> Track clicks, signups &amp; earnings</li>
        <li className="flex gap-2"><span className="text-green-600">✓</span> 20% of every payment, recurring</li>
      </ul>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={join}
        disabled={loading}
        className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
      >
        {loading ? 'Setting up…' : 'Join the affiliate programme'}
      </button>
    </div>
  )
}
