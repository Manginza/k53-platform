import type { Metadata } from 'next'
import Link from 'next/link'
import BookSlideshow from '@/components/BookSlideshow'
import BuyAccessButton from '@/components/BuyAccessButton'
import { hasFullAccess } from '@/lib/access'
import { WHATSAPP_URL, ACCESS_PRICE, ACCESS_PRICE_ORIGINAL, ACCESS_DURATION_DAYS } from '@/lib/contact'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Free K53 Learner's Licence Practice Tests South Africa | SK Driving",
  description: "Study for your South African learner's licence with free K53 practice tests. Covers road signs, vehicle controls, and rules of the road for Code 8, Code 10 and Code 14. Pass first time.",
  keywords: [
    "learners licence test South Africa", "K53 practice test", "free learners licence test",
    "K53 questions and answers", "learners licence road signs", "learners licence rules of the road",
    "Code 8 learners licence", "Code 10 learners licence", "how to pass learners licence",
    "learners licence study guide South Africa", "K53 learner driver manual",
    "learners test questions South Africa", "learners licence test online free",
  ],
  alternates: { canonical: 'https://www.skdriving.co.za' },
  openGraph: {
    title: "Free K53 Learner's Licence Practice Tests | SK Driving",
    description: "Pass your South African learner's licence first time. Free K53 practice tests for Code 8, Code 10 and Code 14 — road signs, vehicle controls, rules of the road.",
    url: 'https://www.skdriving.co.za',
  },
}

// JSON-LD structured data
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: "SK Driving — K53 Learner's Licence Practice Tests",
  url: 'https://www.skdriving.co.za',
  description: "Free K53 learner's licence practice tests for South Africa. Road signs, vehicle controls and rules of the road for Code 8, Code 10 and Code 14.",
  inLanguage: 'en-ZA',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.skdriving.co.za/centers?province={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: "K53 Learner's Licence Practice Tests",
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  url: 'https://www.skdriving.co.za/courses',
  description: "Interactive K53 practice tests for the South African learner's licence — road signs, vehicle controls, rules of the road.",
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'ZAR',
    description: "Free learner's licence practice tests",
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "How many questions are on the South African learner's licence test?",
      acceptedAnswer: { '@type': 'Answer', text: 'The K53 learner\'s licence test has 64 questions divided into three sections: Road signs (28 questions, pass mark 23), Rules of the road (28 questions, pass mark 22), and Vehicle controls (8 questions, pass mark 6). You must pass all three sections to pass the test.' },
    },
    {
      '@type': 'Question',
      name: "What mark do you need to pass the learner's licence test?",
      acceptedAnswer: { '@type': 'Answer', text: 'You need to pass all three sections of the K53 test: at least 23/28 (82%) for road signs, at least 22/28 (79%) for rules of the road, and at least 6/8 (75%) for vehicle controls. Failing even one section means you fail the entire test.' },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between a Code 8 and Code 10 learner\'s licence?',
      acceptedAnswer: { '@type': 'Answer', text: 'A Code 8 (B) licence covers light motor vehicles up to 3,500 kg GVM — cars, minibuses, and light bakkies. A Code 10 (C1) licence covers medium heavy vehicles between 3,500 kg and 16,000 kg GVM, such as trucks and large buses. Code 10 holders can also legally drive Code 8 vehicles.' },
    },
    {
      '@type': 'Question',
      name: "How do I book a learner's licence test in South Africa?",
      acceptedAnswer: { '@type': 'Answer', text: 'Book online via the eNaTIS portal at https://online.natis.gov.za. In Gauteng and the Eastern Cape, online booking is available. In other provinces, visit your nearest DLTC (Driving Licence Testing Centre) to book in person. You must confirm your booking at the DLTC within 3 business days and pay the booking fee.' },
    },
    {
      '@type': 'Question',
      name: "What documents do I need for the learner's licence test?",
      acceptedAnswer: { '@type': 'Answer', text: 'You need: your original green barcoded ID book or Smart ID card (plus 2 certified copies), 2–4 recent ID-sized photographs, proof of residential address not older than 3 months, and a completed Form LL1. If you booked online, also bring your printed eNaTIS booking confirmation.' },
    },
    {
      '@type': 'Question',
      name: "Can I practise for the K53 learner's licence test online?",
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. SK Driving offers free K53 practice tests online covering all three sections — road signs, rules of the road, and vehicle controls. Practising regularly with timed tests is the best way to prepare and pass first time.' },
    },
    {
      '@type': 'Question',
      name: "How many times can I fail the learner's licence test?",
      acceptedAnswer: { '@type': 'Answer', text: "There is no legal limit on how many times you can attempt the learner's licence test in South Africa. However, you must book and pay the test fee each time you attempt it. Most candidates who practise with K53 test questions beforehand pass within one or two attempts." },
    },
  ],
}

