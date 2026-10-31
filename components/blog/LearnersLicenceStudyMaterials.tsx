import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'

/** FAQ shared by the rendered section and the FAQPage JSON-LD on the route. */
export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Why is South Africa's learners licence pass rate dropping?",
    a: "Reports attribute the drop largely to the move to computerised testing. Because questions and answer options are now drawn at random, applicants can no longer rely on memorising a fixed set of answers — they need to genuinely understand road signs, vehicle controls and the rules of the road. The Road Traffic Management Corporation reported a national pass rate of around 40%, though it noted that figure is not nationally representative, so it is best read as an early indicator.",
  },
  {
    q: 'How do I prepare for the computerised learners licence test?',
    a: "Study the three examined areas — rules of the road, road signs, and vehicle controls — and practise with computerised-style tests so the on-screen format feels familiar. Focus on understanding why each answer is correct rather than memorising answers, and keep practising a variety of questions until you are consistently scoring well above the pass mark.",
  },
  {
    q: 'Where can I find free learners licence study materials?',
    a: "SK Driving offers free learners licence practice tests and study materials online, covering road signs, rules of the road and vehicle controls. You can start practising for free at skdriving.co.za/courses and work through the questions as often as you like.",
  },
  {
    q: 'Can I practise learners licence test questions online?',
    a: "Yes. SK Driving's practice tests run in your browser on a phone or computer, so you can rehearse the question-and-answer format anywhere. Practising online helps you get comfortable reading questions on a screen, which is how the official test is now written.",
  },
  {
    q: 'How many times should I practise before writing my learners licence test?',
    a: "There is no fixed number — practise until you can repeatedly pass different sets of questions comfortably, not just once. Because the real test draws questions at random, the goal is consistent understanding across the whole syllabus rather than a single good score.",
  },
  {
    q: 'Does SK Driving offer free learners licence practice tests?',
    a: 'Yes. You can try SK Driving practice tests for free before deciding to unlock full access. The free tests let you sample the format and check which areas you still need to study.',
  },
  {
    q: 'What is the difference between Code 8, Code 10 and Code 14 learners licences?',
    a: "In broad terms, Code 8 covers light motor vehicles such as cars, Code 10 covers heavier vehicles, and Code 14 covers extra-heavy vehicles and combinations. The learner's licence theory covers the same core areas — rules of the road, signs and controls — and SK Driving provides study materials and practice tests aimed at the relevant code.",
  },
]

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium underline underline-offset-2 hover:text-brand-700">
      {children}
    </a>
  )
}

