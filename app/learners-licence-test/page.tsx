import type { Metadata } from 'next'
import GuidePage, {
  Callout, GuideLink, GuideSection, InternalLink, PracticeCta, SourceLink,
} from '@/components/guides/GuidePage'
import { GUIDES, guideMetadata, type Faq } from '@/lib/guides'
import { FULL_TEST_URL, QUESTIONS_PATH, QUESTIONS_PDF_PATH } from '@/lib/k53-sample-questions'

export const dynamic = 'force-static'

export const metadata: Metadata = guideMetadata(GUIDES.test)

const faqs: Faq[] = [
  {
    question: "How many questions are in the learner's licence test?",
    answer:
      'The test has 64 questions: 28 on rules of the road, 28 on road traffic signs and 8 on vehicle controls.',
  },
  {
    question: "What is the pass mark for the learner's licence test?",
    answer:
      'You need at least 22 out of 28 for rules of the road, 23 out of 28 for road traffic signs and 6 out of 8 for vehicle controls. You must reach the minimum in every section; there is no official overall percentage.',
  },
  {
    question: "How long do you have to write the learner's licence test?",
    answer:
      "Hessequa Municipality's description of the computerised learner's licence test (CLLT) gives 60 minutes for the 64 questions. That figure comes from a municipal page, not the 2006 gazette, so ask your DLTC if you want to be sure.",
  },
  {
    question: "Is the learner's licence test done on a computer?",
    answer:
      'In some places, yes. The Western Cape says all its learner’s tests use the computerised learner’s licence test (CLLT), on tablets supplied at the centre. We could not confirm that every DLTC in South Africa has switched, so ask your centre.',
  },
  {
    question: "Can I write the learner's licence test online from home?",
    answer:
      'No. You write the official test in person at a Driving Licence Testing Centre. When people say “online” they usually mean booking online (on NaTIS in Gauteng) or practising online, which you can do at home.',
  },
  {
    question: 'Are the SK Driving questions the official test questions?',
    answer:
      'No. They are exam-style practice questions based on the official K53 manuals and road traffic law. The official question bank is not published, so learn why each answer is right rather than memorising wording.',
  },
]

