'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLANS = [
  {
    slug:      'pass-14day',
    name:      '14-Day Access',
    price:     'R49',
    period:    '/ 14 days',
    highlight: false,
    badge:     null,
    features: [
      'Unlimited timed practice tests',
      'Full Live Notes (18 chapters)',
      'All study resources & PDFs',
      'All study videos',
      'Full answer explanations',
    ],
  },
  {
    slug:      'pass-60day',
    name:      '60-Day Access',
    price:     'R150',
    period:    '/ 60 days',
    highlight: true,
    badge:     'Most popular',
    features: [
      'Everything in 14-Day Access',
      '60 days of full access',
      'Best for thorough preparation',
      'Save vs. two 14-day passes',
    ],
  },
  {
    slug:      'pass-lifetime',
    name:      'Lifetime Access',
    price:     'R399',
    period:    'once-off',
    highlight: false,
    badge:     'Best value',
    features: [
      'Everything in 60-Day Access',
      'Pay once, learn forever',
      'All future content updates',
      'No recurring charges',
    ],
  },
]

const FREE_FEATURES = [
  'Every practice test — free 3-minute preview',
  'Browse the course & test list',
  'Upgrade any time to unlock full access',
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubscribe(planSlug: string) {
    setLoading(planSlug)
    setError(null)

    const res = await fetch('/api/yoco/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planSlug }),
    })

    if (res.status === 401) {
      // Not logged in — redirect to login then back to pricing
      router.push('/login?next=/pricing')
      return
    }

    const data = await res.json()

    if (!res.ok || !data.redirectUrl) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      setLoading(null)
      return
    }

    // Redirect to Yoco's hosted payment page
    window.location.href = data.redirectUrl
  }

  return (
    <main className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <div className="bg-blue-700 text-white py-14 px-4 text-center">
        <span className="text-xs font-bold tracking-widest uppercase text-blue-200 block mb-3">
          SK Driving
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
          Pass Your K53 First Time
        </h1>
        <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto">
          Unlock unlimited access to all practice tests and the full Road Signs manual.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">

          {/* Free tier */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 flex flex-col">
            <div className="mb-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Free</div>
              <div className="text-3xl font-extrabold text-gray-900">R0</div>
              <div className="text-sm text-gray-400">forever</div>
            </div>
            <ul className="space-y-2 flex-1 mb-6">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-gray-300 mt-0.5">○</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/courses"
              className="block text-center py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-400 transition-colors"
            >
              Browse free content
            </Link>
          </div>

          {/* Paid plans */}
          {PLANS.map(plan => (
            <div
              key={plan.slug}
              className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${
                plan.highlight
                  ? 'border-blue-600 shadow-lg shadow-blue-100'
                  : 'border-gray-200'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div className="mb-4">
                <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.highlight ? 'text-blue-600' : 'text-gray-400'}`}>
                  {plan.name}
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-400 mb-1">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5 font-bold shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.slug)}
                disabled={loading !== null}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 ${
                  plan.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-700'
                }`}
              >
                {loading === plan.slug ? 'Redirecting to payment…' : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="grid sm:grid-cols-3 gap-4 text-center text-sm text-gray-500 mb-10">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl mb-1">🔒</div>
            <div className="font-semibold text-gray-700">Secure payment</div>
            <div>Powered by Yoco — South Africa&apos;s trusted payments platform</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl mb-1">🇿🇦</div>
            <div className="font-semibold text-gray-700">100% South African</div>
            <div>Content aligned to the official K53 learner&apos;s licence exam</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl mb-1">♾️</div>
            <div className="font-semibold text-gray-700">Unlimited retakes</div>
            <div>Practice as many times as you need until you&apos;re ready</div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Common questions</h2>
          <div className="space-y-4 text-sm">
            {[
              ['What payment methods does Yoco accept?', 'Yoco accepts all major credit and debit cards (Visa, Mastercard) as well as EFT and SnapScan.'],
              ['Are these one-time payments?', 'Yes. All passes are once-off — there is no subscription and nothing auto-renews. When a timed pass expires you simply buy another if you need more time.'],
              ['What do I get for free?', 'You can preview any practice test for 3 minutes without paying. To keep practising past the timer — and to unlock Live Notes, resources and videos — you buy any access pass.'],
              ['Is this aligned to the official K53 exam?', 'Yes. All content is based on the SA National Road Traffic Act and official K53 learner\'s licence study material.'],
            ].map(([q, a]) => (
              <div key={q} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="font-semibold text-gray-800 mb-1">{q}</div>
                <div className="text-gray-500">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
