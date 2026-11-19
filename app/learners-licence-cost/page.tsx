import type { Metadata } from 'next'
import GuidePage, {
  Callout, GuideLink, GuideSection, InternalLink, SourceLink,
} from '@/components/guides/GuidePage'
import { ACCESS_PRICE } from '@/lib/contact'
import { GUIDES, GUIDES_REVIEWED_LABEL, guideMetadata, type Faq, type SourceId } from '@/lib/guides'

export const dynamic = 'force-static'

export const metadata: Metadata = guideMetadata(GUIDES.cost)

const faqs: Faq[] = [
  {
    question: "How much is the learner's licence booking fee?",
    answer:
      'There is no single national fee. Official examples are R68 in the Western Cape (including the City of Cape Town) and R108 in the City of Johannesburg. Other municipalities may charge different amounts, so confirm with your DLTC before you go.',
  },
  {
    question: "How much is the learner's licence issue fee?",
    answer:
      'You pay the issue fee only after you pass. Official examples are R33 in the Western Cape and R60 in the City of Johannesburg. Fees change (Johannesburg says its fees increase every year from 1 July), so check with your DLTC.',
  },
  {
    question: 'Do I pay again if I fail?',
    answer:
      'You pay the booking fee before you write, and the issue fee only if you pass. There is no national refund rule: the Western Cape says a cancelled booking is not refunded. To try again you book a new test, so ask your DLTC what it will cost.',
  },
  {
    question: 'Are Code 8 and Code 10 learner’s licences priced differently?',
    answer:
      "The City of Cape Town's official table lists the same R68 application fee for learner's Codes 1, 2 and 3. (Code 8 learners usually book Code 2, and Code 10 learners usually book Code 3.) Do not assume every municipality does the same; ask your DLTC.",
  },
]

const FEES: { area: string; book: string; issue: string; note: string; source: SourceId }[] = [
  { area: 'Western Cape (provincial government)', book: 'R68', issue: 'R33', note: 'Province asks you to confirm before attending.', source: 'westernCape' },
  { area: 'City of Cape Town', book: 'R68', issue: 'R33', note: 'Same R68 for Codes 1, 2 and 3. Tariffs document dated 1 July 2026.', source: 'capeTown' },
  { area: 'City of Johannesburg', book: 'R108', issue: 'R60', note: 'Fees increase every year from 1 July; no last-updated date shown.', source: 'joburg' },
]

