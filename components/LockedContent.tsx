/**
 * LockedContent — premium gate shown when a free visitor hits paid-only
 * content (Resources, Videos, Live Notes). Directs them to WhatsApp to buy
 * access, or to redeem a code they already have.
 */
import Link from 'next/link'
import { WHATSAPP_URL, ACCESS_PRICE, ACCESS_DURATION_DAYS } from '@/lib/contact'

export default function LockedContent({
  feature,
  description,
}: {
  feature: string
  description: string
}) {
  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{feature} is for full-access members</h1>
        <p className="text-sm text-gray-500 mb-6">{description}</p>

        <ul className="text-left text-sm text-gray-600 space-y-2 mb-7 max-w-xs mx-auto">
          <li className="flex gap-2"><span className="text-green-600">✓</span> Unlimited timed practice tests</li>
          <li className="flex gap-2"><span className="text-green-600">✓</span> Full Live Notes, resources &amp; videos</li>
          <li className="flex gap-2"><span className="text-green-600">✓</span> {ACCESS_PRICE} · {ACCESS_DURATION_DAYS} days full access</li>
        </ul>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.47 14.38c-.3-.15-1.74-.86-2-.95-.27-.1-.47-.15-.66.15-.2.3-.77.95-.94 1.15-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.57-.48-.5-.66-.5l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.74-.71 1.98-1.4.24-.68.24-1.27.17-1.4-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.5 9.5 0 01-4.84-1.33l-.35-.2-3.6.94.96-3.5-.23-.36a9.46 9.46 0 01-1.45-5.05c0-5.24 4.27-9.5 9.52-9.5 2.54 0 4.93.99 6.73 2.79a9.45 9.45 0 012.79 6.72c0 5.24-4.27 9.5-9.52 9.5zm5.55-15.05A11.43 11.43 0 0012.05 3C5.8 3 .72 8.08.72 14.33c0 2 .53 3.96 1.53 5.69L.64 26l6.13-1.61a11.4 11.4 0 005.28 1.34h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01z"/>
          </svg>
          Get access on WhatsApp · {ACCESS_PRICE}
        </a>

        <Link
          href="/redeem"
          className="block w-full text-blue-700 font-semibold py-3 mt-2 hover:underline text-sm"
        >
          I already have an access code
        </Link>
      </div>
    </main>
  )
}
