import type { Metadata } from 'next'
import GuidePage, {
  GuideLink, GuideSection, InternalLink, PracticeCta, SourceLink,
} from '@/components/guides/GuidePage'
import { GUIDES, guideMetadata, type Faq } from '@/lib/guides'
import { QUESTIONS_PATH } from '@/lib/k53-sample-questions'

export const dynamic = 'force-static'

export const metadata: Metadata = guideMetadata(GUIDES.codes)

const faqs: Faq[] = [
  {
    question: "What is a Code 10 learner's licence?",
    answer:
      "Officially there is no “Code 10” learner's licence. Code 10 is the old, everyday name for the C1 driving licence (vehicles over 3,500 kg up to 16,000 kg GVM). People aiming for it typically book a Code 3 learner's licence. Confirm the category with your DLTC when you fill in the LL1 form.",
  },
  {
    question: 'What is the difference between Code 8 and Code 10?',
    answer:
      "Code 8 is the everyday name for the Code B driving licence (light vehicles up to 3,500 kg GVM). Code 10 is the everyday name for Code C1 (over 3,500 kg up to 16,000 kg). For the learner's licence, Code 8 learners typically book Code 2, and Code 10 learners typically book Code 3.",
  },
  {
    question: 'Is a Code 1 learner’s licence the same as a car licence?',
    answer:
      "No. A Code 1 learner's licence is for motorcycles, motor tricycles and quadrucycles. For a car or other light motor vehicle, you need a Code 2 learner's licence.",
  },
  {
    question: "What age do I need to be for a Code 10 learner's licence?",
    answer:
      "A Code 10 (C1) driver typically starts with a Code 3 learner's licence, and the minimum age for Code 3 is 18. For a Code 8 (Code 2 learner's) the minimum is 17.",
  },
]

const OFFICIAL = [
  { code: 'Code 1', vehicles: 'Motorcycle (with or without a sidecar), motor tricycle or quadrucycle', age: '16 if the engine is 125 cc or less; 18 if over 125 cc' },
  { code: 'Code 2', vehicles: 'Motor vehicle, including a minibus, bus or goods vehicle, with a GVM not exceeding 3,500 kg', age: '17' },
  { code: 'Code 3', vehicles: 'Motor vehicle with a GVM exceeding 3,500 kg', age: '18' },
]

const EVERYDAY = [
  { everyday: 'Code 8', official: 'Code B', vehicles: 'Light motor vehicles, GVM up to 3,500 kg', learner: 'Code 2' },
  { everyday: 'Code 10', official: 'Code C1', vehicles: 'Medium-heavy vehicles, GVM over 3,500 kg up to 16,000 kg', learner: 'Code 3' },
  { everyday: 'Code 14', official: 'Code EC', vehicles: 'Heavy articulated vehicles and combinations', learner: 'Code 3' },
]

