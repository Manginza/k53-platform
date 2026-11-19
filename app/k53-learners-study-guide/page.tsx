import type { Metadata } from 'next'
import Link from 'next/link'
import { GUIDES } from '@/lib/guides'

const BASE_URL = 'https://www.skdriving.co.za'
const PAGE_URL = `${BASE_URL}/k53-learners-study-guide`

export const metadata: Metadata = {
  title: "Free K53 Learners Study Guide South Africa",
  description:
    "Free K53 learner's licence study guide: what each test section covers, how to study for your code, a free PDF summary and practice tests.",
  keywords: [
    'free K53 learners study guide',
    'K53 learners book PDF download',
    'K53 study material South Africa',
    'learners licence pass marks',
    'Code 1 Code 2 Code 3 learners licence',
    'Code 8 Code 10 Code 14 learners test',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'article',
    url: PAGE_URL,
    title: 'Free K53 Learners Study Guide for South Africa',
    description:
      "Study the three K53 test sections, see how the test is marked, then download SK Driving's free original PDF summary and practise.",
  },
  twitter: {
    card: 'summary',
    title: 'Free K53 Learners Study Guide for South Africa',
    description: 'What to study for each K53 section, a free PDF summary and practice tests from SK Driving.',
  },
}

const faqs = [
  {
    question: "Where can I get free K53 learner's licence study material in South Africa?",
    answer:
      "SK Driving provides this free online K53 study guide, an original downloadable summary PDF and interactive practice tests covering Rules of the Road, Road Traffic Signs and Vehicle Controls.",
  },
  {
    question: "What are the pass marks for the K53 learner's licence test?",
    answer:
      'You must get at least 22 out of 28 for Rules of the Road, 23 out of 28 for Road Traffic Signs and 6 out of 8 for Vehicle Controls. You must pass all three sections.',
  },
  {
    question: "How many questions are in the K53 learner's licence test?",
    answer:
      "The approved South African learner's licence test has 64 questions: 28 on Rules of the Road, 28 on Road Traffic Signs and 8 on Vehicle Controls.",
  },
  {
    question: "How long is a South African learner's licence valid?",
    answer:
      "A South African learner's licence is valid for 24 months from the day you pass the test, and it cannot be extended.",
  },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'K53 Learners Study Guide', item: PAGE_URL },
  ],
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Free K53 Learners Study Guide for South Africa',
  url: PAGE_URL,
  description:
    "A free guide to studying for South Africa's K53 learner's licence test: the three sections, how they are marked and study resources.",
  inLanguage: 'en-ZA',
  dateModified: '2026-11-19',
  isPartOf: { '@type': 'WebSite', name: 'SK Driving', url: BASE_URL },
  publisher: { '@type': 'Organization', name: 'SK Driving', url: BASE_URL },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}

