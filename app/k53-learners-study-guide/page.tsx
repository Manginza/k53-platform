import type { Metadata } from 'next'
import Link from 'next/link'

const BASE_URL = 'https://www.skdriving.co.za'
const PAGE_URL = `${BASE_URL}/k53-learners-study-guide`

export const metadata: Metadata = {
  title: "Free K53 Learners Study Guide South Africa",
  description:
    "Free South African K53 learner's licence study guide: official test sections and pass marks, Code 1, 2 and 3 age rules, booking checklist, PDF summary and online practice tests.",
  keywords: [
    'free K53 learners study guide',
    'K53 learners book PDF download',
    'K53 study material South Africa',
    'learners licence pass marks',
    'Code 1 Code 2 Code 3 learners licence',
    'Code 8 Code 10 Code 14 learners test',
    'how to book learners licence test',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'article',
    url: PAGE_URL,
    title: 'Free K53 Learners Study Guide for South Africa | SK Driving',
    description:
      "Study the K53 test sections, pass marks, licence categories and booking steps, then download SK Driving's free original PDF checklist.",
  },
  twitter: {
    card: 'summary',
    title: 'Free K53 Learners Study Guide for South Africa',
    description: 'Pass marks, categories, booking checklist, free PDF and practice tests from SK Driving.',
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
      "A South African learner's licence is valid for 24 months from its issue date and cannot be extended.",
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
    "A free guide to South Africa's K53 learner's licence test, including pass marks, licence categories, booking steps and study resources.",
  inLanguage: 'en-ZA',
  dateModified: '2026-07-16',
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
            Learn the three test sections, exact pass requirements, licence categories and booking steps.
            Then use the free PDF summary and exam-style practice tests to prepare.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/downloads/sk-driving-free-k53-learners-study-guide.pdf"
              download
              className="rounded-full bg-yellow-300 px-6 py-3 text-center font-bold text-blue-950 hover:bg-yellow-200"
            >
              Download the SK Driving Free K53 Learners Study Guide PDF
            </a>
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
          <h2 id="pass-marks" className="text-2xl font-extrabold text-gray-900 sm:text-3xl">K53 test questions and pass marks</h2>
          <p className="mt-4 leading-7 text-gray-600">
            The test contains <strong>64 questions</strong>. Each section has its own minimum score.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">South African learner&apos;s licence test questions and minimum pass scores</caption>
              <thead className="bg-blue-50 text-blue-950">
                <tr>
                  <th scope="col" className="px-5 py-4 font-bold">Test section</th>
                  <th scope="col" className="px-5 py-4 font-bold">Questions</th>
                  <th scope="col" className="px-5 py-4 font-bold">Minimum correct</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr><th scope="row" className="px-5 py-4 font-semibold text-gray-900">Rules of the Road</th><td className="px-5 py-4">28</td><td className="px-5 py-4 font-bold">22 out of 28</td></tr>
                <tr><th scope="row" className="px-5 py-4 font-semibold text-gray-900">Road Traffic Signs</th><td className="px-5 py-4">28</td><td className="px-5 py-4 font-bold">23 out of 28</td></tr>
                <tr><th scope="row" className="px-5 py-4 font-semibold text-gray-900">Vehicle Controls</th><td className="px-5 py-4">8</td><td className="px-5 py-4 font-bold">6 out of 8</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 rounded-xl border-l-4 border-yellow-400 bg-yellow-50 p-4 font-semibold text-gray-900">
            You must pass all three sections. Failing one section means failing the test.
          </p>
        </section>

        <section aria-labelledby="licence-codes" className="mt-14 scroll-mt-20">
          <h2 id="licence-codes" className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Code 1, Code 2 and Code 3 learner&apos;s licences</h2>
          <p className="mt-4 leading-7 text-gray-600">
            Choose the learner&apos;s licence category that matches the vehicle you plan to drive. Gross Vehicle Mass (GVM)
            means the vehicle&apos;s maximum permitted mass when fully loaded.
          </p>
          <ul className="mt-6 space-y-4">
            <li className="rounded-2xl bg-gray-50 p-5">
              <h3 className="font-bold text-gray-900">Code 1 — motorcycles</h3>
              <p className="mt-2 leading-7 text-gray-600">Minimum age 16 for a motorcycle of 125 cc or less, and 18 for a motorcycle over 125 cc.</p>
            </li>
            <li className="rounded-2xl bg-gray-50 p-5">
              <h3 className="font-bold text-gray-900">Code 2 — light motor vehicles</h3>
              <p className="mt-2 leading-7 text-gray-600">Minimum age 17. Covers a motor vehicle, minibus, bus or goods vehicle with a GVM not exceeding 3,500 kg.</p>
            </li>
            <li className="rounded-2xl bg-gray-50 p-5">
              <h3 className="font-bold text-gray-900">Code 3 — heavy motor vehicles</h3>
              <p className="mt-2 leading-7 text-gray-600">Minimum age 18. Covers motor vehicles with a GVM exceeding 3,500 kg.</p>
            </li>
          </ul>
          <p className="mt-5 text-sm leading-6 text-gray-600">
            <strong>About Code 8, Code 10 and Code 14:</strong> these are familiar market terms for driving licence
            classes. People often use them when searching for learner material. The official learner&apos;s licence categories
            shown during application are Code 1, Code 2 and Code 3, so confirm the correct category with your DLTC.
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            A learner&apos;s licence is valid for <strong>24 months</strong> and cannot be extended.
          </p>
        </section>

        <section aria-labelledby="booking" className="mt-14 scroll-mt-20">
          <h2 id="booking" className="text-2xl font-extrabold text-gray-900 sm:text-3xl">How to book your learner&apos;s licence test</h2>
          <ol className="mt-6 space-y-4 pl-5 text-gray-600 [counter-reset:step]">
            <li className="list-decimal pl-2 leading-7"><strong className="text-gray-900">Choose your category.</strong> Check that you meet the minimum age for Code 1, 2 or 3.</li>
            <li className="list-decimal pl-2 leading-7"><strong className="text-gray-900">Book with a DLTC.</strong> Gauteng residents should apply through the official eNaTIS online portal. In other areas, online availability varies, so confirm with your local Driving Licence Testing Centre.</li>
            <li className="list-decimal pl-2 leading-7"><strong className="text-gray-900">Prepare your documents.</strong> Take your ID, the required ID photographs, proof of postal and residential address, the booking fee and a completed LL1 application form. Confirm the number of photos with your DLTC.</li>
            <li className="list-decimal pl-2 leading-7"><strong className="text-gray-900">Complete the eye test.</strong> The DLTC can test your eyesight, or you may submit the required form completed by a qualified optometrist.</li>
            <li className="list-decimal pl-2 leading-7"><strong className="text-gray-900">Write the test.</strong> Bring your booking receipt and ID on the test date.</li>
            <li className="list-decimal pl-2 leading-7"><strong className="text-gray-900">Pay the issue fee after passing.</strong> Booking and issue fees vary by DLTC or municipality; contact the centre for the current amount.</li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="https://online.natis.gov.za/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">Open the official eNaTIS portal</a>
            <span aria-hidden="true" className="text-gray-300">•</span>
            <Link href="/centers" className="font-semibold text-blue-700 hover:underline">Find a learner&apos;s licence testing centre near you</Link>
          </div>
        </section>

        <section aria-labelledby="study-next" className="mt-14 rounded-3xl bg-blue-50 p-6 sm:p-8">
          <h2 id="study-next" className="text-2xl font-extrabold text-gray-900">Where to study next</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
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
          <p className="mt-3 text-sm leading-6 text-gray-600">This guide was reviewed on 16 July 2026. Requirements can change, so confirm local fees and photo requirements with your DLTC.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
            <li><a href="https://www.gov.za/services/driving-licence/apply-learners-licence" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">South African Government: Apply for a learner&apos;s licence</a></li>
            <li><a href="https://www.natis.gov.za/images/learners/1_Rules_of_the_Road_v100_Jun_2012.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Department of Transport: SA Learner Driver Manual — Rules of the Road</a></li>
            <li><a href="https://www.gov.za/sites/default/files/gcis_document/201409/28446b.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">National Road Traffic Regulations: learner&apos;s licence testing requirements</a></li>
          </ul>
        </section>
      </article>
    </main>
  )
}
