import type { Metadata } from 'next'
import GuidePage, {
  Callout, GuideLink, GuideSection, InternalLink, SourceLink,
} from '@/components/guides/GuidePage'
import { GUIDES, guideMetadata, type Faq } from '@/lib/guides'
import { QUESTIONS_PATH } from '@/lib/k53-sample-questions'

export const dynamic = 'force-static'

export const metadata: Metadata = guideMetadata(GUIDES.validity)

const faqs: Faq[] = [
  {
    question: "How long is a learner's licence valid in South Africa?",
    answer:
      "24 months. The NaTIS learner driver manual says the 24 months run from the day you pass the test, and gov.za says the licence is issued that same day once you have paid the issue fee.",
  },
  {
    question: "Can I extend or renew my learner's licence?",
    answer:
      'No. The national government says a learner’s licence cannot be extended. “Renewing” it means applying again and passing the learner’s licence test again.',
  },
  {
    question: "What if my learner's licence expires before I get my driving licence?",
    answer:
      "Once it expires you may no longer drive on it. You need to apply for a new learner's licence and pass the test again before you can keep practising or book a driving test.",
  },
  {
    question: "Can I drive alone on a learner's licence?",
    answer:
      'Not in a car or other vehicle with a passenger seat. You must be accompanied and directly supervised by someone sitting next to you (or immediately behind you if that is not possible) who holds a driving licence for that class of vehicle — not a learner’s licence.',
  },
  {
    question: "Can I carry a passenger on a motorcycle learner's licence?",
    answer:
      "No. A motorcycle learner's licence does not authorise you to carry another person.",
  },
]

export default function ValidityGuidePage() {
  return (
    <GuidePage
      id="validity"
      eyebrow="Validity guide · South Africa"
      answer={
        <>
          <p>
            A South African learner&apos;s licence is valid for <strong>24 months</strong> from the day you pass the test,
            and it <strong>cannot be extended</strong>.
          </p>
          <p>
            If it expires, there is no renewal: you apply again and rewrite the learner&apos;s test. Plan your driving
            lessons and K53 driving test well inside the two years.
          </p>
        </>
      }
      faqs={faqs}
      sources={['govLearners', 'natisManual', 'westernCape', 'sanews2010', 'validityNotice2010', 'reg99', 'reg323']}
      related={['booking', 'requirements', 'codes', 'test']}
      closingCta={{
        heading: 'The 24 months go quickly.',
        body: 'Practise and book your driving test with time to spare. If you are about to rewrite the learner’s test, start with the free K53 questions.',
      }}
    >
      <GuideSection id="how-long" title="How long it is valid">
        <p>
          The national government&apos;s learner&apos;s licence page says it is <strong>valid for 24 months and cannot be
          extended</strong>. The Western Cape Government says the same in plain terms: two years.
        </p>
        <p>
          You may see &ldquo;18 months&rdquo; quoted on older websites or in unconsolidated copies of the regulations. That
          was the old period. In February 2010 the Minister of Transport extended it from 18 to 24 months; the notices were
          gazetted on 17 February 2010 (see <SourceLink id="sanews2010">SAnews</SourceLink> and the{' '}
          <SourceLink id="validityNotice2010">government notice</SourceLink>).
        </p>
      </GuideSection>

      <GuideSection id="start-date" title="From which date the 24 months run">
        <p>
          The NaTIS learner driver manual says a learner&apos;s licence is valid for 24 months <strong>from the day of the
          test</strong> — the day you passed. According to gov.za, the licence is issued on the same day once you have
          passed and paid the issue fee, so in practice the clock starts on your test day.
        </p>
        <p>
          Check the dates printed on your learner&apos;s licence and put the expiry date in your phone calendar.
        </p>
      </GuideSection>

      <GuideSection id="extend" title="Can it be extended or renewed?">
        <p>
          No. Unlike the driving licence card, which you renew, a learner&apos;s licence <strong>cannot be
          extended</strong>. When people search for &ldquo;learners licence renewal&rdquo;, the official answer is to apply
          for a new learner&apos;s licence and pass the test again.
        </p>
      </GuideSection>

      <GuideSection id="expired" title="What to do if it has expired">
        <ol className="list-decimal space-y-2 pl-6">
          <li>Stop driving on it. An expired learner&apos;s licence does not authorise you to drive.</li>
          <li>Gather your documents again — see <GuideLink id="requirements">learner&apos;s licence requirements</GuideLink>.</li>
          <li><GuideLink id="booking">Book a new learner&apos;s licence test</GuideLink> and pay the booking fee (see{' '}
            <GuideLink id="cost">cost</GuideLink>).</li>
          <li>Refresh your theory. Rules and signs are easy to forget after two years — use the{' '}
            <InternalLink href={QUESTIONS_PATH}>free K53 questions</InternalLink> and read{' '}
            <GuideLink id="test">how the test works</GuideLink>.</li>
        </ol>
        <Callout>
          If your expiry date is close and you have not yet booked your driving test, phone your DLTC now to ask about
          availability. Waiting times differ between centres.
        </Callout>
      </GuideSection>

      <GuideSection id="rules" title="Rules while you hold a learner's licence">
        <p>Regulation 99 of the National Road Traffic Regulations sets these conditions:</p>
        <ul className="list-disc space-y-3 pl-6">
          <li>
            <strong>Supervision.</strong> Except on a motorcycle (or a vehicle with no passenger seat), you must be
            accompanied and under the direct personal supervision of a person sitting next to you — or immediately behind
            you if that is not possible — who holds a licence for that class of vehicle. A learner&apos;s licence does not
            count. gov.za adds that if the vehicle requires a professional driving permit (PrDP), the supervisor must
            hold one too.
          </li>
          <li>
            <strong>No passengers on a motorcycle.</strong> A motorcycle learner&apos;s licence does not authorise you to
            carry another person.
          </li>
          <li>
            <strong>No driving for reward.</strong> A learner&apos;s licence does not authorise you to carry people for
            payment, other than the licensed driver who is supervising you.
          </li>
        </ul>
        <p>
          <strong>Freeways:</strong> regulation 323 lists the types of vehicle that may not use a freeway. It does not
          mention learner drivers, and we found no freeway ban on learners in it. The normal supervision rules above still
          apply, and some vehicles — for example certain small motorcycles — are barred from freeways whoever is riding.
          Read <SourceLink id="reg323">regulation 323</SourceLink> if you are unsure about your vehicle.
        </p>
        <p>
          Which code you hold also matters; see <GuideLink id="codes">learner&apos;s licence codes</GuideLink>.
        </p>
      </GuideSection>
    </GuidePage>
  )
}
