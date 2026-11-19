import type { Metadata } from 'next'
import GuidePage, {
  Callout, GuideLink, GuideSection, InternalLink, SourceLink,
} from '@/components/guides/GuidePage'
import { GUIDES, guideMetadata, type Faq } from '@/lib/guides'

export const dynamic = 'force-static'

export const metadata: Metadata = guideMetadata(GUIDES.requirements)

const faqs: Faq[] = [
  {
    question: "What documents do I need for a learner's licence?",
    answer:
      'Your identity document, two identical ID photographs, proof of your postal and residential address, and the booking fee. You complete the LL1 application form at the DLTC, and form MC as well if you are 65 or older. On test day, bring your booking receipt and ID.',
  },
  {
    question: "How old must I be to get a learner's licence?",
    answer:
      'At least 16 for a Code 1 motorcycle learner’s licence if the engine is 125 cc or less, 18 if it is bigger. At least 17 for Code 2 (light motor vehicles, such as cars) and 18 for Code 3 (heavier vehicles). Under 16, you cannot apply.',
  },
  {
    question: "Can a foreigner get a learner's licence in South Africa?",
    answer:
      'The national gov.za page does not set out a separate process for foreign nationals. Several municipalities accept a valid passport, and Johannesburg and George refer to a traffic register number (TRN). Ask your registering authority or DLTC what they need before you book.',
  },
  {
    question: 'How many photos do I need?',
    answer:
      'gov.za lists two identical black-and-white ID photographs. The NaTIS manual and the Western Cape also allow colour. Some centres ask for more photos when the licence is issued, so confirm with your DLTC.',
  },
  {
    question: 'Do I need an affidavit for proof of address?',
    answer:
      'Only if the account you use as proof of address is not in your name. Then the account holder makes an affidavit and you attach it to the bill. In an informal settlement, a dated, stamped letter from your ward councillor is accepted.',
  },
  {
    question: "Do I need a medical certificate for a learner's licence?",
    answer:
      'Only if you are 65 or older, when you also complete medical certificate form MC. Everyone has an eye test: at the DLTC, or on the required form completed by a qualified optometrist.',
  },
]

const CHECKLIST = [
  'Identity document (South African ID book or smart ID card)',
  'Two identical ID photographs — confirm the number and colour with your DLTC',
  'Proof of postal and residential address, such as a municipal or utility account',
  'Affidavit from the account holder, if the account is not in your name',
  'The booking fee (it varies by municipality)',
  'Form MC (medical certificate), if you are 65 or older',
  'Glasses or contact lenses, if you wear them, for the eye test',
]

