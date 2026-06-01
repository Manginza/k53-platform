import Link from 'next/link'
import BuyAccessButton from '@/components/BuyAccessButton'
import { WHATSAPP_URL, ACCESS_PRICE, ACCESS_DURATION_DAYS } from '@/lib/contact'

export const metadata = {
  title: 'Get Full Access — K53 Learner\'s',
  description: 'Unlock unlimited K53 practice tests, Live Notes, resources and videos.',
}

const FEATURES = [
  'Unlimited timed practice tests (Code 8 & Code 10)',
  'Full Live Notes — Road Signs Manual + Rules of the Road',
  'All study resources & PDFs',
  'All study videos',
  'Full answer explanations',
]

export default function PricingPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="bg-blue-700 text-white py-14 px-4 text-center">
        <span className="text-xs font-bold tracking-widest uppercase text-blue-200 block mb-3">SK Driving</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">Pass Your K53 First Time</h1>
        <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto">
          Try any test free for 3 minutes. Unlock everything for {ACCESS_PRICE}.
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-lg p-7">
          <div className="text-center mb-5">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Full Access</div>
            <div className="flex items-end justify-center gap-1">
              <span className="text-4xl font-extrabold text-gray-900">{ACCESS_PRICE}</span>
              <span className="text-sm text-gray-400 mb-1">/ {ACCESS_DURATION_DAYS} days</span>
            </div>
          </div>

          <ul className="space-y-2 mb-6">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5 font-bold shrink-0">✓</span> {f}
              </li>
            ))}
          </ul>

          {/* Primary: pay online with card */}
          <BuyAccessButton />

          {/* Alternative: WhatsApp */}
          <div className="flex items-center gap-3 my-4">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border-2 border-green-600 text-green-700 font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.47 14.38c-.3-.15-1.74-.86-2-.95-.27-.1-.47-.15-.66.15-.2.3-.77.95-.94 1.15-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.57-.48-.5-.66-.5l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.74-.71 1.98-1.4.24-.68.24-1.27.17-1.4-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.5 9.5 0 01-4.84-1.33l-.35-.2-3.6.94.96-3.5-.23-.36a9.46 9.46 0 01-1.45-5.05c0-5.24 4.27-9.5 9.52-9.5 2.54 0 4.93.99 6.73 2.79a9.45 9.45 0 012.79 6.72c0 5.24-4.27 9.5-9.52 9.5zm5.55-15.05A11.43 11.43 0 0012.05 3C5.8 3 .72 8.08.72 14.33c0 2 .53 3.96 1.53 5.69L.64 26l6.13-1.61a11.4 11.4 0 005.28 1.34h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01z"/>
            </svg>
            Pay via WhatsApp instead
          </a>

          <Link href="/redeem" className="block text-center text-blue-700 font-semibold py-3 mt-1 hover:underline text-sm">
            I already have an access code
          </Link>

          <p className="text-xs text-gray-400 text-center mt-2">
            Pay securely by card with Yoco, or message us on WhatsApp and we&apos;ll send your access code.
          </p>
        </div>
      </div>
    </main>
  )
}
