import Link from 'next/link'
import BookSlideshow from '@/components/BookSlideshow'

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-blue-700 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
          Pass Your K53 First Time
        </h1>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Interactive practice tests for your South African learner&apos;s licence.
          Road signs, vehicle controls, and rules of the road — all in one place.
        </p>
        <Link
          href="/courses"
          className="bg-white text-blue-700 font-bold px-10 py-4 rounded-full text-lg hover:bg-blue-50 transition-colors shadow-md inline-block"
        >
          Start Practising →
        </Link>
      </section>

      {/* Feature cards */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">🚦</div>
            <h3 className="font-bold text-lg mb-2">Road Signs</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              All K53 road signs with real images. Learn regulatory, warning, and informatory signs.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">🚗</div>
            <h3 className="font-bold text-lg mb-2">Vehicle Controls</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Identify every control in your vehicle with diagram-based questions.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-bold text-lg mb-2">Rules of the Road</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Master South African traffic laws, speed limits, right of way, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Study Materials — Book Slideshow */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Free Study Material</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2 mb-2">Code 10 Memo — Part 1</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Flip through all 122 study slides. Use the arrows or your keyboard to navigate.
            </p>
          </div>
          <BookSlideshow />
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-blue-50 border-t border-blue-100 py-12 px-6 text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-3">Ready to test your knowledge?</h2>
        <p className="text-blue-700 mb-6">You need 75% to pass. Let&apos;s see how you do.</p>
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