export default function LearnersLicenceStudyMaterials({ post }: { post: BlogPost }) {
  const published = new Date(post.datePublished).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <article className="bg-white">
      {/* Hero */}
      <header className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-brand-200 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-1.5" aria-hidden="true">/</span>
            <Link href="/blog" className="hover:text-white">Blog</Link>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Learners Licence Study Materials: How to Prepare for South Africa&apos;s Computerised K53 Test
          </h1>
          <p className="mt-3 text-sm text-brand-100">
            SK Driving · {published} · {post.readMinutes} min read
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Featured image */}
        <figure className="mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageSvg}
            alt={post.imageAlt}
            width={1200}
            height={630}
            className="w-full rounded-2xl border border-gray-100 shadow-card"
          />
        </figure>

        <div className="space-y-5 text-[17px] leading-relaxed text-gray-700">
          {/* Intro — primary keyword in the first 100 words */}
          <p>
            Finding the right <strong>learners licence study materials</strong> has never mattered more. Across South Africa,
            more people are leaving testing centres having failed the learners licence test — and the switch to the
            computerised K53 examination is a big part of the reason. Passing used to be something many applicants did by
            memorising a familiar set of questions. Today, with questions drawn at random on a screen, a proper
            <em> learners licence study</em> routine is what separates those who pass from those who have to book, pay and
            queue all over again.
          </p>
          <p>
            The good news: the test has not become unfair, only more honest. It now rewards learners who genuinely
            understand road signs, vehicle controls and the rules of the road. This guide explains what is happening to
            pass rates, why so many people are struggling, and how to prepare smarter with
            <strong> learners licence practice tests</strong> that mirror the computerised format.
          </p>

          {/* Stats */}
          <h2 className="text-2xl font-extrabold text-gray-900 pt-4">What the numbers say about the K53 learners licence test in South Africa</h2>
          <p>
            According to the SABC, the Road Traffic Management Corporation (RTMC) reported that the national learner&apos;s
            licence pass rate had fallen to around <strong>40%</strong>, down from roughly 68% before computerised testing
            was introduced (<SourceLink href="https://www.sabcnews.com/sabcnews/learner-drivers-test-pass-rate-drops-to-40-rtmc/">SABC News</SourceLink>).
            It is important to read that figure carefully: the RTMC has qualified the 40% as <strong>not nationally
            representative</strong>, so it is best treated as an early indicator rather than a settled national statistic
            (<SourceLink href="https://www.citizen.co.za/news/why-learners-licence-pass-rates-are-plunging/">The Citizen</SourceLink>).
          </p>
          <p>
            The computerised system was rolled out to reduce examination fraud and corruption at licensing centres
            (<SourceLink href="https://www.sanews.gov.za/south-africa/computerised-testing-reduces-corruption-licensing-centres">SAnews</SourceLink>).
            Because the questions and answer options are now randomly selected, applicants must understand the material
            rather than recall a fixed answer sheet — which is exactly what the reform set out to achieve.
          </p>
          <p>
            Provincial data points in a similar direction. In a parliamentary reply, the Western Cape government reported a
            <strong> 17% pass rate at its computerised testing centres</strong> during the 2025/26 financial year
            (<SourceLink href="https://www.wcpp.gov.za/?q=node%2F21054">Western Cape Provincial Parliament</SourceLink>).
            This computerised-test figure should not be confused with the province&apos;s overall learner&apos;s licence pass
            rate, which includes other testing populations — the two measure different groups and are not a direct
            comparison.
          </p>
          <div className="rounded-xl bg-brand-50 border border-brand-100 px-5 py-4 text-sm text-brand-900">
            <strong>In short:</strong> the reported numbers come from different sources and populations, but the message for
            applicants is consistent — the computerised test rewards real understanding, and preparation matters more than
            ever.
          </div>

          {/* Why failing */}
          <h2 className="text-2xl font-extrabold text-gray-900 pt-4">Why Are So Many South Africans Failing Their Learners Licence Tests?</h2>
          <p>Several factors come up again and again for people who do not pass first time:</p>
          <ul className="space-y-2.5 list-none pl-0">
            {[
              ['Memorising instead of understanding', 'Learning a fixed set of answers no longer works when questions and options appear at random — you have to understand the underlying K53 principles.'],
              ['Struggling with road signs and regulations', 'Interpreting road signs and traffic rules correctly, especially where several signs look similar, trips up many applicants.'],
              ['Limited access to good study materials', 'Without quality learners licence study materials, people study the wrong things or miss whole sections of the syllabus.'],
              ['Little exposure to computerised practice', 'Answering on a screen feels different from a paper booklet; applicants who have never practised that way lose easy marks to unfamiliarity.'],
              ['Weak preparation across all three sections', 'The test covers vehicle controls, rules of the road and road signs — neglecting any one section puts a pass at risk.'],
              ['Random questions under exam pressure', 'Facing unfamiliar, randomly selected questions under timed conditions is harder than reviewing a predictable set at home.'],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <span><strong className="text-gray-900">{t}.</strong> {d}</span>
              </li>
            ))}
          </ul>
          <p>
            The common thread is simple: successful preparation takes consistent study and practice across many different
            questions, so that whatever the computer selects on the day, you have seen something like it before and know
            <em> why</em> the right answer is right.
          </p>

          {/* SK Driving solution */}
          <h2 className="text-2xl font-extrabold text-gray-900 pt-4">Prepare Smarter with SK Driving&apos;s Computerised Practice Tests</h2>
          <p>
            <Link href="/courses" className="text-brand-600 font-semibold underline underline-offset-2 hover:text-brand-700">SK Driving</Link>{' '}
            is a digital learners licence preparation platform built for South Africans getting ready for the K53
            examination. SK Driving reports that it has helped <strong>more than 5,000 people</strong> prepare for and pass
            their learners licence examinations through its computerised practice tests. That is a milestone reported by SK
            Driving — not an independently audited figure, and no preparation tool can guarantee that every user will pass —
            but it reflects how many learners have used the platform to get ready.
          </p>
          <ul className="space-y-2.5 list-none pl-0">
            {[
              'Practise with computerised tests designed to build familiarity with the on-screen examination format.',
              'Access learners licence study materials covering the full syllabus.',
              'Practise road signs and the rules of the road until they become second nature.',
              'Improve your understanding of how K53 examination questions are framed.',
              'Identify knowledge gaps through repeated practice and focus your study where it counts.',
              'Prepare for Code 8, Code 10 and Code 14 learners licence study materials where applicable.',
            ].map(item => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 text-green-600 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            Crucially, SK Driving encourages learners to <strong>understand the answers, not just memorise them</strong>.
            That is the single biggest shift the computerised test demands — and the habit that carries through to safer
            driving long after the test is passed.
          </p>

          {/* CTA 1 */}
          <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white px-6 py-8 text-center my-8">
            <h2 className="text-2xl font-extrabold">Don&apos;t Just Hope to Pass. Prepare to Pass!</h2>
            <p className="mt-3 text-brand-100 max-w-xl mx-auto">
              With South Africa&apos;s computerised learners licence examination becoming increasingly challenging,
              preparation matters more than ever. Join thousands of learners who have used SK Driving&apos;s computerised
              practice tests to prepare. Start practising today — explore the study materials, test your knowledge and
              find the areas you need to improve. You can start by trying our free practice tests.
            </p>
            <Link
              href="/courses"
              className="btn-primary inline-flex items-center justify-center mt-6 px-7 py-3.5 text-base !bg-accent-400 !text-brand-900 hover:!bg-accent-500"
            >
              TRY FREE LEARNERS LICENCE TESTS
            </Link>
          </div>

          {/* Video */}
          <h2 className="text-2xl font-extrabold text-gray-900 pt-2">Watch: Understanding South Africa&apos;s New Learners Licence Testing Challenge</h2>
          <p>
            This short video explains how the learners licence testing environment has changed and why understanding the
            rules — rather than memorising answers — is now the key to passing. Give it a watch before you start studying.
          </p>
          <div className="mx-auto w-full max-w-[320px]">
            <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 shadow-card" style={{ aspectRatio: '9 / 16' }}>
              <iframe
                src="https://www.youtube.com/embed/JA8m3WA9pKI"
                title="Understanding South Africa's new learners licence testing challenge"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>

          {/* Study materials section (primary keyword H2) */}
          <h2 className="text-2xl font-extrabold text-gray-900 pt-4">Learners licence study materials that match the real test format</h2>
          <p>
            The best preparation combines reading with doing. Alongside practice tests, SK Driving provides supporting
            learners licence study materials you can work through at your own pace:
          </p>
          <ul className="space-y-2.5 list-none pl-0">
            <li className="flex gap-3"><span aria-hidden="true" className="mt-0.5 text-green-600 font-bold">✓</span>
              <span>The <Link href="/k53-learners-study-guide" className="text-brand-600 font-semibold underline underline-offset-2 hover:text-brand-700">K53 learners study guide</Link> for a clear overview of what to learn.</span></li>
            <li className="flex gap-3"><span aria-hidden="true" className="mt-0.5 text-green-600 font-bold">✓</span>
              <span><Link href="/live-notes" className="text-brand-600 font-semibold underline underline-offset-2 hover:text-brand-700">Live Notes</Link> covering road signs and the rules of the road in plain language.</span></li>
            <li className="flex gap-3"><span aria-hidden="true" className="mt-0.5 text-green-600 font-bold">✓</span>
              <span>Free <Link href="/courses" className="text-brand-600 font-semibold underline underline-offset-2 hover:text-brand-700">practice tests</Link> for Code 8, Code 10 and Code 14 learners.</span></li>
          </ul>

          {/* FAQ */}
          <h2 className="text-2xl font-extrabold text-gray-900 pt-4">Frequently asked questions</h2>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none font-bold text-gray-900 flex items-center justify-between gap-3">
                  {q}
                  <span aria-hidden="true" className="text-brand-500 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-2 text-[15px] text-gray-600 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>

          {/* Smaller CTA near the end */}
          <div className="rounded-xl border-2 border-brand-200 bg-brand-50 px-5 py-5 text-center my-6">
            <p className="font-bold text-brand-900">Ready to start? Try the practice tests free.</p>
            <Link href="/courses" className="btn-primary inline-flex items-center justify-center mt-3 px-6 py-3 text-sm">
              TRY FREE LEARNERS LICENCE TESTS
            </Link>
          </div>

          {/* Related */}
          <h2 className="text-2xl font-extrabold text-gray-900 pt-2">Keep preparing</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Free practice tests', 'Code 8, 10 & 14 learners tests', '/courses'],
              ['K53 study guide', 'What to learn, in order', '/k53-learners-study-guide'],
              ['Live Notes', 'Road signs & rules of the road', '/live-notes'],
              ['Find a testing centre', 'Where to write near you', '/centers'],
            ].map(([t, d, href]) => (
              <Link key={href} href={href} className="card-elevated block px-5 py-4">
                <span className="block font-bold text-gray-900">{t}</span>
                <span className="block text-sm text-gray-500 mt-0.5">{d}</span>
              </Link>
            ))}
          </div>

          <p className="text-xs text-gray-400 pt-4">
            Statistics referenced above are drawn from the sources linked in the article and reflect figures reported at
            the time of writing. SK Driving&apos;s practice tests are a study aid and do not reproduce the exact official
            examination.
          </p>
        </div>
      </div>
    </article>
  )
}