export default async function Home() {
  const fullAccess = await hasFullAccess()
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* Hero */}
      <section className="bg-blue-700 text-white py-14 sm:py-20 px-4 sm:px-6 text-center">
        <span className="inline-flex items-center gap-2 bg-yellow-300 text-blue-900 text-xs sm:text-sm font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 shadow-sm">
          <span aria-hidden="true">⭐</span> 90% Learner Pass Rate
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
          Prepare to Pass Your K53 the First Time
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
          Get ready for your South African learner&apos;s licence with exam-style practice tests
          covering road signs, vehicle controls and rules of the road.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/courses"
            className="bg-white text-blue-700 font-bold px-8 py-4 rounded-full text-base hover:bg-blue-50 transition-colors shadow-md inline-block"
          >
            Start Practising →
          </Link>
          <Link
            href="/pricing"
            className="bg-blue-600 border-2 border-blue-400 text-white font-bold px-8 py-4 rounded-full text-base hover:bg-blue-500 transition-colors inline-block"
          >
            Get Full Access — {ACCESS_PRICE}
          </Link>
        </div>
        {/* Trust strip */}
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-blue-100">
          <li className="flex items-center gap-1.5"><span className="text-green-300">✓</span> 90% pass rate</li>
          <li className="flex items-center gap-1.5"><span className="text-green-300">✓</span> 350+ practice questions</li>
          <li className="flex items-center gap-1.5"><span className="text-green-300">✓</span> Code 8, 10 &amp; 14</li>
          <li className="flex items-center gap-1.5"><span className="text-green-300">✓</span> Two months&apos; access</li>
        </ul>
      </section>

      {/* Feature cards */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🚦</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Road Signs</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Learn South African road signs through clear images and exam-style questions.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🚗</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Vehicle Controls</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Identify vehicle controls and understand their correct functions.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📋</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Rules of the Road</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Master speed limits, stopping rules, right of way and South African traffic laws.
            </p>
          </div>
        </div>
      </section>

      {/* Social proof / testimonials — real quotes go into TESTIMONIALS below */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            Join Learners Who Are Passing
          </h2>
          <p className="text-gray-600 text-base leading-relaxed max-w-xl mx-auto">
            Our learners achieve a <strong className="text-blue-700">90% pass rate</strong> after
            preparing with SK Driving&apos;s lessons and practice tests.
          </p>
          <p className="text-xs text-gray-400 mt-3 max-w-md mx-auto italic">
            Pass rate based on results reported by learners who completed the course and shared their test outcomes.
          </p>

          <div className="mt-8">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-green-700 transition-colors"
            >
              💬 Share your success story on WhatsApp
            </a>
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

      {/* Pricing CTA */}
      <section className="bg-blue-50 border-t border-blue-100 py-12 sm:py-14 px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
          Everything You Need to Prepare for Only {ACCESS_PRICE}
        </h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Get two months of access to lessons, practice tests, road signs, vehicle controls
          and rules of the road.
        </p>
        <Link
          href="/pricing"
          className="inline-block bg-blue-700 text-white font-bold px-8 py-4 rounded-full text-base hover:bg-blue-800 transition-colors shadow-sm"
        >
          Get Full Access for {ACCESS_PRICE} →
        </Link>
      </section>

      {/* FAQ — visible content + JSON-LD FAQPage rich result */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Learner&apos;s Licence — Frequently Asked Questions
        </h2>
        <div className="space-y-5">
          {[
            {
              q: "How many questions are on the South African learner's licence test?",
              a: "The K53 test has 64 questions in three sections: Road signs (28 questions, pass mark 23), Rules of the road (28 questions, pass mark 22), and Vehicle controls (8 questions, pass mark 6). You must pass all three sections.",
            },
            {
              q: "What mark do you need to pass the learner's licence test?",
              a: "You need 23/28 (82%) for road signs, 22/28 (79%) for rules of the road, and 6/8 (75%) for vehicle controls. Failing any one section means you fail the entire test.",
            },
            {
              q: "What is the difference between a Code 8 and Code 10 learner's licence?",
              a: "Code 8 (B) covers light vehicles up to 3,500 kg — cars, minibuses, and light bakkies. Code 10 (C1) covers medium heavy vehicles from 3,500 kg to 16,000 kg such as trucks and large buses. A Code 10 holder can also legally drive Code 8 vehicles.",
            },
            {
              q: "How do I book a learner's licence test in South Africa?",
              a: "Book via the eNaTIS portal (online.natis.gov.za). Online booking is available in Gauteng and the Eastern Cape. In other provinces, visit your nearest DLTC to book in person. Confirm and pay within 3 business days of booking.",
            },
            {
              q: "What documents do I need for the learner's licence test?",
              a: "You need your original ID book or Smart ID card (plus 2 certified copies), 2–4 recent ID-sized photos, proof of address not older than 3 months, and a completed Form LL1. If booked online, bring your printed eNaTIS confirmation slip.",
            },
            {
              q: "Can I practise for the K53 learner's licence test online?",
              a: "Yes — SK Driving offers free K53 practice tests online covering all three sections. Practising with timed tests regularly is the best way to prepare and pass first time.",
            },
            {
              q: "How many times can I fail the learner's licence test?",
              a: "There is no legal limit on attempts. You must rebook and pay the fee each time. Most candidates who practise with K53 test questions beforehand pass within one or two attempts.",
            },
          ].map(({ q, a }) => (
            <details key={q} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 group">
              <summary className="font-semibold text-gray-900 text-sm sm:text-base cursor-pointer list-none flex items-center justify-between gap-3">
                {q}
                <span className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/courses" className="inline-block bg-blue-700 text-white font-bold px-8 py-4 rounded-full hover:bg-blue-800 transition-colors">
            Start Free Practice Tests →
          </Link>
        </div>
      </section>
    </main>
  )
}
