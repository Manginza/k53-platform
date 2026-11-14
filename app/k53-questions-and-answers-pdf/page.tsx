import type { Metadata } from 'next'
import Link from 'next/link'
import PrintButton from '@/components/questions/PrintButton'
import SampleQuestionList from '@/components/questions/SampleQuestionList'
import {
  FULL_TEST_URL, QUESTIONS_PATH, QUESTIONS_PDF_PATH, SAMPLE_QUESTION_COUNT, SAMPLE_SECTIONS,
} from '@/lib/k53-sample-questions'
import { SITE_NAME, absoluteUrl, canonical } from '@/lib/site'

export const dynamic = 'force-static'

const TITLE = 'K53 Questions and Answers PDF (Printable)'
const DESCRIPTION = `Printable K53 learner's licence questions and answers: ${SAMPLE_QUESTION_COUNT} free practice questions with answers. Print it or save it as a PDF to study offline.`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['K53 questions and answers PDF', 'learners licence questions and answers PDF', 'K53 learners test PDF download'],
  alternates: canonical(QUESTIONS_PDF_PATH),
  openGraph: { title: TITLE, description: DESCRIPTION, url: QUESTIONS_PDF_PATH, type: 'article' },
}

// When printing, show only this page's content: hide the site header, footer,
// banners and popups (all siblings of <main> in the root layout).
const PRINT_CSS = `
@media print {
  body > :not(#print-root) { display: none !important; }
  body { background: #fff !important; }
  #print-root { padding: 0 !important; max-width: none !important; }
  .no-print { display: none !important; }
  @page { margin: 14mm; }
}
`

export default function K53QuestionsPdfPage() {
  let n = 1
  return (
    <main id="print-root" className="max-w-3xl mx-auto px-6 py-10 bg-white text-black">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="no-print mb-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <p className="text-sm text-gray-700">
          Use the button, then choose <strong>Save as PDF</strong> as the printer to keep a copy on your phone.
        </p>
        <PrintButton className="shrink-0 btn-primary px-5 py-2.5 text-sm" />
      </div>

      <header className="border-b-2 border-black pb-3 mb-6">
        <h1 className="text-2xl font-extrabold">K53 Learner&apos;s Licence Questions and Answers</h1>
        <p className="text-sm mt-1">
          {SAMPLE_QUESTION_COUNT} practice questions with answers · {SITE_NAME} · {absoluteUrl(QUESTIONS_PATH).replace('https://', '')}
        </p>
        <p className="text-xs mt-2 text-gray-700">
          Practice questions based on the official K53 learner&apos;s manual. These are not the official test questions.
          The correct answer is in bold.
        </p>
      </header>

      {SAMPLE_SECTIONS.map(section => {
        const start = n
        n += section.questions.length
        return (
          <section key={section.id} className="mb-8">
            <h2 className="text-lg font-extrabold border-b border-gray-400 pb-1 mb-1">{section.title}</h2>
            <p className="text-xs text-gray-700 mb-3">{section.testFormat}</p>
            <SampleQuestionList section={section} startNumber={start} variant="print" />
            <p className="mt-4 text-sm">
              <strong>Take the full timed test:</strong>{' '}
              <Link href={FULL_TEST_URL} className="underline">{absoluteUrl(FULL_TEST_URL).replace('https://', '')}</Link>
            </p>
          </section>
        )
      })}

      <p className="no-print text-sm mt-10">
        <Link href={QUESTIONS_PATH} className="text-brand-700 font-semibold hover:underline">← Back to the K53 questions and answers</Link>
      </p>
    </main>
  )
}
