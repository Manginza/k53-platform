import Link from 'next/link'
import BookSlideshow from '@/components/BookSlideshow'

export default function Home() {
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
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Free Study Material</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 mb-2">Code 10 Memo — Part 1</h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              Flip through all 122 study slides. Use the arrows or your keyboard to navigate.
            </p>
          </div>
          <BookSlideshow />
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
