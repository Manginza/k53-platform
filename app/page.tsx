import Link from 'next/link'
import BookSlideshow from '@/components/BookSlideshow'
import BuyAccessButton from '@/components/BuyAccessButton'
import { hasFullAccess } from '@/lib/access'
import { WHATSAPP_URL, ACCESS_PRICE, ACCESS_PRICE_ORIGINAL, ACCESS_DURATION_DAYS } from '@/lib/contact'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const fullAccess = await hasFullAccess()
  return (
    <main>
      {/* Hero */}
      <section className="bg-blue-700 text-white py-14 sm:py-20 px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
          Pass Your K53 First Time
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
          Interactive practice tests for your South African learner&apos;s licence.
          Road signs, vehicle controls, and rules of the road — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/courses"
            className="bg-white text-blue-700 font-bold px-8 py-4 rounded-full text-base hover:bg-blue-50 transition-colors shadow-md inline-block"
          >
            Start Practising →
          </Link>
          <Link
            href="/live-notes"
            className="bg-blue-600 border-2 border-blue-400 text-white font-bold px-8 py-4 rounded-full text-base hover:bg-blue-500 transition-colors inline-block"
          >
            📖 Study the Manual
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🚦</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Road Signs</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              All K53 road signs with real images. Learn regulatory, warning, and informatory signs.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🚗</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Vehicle Controls</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Identify every control in your vehicle with diagram-based questions.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📋</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Rules of the Road</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Master South African traffic laws, speed limits, right of way, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Live Notes callout */}
      <section className="py-10 px-4 sm:px-6 bg-green-50 border-t border-b border-green-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
          <div className="text-4xl sm:text-5xl shrink-0">📗</div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-green-900 mb-1">Road Signs Manual — Live Notes</h2>
            <p className="text-green-700 text-sm leading-relaxed">
              Read all 56 pages of the SA Road Traffic Signs manual chapter by chapter, then test yourself with a quiz on each chapter.
            </p>
          </div>
          <Link
            href="/live-notes"
            className="shrink-0 bg-green-600 text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-green-700 transition-colors"
          >
            Start Reading →
          </Link>
        </div>
      </section>

      {/* Study Materials — Book Slideshow */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Study Material</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 mb-2">Code 10 Memo — Part 1</h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              {fullAccess
                ? 'Flip through all 122 study slides. Use the arrows or your keyboard to navigate.'
                : 'All 122 study slides are available with full access.'}
            </p>
          </div>

          {fullAccess ? (
            <BookSlideshow />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center max-w-md mx-auto">
              <div className="text-4xl mb-3">🔒</div>
              <p className="text-gray-600 mb-6">
                These 122 study slides are for full-access members. Unlock everything for{' '}
                <span className="line-through text-gray-400">{ACCESS_PRICE_ORIGINAL}</span>{' '}
                <strong className="text-blue-700">{ACCESS_PRICE}</strong>{' '}
                ({ACCESS_DURATION_DAYS} days).
              </p>

              <BuyAccessButton />

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
              <Link href="/login" className="block text-blue-700 font-semibold mt-3 hover:underline text-sm">
                Already have an account? Log in
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-blue-50 border-t border-blue-100 py-10 sm:py-12 px-4 sm:px-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3">Ready to test your knowledge?</h2>
        <p className="text-blue-700 mb-5 sm:mb-6 text-sm sm:text-base">You need 75% to pass. Let&apos;s see how you do.</p>
        <Link
          href="/courses"
          className="bg-blue-700 text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-800 transition-colors inline-block"
        >
          View Courses
        </Link>
      </section>
    </main>
  )
}