export default function CostGuidePage() {
  return (
    <GuidePage
      id="cost"
      eyebrow="Fees guide · South Africa"
      answer={
        <>
          <p>
            There is <strong>no single national price</strong>. Official municipal and provincial pages we checked show
            about <strong>R68 to R108 to book</strong> the learner&apos;s licence test and <strong>R33 to R60 to have the
            licence issued</strong> once you pass.
          </p>
          <p>
            Those are Western Cape and City of Johannesburg figures. Your municipality may charge a different amount, so
            confirm with your DLTC before you go.
          </p>
        </>
      }
      faqs={faqs}
      sources={['govLearners', 'natisManual', 'westernCape', 'capeTown', 'joburg', 'hessequa', 'kannaland', 'george', 'knysna', 'kzn']}
      related={['booking', 'requirements', 'test', 'codes']}
      closingCta={{
        heading: 'The government fee only gets you into the test.',
        body: 'Failing means booking and paying again. Practise first with free K53 questions so you are ready on the day.',
      }}
    >
      <GuideSection id="no-national-fee" title="There is no single national fee">
        <p>
          The national government page on applying for a learner&apos;s licence does not list a price. It tells you to
          contact your local licensing office for the cost. The NaTIS learner driver manual says the fee is determined by
          the provincial MEC (the member of the provincial cabinet responsible for transport), which is why the amount
          can differ from one province or municipality to the next.
        </p>
        <p>
          You will see fee tables for all nine provinces on other websites. We have not repeated them here because we
          could not match them to current official pages. If a figure is not on an official government or municipal page,
          treat it as a guess.
        </p>
      </GuideSection>

      <GuideSection id="booking-vs-issue" title="Booking (application) fee vs issue fee">
        <p>There are two government payments:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Booking or application fee</strong> — paid when you book or confirm your test at the DLTC. This is the
            fee people search for as the &ldquo;learners licence booking fee&rdquo;.
          </li>
          <li>
            <strong>Issue fee</strong> — paid only if you pass, so that the DLTC can issue your learner&apos;s licence.
            According to gov.za, it is issued on the same day once you have passed and paid.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="official-examples" title="Official examples (Western Cape and Johannesburg)">
        <p>These are the only current-looking figures we could verify on official pages on {GUIDES_REVIEWED_LABEL}:</p>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Official learner&apos;s licence booking and issue fees</caption>
            <thead className="bg-brand-50 text-brand-950">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">Area</th>
                <th scope="col" className="px-4 py-3 font-bold">To book / apply</th>
                <th scope="col" className="px-4 py-3 font-bold">To issue after passing</th>
                <th scope="col" className="px-4 py-3 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {FEES.map(f => (
                <tr key={f.area}>
                  <th scope="row" className="px-4 py-3 font-semibold text-gray-900">
                    <SourceLink id={f.source}>{f.area}</SourceLink>
                  </th>
                  <td className="px-4 py-3 font-bold">{f.book}</td>
                  <td className="px-4 py-3 font-bold">{f.issue}</td>
                  <td className="px-4 py-3 text-gray-600">{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Other Western Cape municipalities show the same R68 booking amount: <SourceLink id="hessequa">Hessequa</SourceLink>{' '}
          (R68 to book, R33 more if you pass), <SourceLink id="kannaland">Kannaland</SourceLink> (R68, then R33 and two ID
          photos if you pass), <SourceLink id="george">George</SourceLink> (R68, then R33 on the day if you pass) and{' '}
          <SourceLink id="knysna">Knysna</SourceLink> (R68).
        </p>
        <Callout tone="warn">
          <strong>KwaZulu-Natal:</strong> an official KZN Department of Transport page has listed R150 to book and R60 to
          issue. That page still refers to COVID-era eye-test arrangements and may be out of date, so confirm with your
          DLTC before you go.
        </Callout>
        <p>
          For every other province and municipality, we could not find a current official figure. Phone your DLTC — you
          can find the number on our <InternalLink href="/centers">testing centre finder</InternalLink>.
        </p>
      </GuideSection>

      <GuideSection id="other-costs" title="What else you may pay (photos, optional optometrist eye test, travel)">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>ID photographs.</strong> You need two identical ID photos. Photo shops set their own prices.
          </li>
          <li>
            <strong>Optional optometrist eye test.</strong> Your eyes can be tested at the DLTC as part of the
            application, or you can bring a form completed by a qualified optometrist, who sets their own fee.
          </li>
          <li>
            <strong>Travel and time off.</strong> You will visit the DLTC at least once, and in Gauteng you may need a
            separate trip to confirm an online booking.
          </li>
          <li>
            <strong>Study material.</strong> The official manuals can be downloaded from the NaTIS website, and SK Driving&apos;s{' '}
            <InternalLink href="/k53-questions-and-answers">K53 questions and answers</InternalLink> are free. Our full
            access ({ACCESS_PRICE}, see <InternalLink href="/pricing">pricing</InternalLink>) is optional and separate
            from any government fee.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="confirm" title="How to confirm the fee at your DLTC">
        <ol className="list-decimal space-y-2 pl-6">
          <li>Find your centre on the <InternalLink href="/centers">DLTC finder</InternalLink> and phone it.</li>
          <li>Ask for the current learner&apos;s licence booking fee and issue fee, and which payment methods it accepts.</li>
          <li>Pay only at the official cashier and keep your receipt. The City of Johannesburg warns people not to accept
            help from anyone outside licensing buildings.</li>
        </ol>
        <p>
          If you are in Gauteng and booking online, read{' '}
          <GuideLink id="booking">how to book a learner&apos;s licence test</GuideLink> first; it explains how online
          bookings are confirmed and paid at the DLTC.
        </p>
      </GuideSection>

      <GuideSection id="issue-fee" title="After you pass: paying to have the licence issued">
        <p>
          When you pass, you pay the issue fee at the DLTC (for example R33 in the Western Cape or R60 in Johannesburg),
          and the licence is issued the same day. It is then valid for 24 months and cannot be extended — see{' '}
          <GuideLink id="validity">learner&apos;s licence validity</GuideLink>. Before you book, make sure you have the{' '}
          <GuideLink id="requirements">right documents</GuideLink>, so you do not lose a trip.
        </p>
      </GuideSection>
    </GuidePage>
  )
}