export default function K53StudyGuidePage() {
  return (
    <main className="bg-white text-gray-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className="bg-blue-700 px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-blue-100">
            <Link href="/" className="hover:text-white hover:underline">Home</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page">K53 study guide</span>
          </nav>
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-yellow-300">Free South African study material</p>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
            Free K53 Learners Study Guide for South Africa
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-blue-100">
            Learn what the three test sections cover and how they are marked. Then use the free PDF summary and
            exam-style practice tests to prepare.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/downloads/sk-driving-free-k53-learners-study-guide.pdf"
              download
              className="rounded-full bg-yellow-300 px-6 py-3 text-center font-bold text-blue-950 hover:bg-yellow-200"
            >
              Download the SK Driving Free K53 Learners Study Guide PDF
            </a>
            <Link href="/k53-questions-and-answers" className="rounded-full border-2 border-blue-300 px-6 py-3 text-center font-bold hover:bg-blue-600">
              Free K53 questions &amp; answers
            </Link>
            <Link href="/courses" className="rounded-full border-2 border-blue-300 px-6 py-3 text-center font-bold hover:bg-blue-600">
              Start free practice tests
            </Link>
          </div>
          <p className="mt-4 text-xs text-blue-200">
            Original SK Driving summary — not a copy of a commercial K53 book.
          </p>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <section aria-labelledby="test-sections" className="scroll-mt-20">
          <h2 id="test-sections" className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            What is tested in the K53 learner&apos;s licence test?
          </h2>
          <p className="mt-4 leading-7 text-gray-600">
            South Africa&apos;s approved learner&apos;s licence test covers three subjects. The test checks whether you
            understand traffic law, can recognise road traffic signs and know how to use a vehicle&apos;s controls.
          </p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            <li className="rounded-2xl border border-gray-200 p-5">
              <strong className="block text-gray-900">1. Rules of the Road</strong>
              <span className="mt-2 block text-sm leading-6 text-gray-600">Speed limits, right of way, stopping, overtaking and safe road use.</span>
            </li>
            <li className="rounded-2xl border border-gray-200 p-5">
              <strong className="block text-gray-900">2. Road Traffic Signs</strong>
              <span className="mt-2 block text-sm leading-6 text-gray-600">Regulatory, warning and guidance signs, signals and road markings.</span>
            </li>
            <li className="rounded-2xl border border-gray-200 p-5">
              <strong className="block text-gray-900">3. Vehicle Controls</strong>
              <span className="mt-2 block text-sm leading-6 text-gray-600">Pedals, steering, brakes, switches, instruments and warning lights.</span>
            </li>
          </ol>
        </section>

        <section aria-labelledby="pass-marks" className="mt-14 scroll-mt-20">
          <h2 id="pass-marks" className="text-2xl font-extrabold text-gray-900 sm:text-3xl">How the test is marked</h2>
          <p className="mt-4 leading-7 text-gray-600">
            The test has <strong>64 questions</strong>, and each section has its own minimum score: 22 out of 28 for Rules of
            the Road, 23 out of 28 for Road Traffic Signs and 6 out of 8 for Vehicle Controls. Failing one section means
            failing the test, so study all three. Road signs has the highest bar, so give it the most time.
          </p>
          <p className="mt-3 leading-7 text-gray-600">
            For the full breakdown, computerised testing and what happens if you fail, read{' '}
            <Link href={GUIDES.test.path} className="font-semibold text-blue-700 hover:underline">
              the learner&apos;s licence test: questions, pass mark and format
            </Link>.
          </p>
        </section>

        <section aria-labelledby="licence-codes" className="mt-14 scroll-mt-20">
          <h2 id="licence-codes" className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Study for the right code</h2>
          <p className="mt-4 leading-7 text-gray-600">
            Make sure you know which learner&apos;s licence category you are writing before you study. The official learner&apos;s categories are Code 1 (motorcycles), Code 2 (light motor vehicles)
            and Code 3 (heavier vehicles); &ldquo;Code 8&rdquo;, &ldquo;Code 10&rdquo; and &ldquo;Code 14&rdquo; are everyday
            names for driving licences. See{' '}
            <Link href={GUIDES.codes.path} className="font-semibold text-blue-700 hover:underline">learner&apos;s licence codes explained</Link>{' '}
            for ages and which code to book.
          </p>
        </section>

        <section aria-labelledby="booking" className="mt-14 scroll-mt-20">
          <h2 id="booking" className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Booking, fees and validity</h2>
          <p className="mt-4 leading-7 text-gray-600">
            You book through the official NaTIS portal in Gauteng, or at your DLTC elsewhere, and write the test in person.
            Once you pass, your learner&apos;s licence is valid for 24 months. These guides cover the details:
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[GUIDES.booking, GUIDES.cost, GUIDES.requirements, GUIDES.validity].map(g => (
              <li key={g.path}>
                <Link href={g.path} className="block rounded-xl border border-gray-200 p-4 hover:border-blue-400">
                  <span className="block font-bold text-blue-700">{g.label}</span>
                  <span className="mt-1 block text-sm text-gray-600">{g.teaser}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            <Link href="/centers" className="font-semibold text-blue-700 hover:underline">Find a learner&apos;s licence testing centre near you</Link>
          </p>
        </section>

        <section aria-labelledby="study-next" className="mt-14 rounded-3xl bg-blue-50 p-6 sm:p-8">
          <h2 id="study-next" className="text-2xl font-extrabold text-gray-900">Where to study next</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            <li><Link href="/k53-questions-and-answers" className="block rounded-xl bg-white p-4 font-bold text-blue-700 shadow-sm hover:underline">Free K53 questions and answers</Link></li>
            <li><Link href="/k53-questions-and-answers-pdf" className="block rounded-xl bg-white p-4 font-bold text-blue-700 shadow-sm hover:underline">Printable K53 questions and answers (PDF)</Link></li>
            <li><Link href="/courses" className="block rounded-xl bg-white p-4 font-bold text-blue-700 shadow-sm hover:underline">Take K53 practice tests online</Link></li>
            <li><Link href="/live-notes" className="block rounded-xl bg-white p-4 font-bold text-blue-700 shadow-sm hover:underline">Read K53 road signs and rules notes</Link></li>
            <li><Link href="/videos" className="block rounded-xl bg-white p-4 font-bold text-blue-700 shadow-sm hover:underline">Watch K53 study videos</Link></li>
            <li><Link href="/pricing" className="block rounded-xl bg-white p-4 font-bold text-blue-700 shadow-sm hover:underline">View SK Driving lesson and study packages</Link></li>
          </ul>
          <p className="mt-6 leading-7 text-gray-700">
            If you are ready to prepare with the complete platform, view our{' '}
            <Link href="/pricing" className="font-bold text-blue-700 hover:underline">SK Driving access packages</Link>.
          </p>
        </section>

        <section aria-labelledby="faq" className="mt-14">
          <h2 id="faq" className="text-2xl font-extrabold text-gray-900 sm:text-3xl">K53 study guide FAQs</h2>
          <dl className="mt-6 space-y-5">
            {faqs.map(({ question, answer }) => (
              <div key={question} className="rounded-2xl border border-gray-200 p-5">
                <dt className="font-bold text-gray-900">{question}</dt>
                <dd className="mt-2 leading-7 text-gray-600">{answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="sources" className="mt-14 border-t border-gray-200 pt-8">
          <h2 id="sources" className="text-lg font-bold text-gray-900">Official sources and review date</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">This guide was reviewed on 19 November 2026. Requirements can change, so confirm local fees and photo requirements with your DLTC.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
            <li><a href="https://www.gov.za/services/driving-licence/apply-learners-licence" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">South African Government: Apply for a learner&apos;s licence</a></li>
            <li><a href="https://www.natis.gov.za/media/com_natisdownloads/files/1_Rules_of_the_Road_v100_Jun_2012-20260713-173225.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Department of Transport: SA Learner Driver Manual — Rules of the Road</a></li>
            <li><a href="https://www.gov.za/sites/default/files/gcis_document/201409/28446b.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">National Road Traffic Regulations: learner&apos;s licence testing requirements</a></li>
          </ul>
        </section>
      </article>
    </main>
  )
}