export default function CodesGuidePage() {
  return (
    <GuidePage
      id="codes"
      eyebrow="Codes guide · South Africa"
      answer={
        <>
          <p>
            Official learner&apos;s licences come in only three categories: <strong>Code 1</strong> (motorcycles),{' '}
            <strong>Code 2</strong> (light motor vehicles up to 3,500 kg) and <strong>Code 3</strong> (heavier vehicles).
          </p>
          <p>
            &ldquo;Code 8&rdquo;, &ldquo;Code 10&rdquo; and &ldquo;Code 14&rdquo; are everyday names for <em>driving</em>{' '}
            licences. For a Code 8 you typically book a Code 2 learner&apos;s; for Code 10 or Code 14, a Code 3. Confirm on
            your LL1 form with the DLTC.
          </p>
        </>
      }
      faqs={faqs}
      sources={['govLearners', 'reg99', 'nrtaS15', 'capeTown']}
      related={['requirements', 'booking', 'test', 'cost']}
      closingCta={{
        heading: 'Whatever code you book, the theory is the same three sections.',
        body: 'Rules of the road, road signs and vehicle controls. Practise them for the code you booked with free K53 questions.',
      }}
    >
      <GuideSection id="official" title="Official learner's licence categories are Code 1, 2 and 3">
        <p>
          Regulation 99 of the National Road Traffic Regulations sets out three categories of learner&apos;s licence.
          The national government describes them like this:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Official learner&apos;s licence categories and minimum ages</caption>
            <thead className="bg-brand-50 text-brand-950">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">Learner&apos;s code</th>
                <th scope="col" className="px-4 py-3 font-bold">Vehicles</th>
                <th scope="col" className="px-4 py-3 font-bold">Minimum age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {OFFICIAL.map(r => (
                <tr key={r.code}>
                  <th scope="row" className="px-4 py-3 font-semibold text-gray-900">{r.code}</th>
                  <td className="px-4 py-3">{r.vehicles}</td>
                  <td className="px-4 py-3 font-bold">{r.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600">
          GVM (gross vehicle mass) is the maximum the vehicle may weigh when fully loaded.
          Ages are from gov.za and section 15 of the National Road Traffic Act.
        </p>
      </GuideSection>

      <GuideSection id="code-1" title="Code 1 — motorcycles">
        <p>
          A Code 1 learner&apos;s licence covers a motorcycle with or without a sidecar, a motor tricycle or a
          quadrucycle. You can apply at 16 if the engine does not exceed 125 cc, and at 18 if it is bigger.
        </p>
        <p>
          A motorcycle learner&apos;s licence does not allow you to carry a passenger. Read the other rules in{' '}
          <GuideLink id="validity">validity and rules while you hold a learner&apos;s licence</GuideLink>.
        </p>
      </GuideSection>

      <GuideSection id="code-2" title="Code 2 — light motor vehicles">
        <p>
          Code 2 is the learner&apos;s licence most people need. It covers motor vehicles — including a minibus, bus or
          goods vehicle — with a GVM of no more than 3,500 kg, which includes ordinary cars and bakkies. The minimum age
          is 17.
        </p>
      </GuideSection>

      <GuideSection id="code-3" title="Code 3 — heavier vehicles">
        <p>
          The government page describes Code 3 as a motor vehicle with a GVM over 3,500 kg, and the minimum age is 18.
          Regulation 99 words it more broadly — any motor vehicle or combination other than a motorcycle, tricycle or
          quadrucycle — so the DLTC will capture the correct category for the licence you are working towards.
        </p>
      </GuideSection>

      <GuideSection id="everyday-codes" title="What people mean by Code 8, Code 10 and Code 14">
        <p>
          Code 8, 10 and 14 are <strong>old driving-licence codes</strong> that South Africans still use every day. The
          current driving-licence codes (A1, A, B, C1, C, EB, EC1, EC) are also set out in Regulation 99, separately from
          the three learner&apos;s codes. The everyday names usually match like this:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Everyday licence codes and the learner&apos;s code typically booked</caption>
            <thead className="bg-brand-50 text-brand-950">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">Everyday name</th>
                <th scope="col" className="px-4 py-3 font-bold">Driving licence code</th>
                <th scope="col" className="px-4 py-3 font-bold">Vehicles</th>
                <th scope="col" className="px-4 py-3 font-bold">Learner&apos;s code typically booked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {EVERYDAY.map(r => (
                <tr key={r.everyday}>
                  <th scope="row" className="px-4 py-3 font-semibold text-gray-900">{r.everyday}</th>
                  <td className="px-4 py-3">{r.official}</td>
                  <td className="px-4 py-3">{r.vehicles}</td>
                  <td className="px-4 py-3 font-bold">{r.learner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GuideSection>

      <GuideSection id="which-to-book" title="Which learner code to book for a Code 10 or Code 14 driving licence">
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Code 8 (B)</strong> — people aiming for a light-vehicle licence typically book a{' '}
            <strong>Code 2</strong> learner&apos;s licence (minimum age 17).</li>
          <li><strong>Code 10 (C1)</strong> — people aiming for a Code 10 typically book a <strong>Code 3</strong>{' '}
            learner&apos;s licence (minimum age 18).</li>
          <li><strong>Code 14 (EC)</strong> — also typically a <strong>Code 3</strong> learner&apos;s licence (minimum age
            18).</li>
        </ul>
        <p>
          This is a practical guide, not a substitute for the form. Tell the DLTC which driving licence you are working
          towards so that it captures the right learner&apos;s category.
        </p>
      </GuideSection>

      <PracticeCta
        heading='Practising for Code 8 or Code 10?'
        body='Start with the free K53 questions, then try the Code 8 and Code 10 timed practice tests.'
      />

      <GuideSection id="confirm" title="Confirm the code on your LL1 with the DLTC">
        <p>
          You choose the category on the <strong>LL1</strong> application form at the DLTC. Before you sign, check that it
          matches the vehicle you want to drive, and ask the official if you are unsure. You must be old enough for that
          category on the day you apply — the full list is in{' '}
          <GuideLink id="requirements">learner&apos;s licence requirements</GuideLink>.
        </p>
        <p>
          Some provincial pages list the driving-licence codes (A1, A, B, C1, EC) next to the learner&apos;s test, which
          adds to the confusion. We follow the national <SourceLink id="govLearners">gov.za learner&apos;s licence
          page</SourceLink> and <SourceLink id="reg99">Regulation 99</SourceLink>: three learner&apos;s codes, then the
          everyday names.
        </p>
        <p>
          Once you know your code, <GuideLink id="booking">book your test</GuideLink> and practise with the{' '}
          <InternalLink href={QUESTIONS_PATH}>free K53 questions</InternalLink> and our{' '}
          <InternalLink href="/courses">practice tests</InternalLink>.
        </p>
      </GuideSection>
    </GuidePage>
  )
}
