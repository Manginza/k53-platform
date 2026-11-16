import type { Metadata } from 'next'
import Link from 'next/link'
import SampleQuestionList from '@/components/questions/SampleQuestionList'
import {
  FULL_TEST_URL, QUESTIONS_PATH, QUESTIONS_PDF_PATH, SAMPLE_QUESTION_COUNT, SAMPLE_SECTIONS,
  questionsFaqSchema,
} from '@/lib/k53-sample-questions'
import { absoluteUrl, breadcrumbSchema, canonical, jsonLd } from '@/lib/site'

// Built from repo data only: fully static, no database call.
export const dynamic = 'force-static'

const TITLE = 'K53 Learners Test Questions and Answers (Free Practice)'
const DESCRIPTION = `${SAMPLE_QUESTION_COUNT} free K53 learner's licence practice questions with answers and explanations: vehicle controls, road signs and rules of the road.`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'K53 questions and answers', 'learners licence questions and answers', 'K53 learners test questions',
    'learners licence test questions South Africa', 'K53 road signs questions', 'K53 vehicle controls questions',
    'rules of the road questions', 'free learners test practice',
  ],
  alternates: canonical(QUESTIONS_PATH),
  openGraph: { title: TITLE, description: DESCRIPTION, url: QUESTIONS_PATH, type: 'article' },
}

export default function K53QuestionsPage() {
  let n = 1
  const starts = SAMPLE_SECTIONS.map(s => { const start = n; n += s.questions.length; return start })

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(questionsFaqSchema(absoluteUrl(QUESTIONS_PATH))) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'K53 questions and answers', path: QUESTIONS_PATH },
        ])) }}
      />

      <section className="bg-gradient-to-br from-brand-800 to-brand-700 text-white py-12 sm:py-16">
        <div className="section-container max-w-3xl text-center">
          <span className="inline-block text-xs font-bold text-accent-400 uppercase tracking-widest mb-3">Free · No login needed</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">K53 Learners Test Questions and Answers</h1>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
            {SAMPLE_QUESTION_COUNT} free practice questions with the correct answer and a short reason for each. They cover
            the three sections of the K53 learner&apos;s licence test: vehicle controls, road signs and rules of the road.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={QUESTIONS_PDF_PATH} className="bg-white text-brand-700 font-bold px-6 py-3 rounded-full text-sm hover:bg-blue-50">
              Printable version / Save as PDF
            </Link>
            <Link href={FULL_TEST_URL} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-full text-sm">
              Take the full timed test
            </Link>
          </div>
        </div>
      </section>

      <div className="section-container max-w-3xl py-10 sm:py-14">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900 leading-relaxed">
          <strong>Please note:</strong> these are practice questions based on the official K53 learner&apos;s manual and
          South African road traffic law, written in the same multiple-choice style as the test. They are not the
          official test questions. Learn <em>why</em> each answer is right and you will be ready for however the DLTC
          words the question.
        </div>

        <nav aria-label="Sections" className="mt-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Jump to a section</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {SAMPLE_SECTIONS.map(s => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block card-elevated p-4 hover:border-brand-400">
                  <span className="font-bold text-gray-900 text-sm">{s.title}</span>
                  <span className="block text-xs text-gray-500 mt-1">{s.questions.length} questions</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {SAMPLE_SECTIONS.map((section, i) => (
          <section key={section.id} id={section.id} className="mt-14 scroll-mt-24" aria-labelledby={`${section.id}-heading`}>
            <h2 id={`${section.id}-heading`} className="text-2xl font-extrabold text-gray-900">
              {section.title} questions
            </h2>
            <p className="text-sm text-gray-500 mt-1">{section.testFormat}</p>
            <p className="text-gray-600 mt-3 leading-relaxed">{section.intro}</p>

            <SampleQuestionList section={section} startNumber={starts[i]} />

            <div className="mt-6 rounded-2xl bg-brand-50 border border-brand-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="flex-1 text-sm text-brand-900">
                Ready for the real format? Practise under time pressure with full-length K53 tests, scored by section.
              </p>
              <Link href={FULL_TEST_URL} className="shrink-0 btn-primary px-6 py-3 text-sm text-center">
                Take the full timed test
              </Link>
            </div>
          </section>
        ))}

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-extrabold text-gray-900 mb-3">Keep studying</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={QUESTIONS_PDF_PATH} className="text-brand-700 font-semibold hover:underline">
                Print these questions or save them as a PDF
              </Link>
            </li>
            <li>
              <Link href="/k53-learners-study-guide" className="text-brand-700 font-semibold hover:underline">
                Free K53 learners study guide: test format, pass marks and booking checklist
              </Link>
            </li>
            <li>
              <Link href="/courses" className="text-brand-700 font-semibold hover:underline">
                Code 8 and Code 10 timed practice tests
              </Link>
            </li>
            <li>
              <Link href="/centers" className="text-brand-700 font-semibold hover:underline">
                Find your nearest learner&apos;s licence testing centre
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