export default function TestGuidePage() {
  return (
    <GuidePage
      id="test"
      eyebrow="Test guide · K53 learner's"
      answer={
        <>
          <p>
            The K53 learner&apos;s licence test has <strong>64 multiple-choice questions</strong> in three sections. To
            pass you need <strong>22/28</strong> on rules of the road, <strong>23/28</strong> on road traffic signs and{' '}
            <strong>6/8</strong> on vehicle controls — and you must pass <strong>every</strong> section.
          </p>
          <p>You write it in person at a Driving Licence Testing Centre (DLTC). In some areas, including the whole Western Cape, it is now done on a tablet.</p>
        </>
      }
      faqs={faqs}
      sources={['r93', 'hessequa', 'westernCape', 'govLearners', 'natisManual']}
      related={['booking', 'codes', 'cost', 'requirements']}
      closingCta={{
        heading: 'Ready to test yourself?',
        body: 'Work through the free K53 questions section by section, then sit a timed practice test in the same three-section format.',
      }}
    >
      <GuideSection id="covers" title="What the test covers">
        <p>The learner&apos;s licence test checks three things:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Rules of the road</strong> — right of way, speed limits, following distance, overtaking, stopping and
            parking, and what to do at intersections.</li>
          <li><strong>Road traffic signs, signals and markings</strong> — regulatory, warning and guidance signs, traffic
            lights, hand signals and lines on the road.</li>
          <li><strong>Vehicle controls</strong> — what each control does, usually shown on a numbered diagram for your
            vehicle category.</li>
        </ul>
        <p>
          It is a theory test only. You do not drive. The practical K53 driving test comes later, while you hold your
          learner&apos;s licence.
        </p>
      </GuideSection>

      <GuideSection id="pass-mark" title="How many questions and the official pass marks">
        <p>
          The pass marks are set in Government Notice R.93 of 2006 (Gazette 28446), and municipalities that use the
          computerised test restate the same numbers:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Learner&apos;s licence test sections, questions and minimum scores</caption>
            <thead className="bg-brand-50 text-brand-950">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">Section</th>
                <th scope="col" className="px-4 py-3 font-bold">Questions</th>
                <th scope="col" className="px-4 py-3 font-bold">Minimum to pass</th>
                <th scope="col" className="px-4 py-3 font-bold">Most you can get wrong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><th scope="row" className="px-4 py-3 font-semibold text-gray-900">Rules of the road</th><td className="px-4 py-3">28</td><td className="px-4 py-3 font-bold">22</td><td className="px-4 py-3">6</td></tr>
              <tr><th scope="row" className="px-4 py-3 font-semibold text-gray-900">Road traffic signs</th><td className="px-4 py-3">28</td><td className="px-4 py-3 font-bold">23</td><td className="px-4 py-3">5</td></tr>
              <tr><th scope="row" className="px-4 py-3 font-semibold text-gray-900">Vehicle controls</th><td className="px-4 py-3">8</td><td className="px-4 py-3 font-bold">6</td><td className="px-4 py-3">2</td></tr>
              <tr className="bg-gray-50"><th scope="row" className="px-4 py-3 font-semibold text-gray-900">Total</th><td className="px-4 py-3 font-bold">64</td><td className="px-4 py-3" colSpan={2}>Every section must be passed</td></tr>
            </tbody>
          </table>
        </div>
      </GuideSection>

      <GuideSection id="every-section" title="You must pass every section">
        <p>
          This is where most people get caught out. The notice sets a minimum for each section and no overall
          percentage, so a strong score in one section cannot make up for a weak one. Getting all 28 rules-of-the-road
          questions right still means a fail if you only get 22 of the 28 road signs.
        </p>
        <Callout>
          Road signs has the highest bar: you can only miss <strong>5 out of 28</strong>. Give it the most practice time.
        </Callout>
      </GuideSection>

      <PracticeCta
        heading='See how you score per section'
        body='Our free K53 questions are grouped into the same three sections, each with the answer and a short reason.'
      />

      <GuideSection id="cllt" title="Computerised testing (CLLT)">
        <p>
          Some DLTCs now use the <strong>computerised learner&apos;s licence test (CLLT)</strong> instead of a paper
          test. Hessequa Municipality, describing the system rolled out by the Road Traffic Management Corporation (RTMC),
          says that:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>the 64 questions are drawn from a bank of 1,200;</li>
          <li>you have 60 minutes;</li>
          <li>results are immediate and sent straight to NaTIS;</li>
          <li>the test is available in all 11 official languages;</li>
          <li>the pass marks are the same as above, and tablets are provided; and</li>
          <li>the way you apply and book has not changed.</li>
        </ul>
        <p>
          The Western Cape says all learner&apos;s tests in the province are done on the CLLT. Those details come from
          provincial and municipal pages rather than a national notice, and we could not confirm that every centre in the
          country has switched, so ask your DLTC how it tests.
        </p>
        <p>
          For more on how computerised testing changes the way you should study, read our article on{' '}
          <InternalLink href="/blog/learners-licence-study-materials-south-africa">learner&apos;s licence study materials</InternalLink>.
        </p>
      </GuideSection>

      <GuideSection id="study-material" title="Official study material">
        <p>
          The Department of Transport publishes the learner driver manuals — rules of the road, road traffic signs and
          vehicle controls — as downloads on the NaTIS website. The Western Cape notes that some public libraries also
          keep copies. Start with the <SourceLink id="natisManual">Rules of the Road manual</SourceLink>.
        </p>
        <p>
          Our <InternalLink href="/k53-learners-study-guide">free K53 study guide</InternalLink> summarises what to study
          for each section and has a free PDF summary.
        </p>
      </GuideSection>

      <GuideSection id="prepare" title="How to prepare (and a link to free practice)">
        <ol className="list-decimal space-y-2 pl-6">
          <li><strong>Read the manual for your code.</strong> Make sure you know which category you are writing — see{' '}
            <GuideLink id="codes">learner&apos;s licence codes</GuideLink>.</li>
          <li><strong>Learn signs by shape and colour.</strong> The shape tells you the type of sign before you read it.</li>
          <li><strong>Practise by section.</strong> Use the{' '}
            <InternalLink href={QUESTIONS_PATH}>free K53 questions and answers</InternalLink> and read the reason for each
            answer. You can also <InternalLink href={QUESTIONS_PDF_PATH}>print them or save them as a PDF</InternalLink>.</li>
          <li><strong>Practise under time pressure.</strong> Take a{' '}
            <InternalLink href={FULL_TEST_URL}>free timed practice test</InternalLink> and check you clear the minimum in
            all three sections, not just overall.</li>
          <li><strong>Fix your weakest section.</strong> Go back to the manual for the topics you keep getting wrong, then
            test again. Our <InternalLink href="/courses">Code 8 and Code 10 practice tests</InternalLink> are scored by
            section.</li>
        </ol>
        <p>
          Remember that practice questions are written in the style of the test. They are not the official questions, so
          understanding the rule matters more than memorising an answer.
        </p>
      </GuideSection>

      <GuideSection id="results" title="What happens when you pass or fail">
        <p>
          <strong>If you pass,</strong> you pay the issue fee and, according to gov.za, your learner&apos;s licence is issued
          on the same day. It is valid for 24 months — see{' '}
          <GuideLink id="validity">how long a learner&apos;s licence is valid</GuideLink>.
        </p>
        <p>
          <strong>If you fail,</strong> you need to book a new test, so ask your DLTC what you will pay. Fees vary by municipality; see{' '}
          <GuideLink id="cost">learner&apos;s licence cost</GuideLink> and{' '}
          <GuideLink id="booking">how to book</GuideLink>.
        </p>
      </GuideSection>
    </GuidePage>
  )
}