export default function RequirementsGuidePage() {
  return (
    <GuidePage
      id="requirements"
      eyebrow="Requirements checklist · South Africa"
      answer={
        <>
          <p>
            You must be at least <strong>17</strong> for a car (Code 2) learner&apos;s licence, <strong>16</strong> for a
            motorcycle of 125 cc or less, and <strong>18</strong> for bigger motorcycles or heavy vehicles.
          </p>
          <p>
            Take your <strong>ID</strong>, <strong>two identical ID photos</strong>, <strong>proof of address</strong> and
            the <strong>booking fee</strong> to the DLTC, where you fill in the LL1 form and do an eye test.
          </p>
        </>
      }
      faqs={faqs}
      sources={['govLearners', 'nrtaS15', 'natisManual', 'capeTown', 'westernCape', 'joburg', 'george', 'hessequa', 'kannaland', 'govTrn']}
      related={['booking', 'cost', 'codes', 'validity']}
      closingCta={{
        heading: 'Documents ready? Start studying.',
        body: 'Book your test, then use the free K53 questions to practise rules, signs and controls before the day.',
      }}
    >
      <GuideSection id="age" title="Minimum age (Code 1, 2 and 3)">
        <p>Under 16, you cannot apply for a learner&apos;s licence. From 16, it depends on the category:</p>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Minimum age for each learner&apos;s licence category</caption>
            <thead className="bg-brand-50 text-brand-950">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">Category</th>
                <th scope="col" className="px-4 py-3 font-bold">Vehicles</th>
                <th scope="col" className="px-4 py-3 font-bold">Minimum age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><th scope="row" className="px-4 py-3 font-semibold text-gray-900">Code 1</th><td className="px-4 py-3">Motorcycle, engine 125 cc or less</td><td className="px-4 py-3 font-bold">16</td></tr>
              <tr><th scope="row" className="px-4 py-3 font-semibold text-gray-900">Code 1</th><td className="px-4 py-3">Motorcycle, engine over 125 cc</td><td className="px-4 py-3 font-bold">18</td></tr>
              <tr><th scope="row" className="px-4 py-3 font-semibold text-gray-900">Code 2</th><td className="px-4 py-3">Light motor vehicles, GVM up to 3,500 kg</td><td className="px-4 py-3 font-bold">17</td></tr>
              <tr><th scope="row" className="px-4 py-3 font-semibold text-gray-900">Code 3</th><td className="px-4 py-3">Motor vehicles, GVM over 3,500 kg</td><td className="px-4 py-3 font-bold">18</td></tr>
            </tbody>
          </table>
        </div>
        <Callout>
          <strong>Is it 17 for a motorcycle?</strong> No. 17 is the minimum for a Code 2 (light vehicle) learner&apos;s
          licence. For Code 1 it is 16 for a motorcycle of 125 cc or less and 18 for anything bigger. Not sure which
          code you need? See <GuideLink id="codes">learner&apos;s licence codes</GuideLink>.
        </Callout>
      </GuideSection>

      <GuideSection id="documents" title="Documents to take when you book">
        <p>
          The national government lists the following for a learner&apos;s licence application. Use it as a checklist
          before you go to the DLTC or confirm an online booking:
        </p>
        <ul className="space-y-2">
          {CHECKLIST.map(item => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-brand-400 text-xs text-brand-700">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          <strong>Photos:</strong> gov.za says two identical black-and-white ID photographs. The NaTIS learner driver
          manual and the Western Cape also allow colour. Some municipalities ask for photos again when the licence is
          issued — Kannaland, for example, asks for two more if you pass. Check with your centre.
        </p>
        <p>
          <strong>A copy of your ID:</strong> the NaTIS manual mentions acceptable identification and a photocopy. Take a
          photocopy in case your centre asks for one.
        </p>
        <p>
          At the DLTC you complete the <strong>LL1</strong> application form. On the day of the test you need your
          booking receipt and ID, and if you pass, you pay the issue fee. See{' '}
          <GuideLink id="booking">how to book</GuideLink> and <GuideLink id="cost">what it costs</GuideLink>.
        </p>
      </GuideSection>

      <GuideSection id="proof-of-address" title="Proof of address if the account is not in your name">
        <p>
          Many learners live with family, so the municipal or utility account is in someone else&apos;s name. In that case
          the <strong>account holder makes an affidavit</strong> (a sworn statement signed in front of a commissioner of oaths) confirming
          that you live at the address, and you attach it to the bill.
        </p>
        <p>
          If you live in an informal settlement, gov.za says a letter from your <strong>ward councillor</strong> with an
          official date stamp is accepted instead.
        </p>
      </GuideSection>

      <GuideSection id="eye-test" title="Eye test">
        <p>
          Every applicant has an eye test. It is done at the testing centre, or you can hand in the required form
          completed by a qualified optometrist. If you wear glasses or contact lenses to see, take them with you.
        </p>
      </GuideSection>

      <GuideSection id="over-65" title="If you are 65 or older (form MC)">
        <p>
          Applicants aged 65 or older also complete a medical certificate on <strong>form MC</strong>. This is listed on
          gov.za and in the NaTIS learner driver manual. Ask your DLTC for the form when you book.
        </p>
      </GuideSection>

      <GuideSection id="foreigners" title="Can a foreigner apply?">
        <p>
          The national gov.za learner&apos;s licence page only says &ldquo;identity document&rdquo; and does not describe a
          separate process for foreign nationals. We could not find a single national procedure, so here is what official
          pages do say:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Traffic register number (TRN).</strong> A TRN is the eNaTIS identifier used for foreigners. According to <SourceLink id="govTrn">gov.za</SourceLink>, you apply at a registering
            authority on form ANR with your passport or travel document, photos, proof of address and a fee, and it may
            take up to six weeks.
          </li>
          <li>
            <strong>City of Johannesburg</strong> says foreigners must produce a valid TRN certificate and a valid passport
            (stated for driving licence applications).
          </li>
          <li>
            <strong>George Municipality</strong> refers to a foreign ID or traffic register when applying for a learner&apos;s
            or driving licence.
          </li>
          <li>
            <strong>Hessequa Municipality</strong> lists &ldquo;ID / valid passport&rdquo; to make an appointment.
          </li>
        </ul>
        <Callout tone="warn">
          If you are a foreign national, visit or phone your registering authority or DLTC <strong>before</strong> you book
          and ask exactly which identification it accepts for a learner&apos;s licence. Rules differ between centres.
        </Callout>
      </GuideSection>

      <GuideSection id="oral-test" title="Oral test if you cannot read or write (City of Cape Town)">
        <p>
          The City of Cape Town offers an <strong>oral learner&apos;s test</strong> for people who cannot read or write, or
          who have a learning disability or dyslexia. You make an affidavit about your inability to read or write, or
          bring proof from a practitioner or institution for a learning disability or dyslexia. This is the City of Cape
          Town&apos;s process; if you live elsewhere, ask your DLTC whether it offers an oral test.
        </p>
      </GuideSection>

      <GuideSection id="next-steps" title="Next steps">
        <p>
          Once your documents are ready, <GuideLink id="booking">book your learner&apos;s licence test</GuideLink> and find
          your centre on the <InternalLink href="/centers">DLTC finder</InternalLink>. After you pass, your learner&apos;s
          licence is valid for 24 months — see <GuideLink id="validity">validity and expiry</GuideLink>.
        </p>
      </GuideSection>
    </GuidePage>
  )
}
