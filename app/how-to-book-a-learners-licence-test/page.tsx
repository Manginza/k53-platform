import type { Metadata } from 'next'
import GuidePage, {
  Callout, ExternalLink, GuideLink, GuideSection, InternalLink, PracticeCta, SourceLink,
} from '@/components/guides/GuidePage'
import { GUIDES, NATIS_BOOKING_URL, guideMetadata, type Faq } from '@/lib/guides'

export const dynamic = 'force-static'

export const metadata: Metadata = guideMetadata(GUIDES.booking)

const faqs: Faq[] = [
  {
    question: "Can I book a learner's licence test online from any province?",
    answer:
      "Not necessarily. The national government page says all Gauteng residents should apply online on the NaTIS portal (online.natis.gov.za). For other provinces, online availability varies, so phone or visit your nearest Driving Licence Testing Centre (DLTC) and ask how it takes bookings.",
  },
  {
    question: 'Do I still go to the DLTC if I booked online?',
    answer:
      "Yes. You write the learner's licence test in person at a DLTC and take your ID and documents there. Gauteng online bookings have been described as needing a visit to the DLTC within three days to pay and confirm the slot, so check the current rule on the portal and with your centre.",
  },
  {
    question: 'What documents do I need to book?',
    answer:
      'Take your identity document, two identical ID photographs (gov.za says black-and-white; confirm what your DLTC accepts), proof of your postal and residential address, and the booking fee. You complete the LL1 application form at the DLTC. If you are 65 or older, you also complete form MC.',
  },
  {
    question: 'What happens if I miss my test slot?',
    answer:
      'There is no single national rule. The Western Cape and City of Cape Town only allow a cancellation for illness, a funeral or school or university exams, with proof, and the fee is not refunded. Elsewhere, ask your DLTC what to do before your date, because you may have to book again.',
  },
  {
    question: 'How long until I get a test date?',
    answer:
      'There is no official national waiting time. It depends on the centre and the time of year. Use the SK Driving centre finder to get your nearest DLTC’s phone number and ask, or check the available slots on the NaTIS portal if you are in Gauteng.',
  },
]

export default function BookingGuidePage() {
  return (
    <GuidePage
      id="booking"
      eyebrow="Booking guide · South Africa"
      answer={
        <>
          <p>
            In <strong>Gauteng</strong>, book your learner&apos;s licence test online on the official NaTIS portal at{' '}
            <a href={NATIS_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline">online.natis.gov.za</a>.
            In <strong>other provinces</strong>, phone or visit your nearest Driving Licence Testing Centre (DLTC), because
            online booking is not available everywhere.
          </p>
          <p>
            Either way, you pay at the DLTC, fill in the LL1 form there, do an eye test and write the test in person.
          </p>
        </>
      }
      faqs={faqs}
      sources={['govLearners', 'natisPortal', 'westernCape', 'capeTown', 'joburg', 'gautengReport']}
      related={['cost', 'requirements', 'codes', 'test', 'validity']}
      closingCta={{
        heading: 'Booked your slot? Make it count.',
        body: 'Once you have a date, practise with free K53 questions so you pass first time and do not have to pay to book again.',
      }}
    >
      <Callout>
        <strong>SK Driving cannot book a test for you.</strong> Bookings are made only through the official NaTIS
        portal or your DLTC. If someone offers to &ldquo;sell&rdquo; you a slot, walk away.{' '}
        <ExternalLink href={NATIS_BOOKING_URL}>Open the official NaTIS booking portal ↗</ExternalLink>
      </Callout>

      <GuideSection id="online" title="Can I book a learner's licence test online?">
        <p>
          Yes, if you live in Gauteng. The national government&apos;s learner&apos;s licence page says that{' '}
          <strong>all Gauteng residents should apply online</strong> on the NaTIS website. That is the search people
          usually mean by &ldquo;learners licence online booking&rdquo; or &ldquo;NaTIS online booking&rdquo;.
        </p>
        <p>
          Outside Gauteng it depends on your province and municipality. Many centres take bookings at the counter or by
          phone. Before you travel, phone your DLTC and ask how it handles learner&apos;s test bookings. You can find
          centres and phone numbers on our <InternalLink href="/centers">DLTC finder</InternalLink>.
        </p>
        <p>
          Even an online booking ends at the DLTC: you still go there in person to pay, complete the forms, have your eyes
          tested and write the test.
        </p>
      </GuideSection>

      <GuideSection id="natis" title="How to book on the official NaTIS website (Gauteng)">
        <p>
          The portal is run by the Department of Transport. The address is{' '}
          <ExternalLink href={NATIS_BOOKING_URL}>online.natis.gov.za</ExternalLink>. Type it yourself or use this
          link, and check the address bar before you enter your ID number. The portal&apos;s screens change from time to
          time, so follow its own instructions. Before you start, have these ready:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Your ID number and contact details.</li>
          <li>The learner&apos;s licence category you need: Code 1, 2 or 3 (see{' '}
            <GuideLink id="codes">which code to book</GuideLink>).</li>
          <li>The DLTC you want to write at, and a few dates that suit you.</li>
        </ul>
        <p>
          When the booking is done, save or print the confirmation, then go to the DLTC in time to pay and confirm it.
        </p>
        <Callout tone="warn">
          <strong>The three-day confirmation rule.</strong> A 2021 Gauteng government investigation into DLTC bookings
          described the online system like this: you had to attend the DLTC within three days to pay the confirmation
          fee, or the slot was released at 08:00 after the third day. Treat that as how Gauteng online bookings have
          worked, not a national law — confirm the current rule on the portal and at your DLTC as soon as you book.
        </Callout>
      </GuideSection>

      <GuideSection id="dltc" title="How to book at a Driving Licence Testing Centre">
        <p>If your province does not use online booking, or you prefer to book in person:</p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Find your nearest DLTC on our <InternalLink href="/centers">testing centre finder</InternalLink> and phone
            to check opening hours and whether you need to queue early.</li>
          <li>Take your documents (listed below) and the booking fee.</li>
          <li>Complete the LL1 application form and the eye test at the centre.</li>
          <li>Pay at the official cashier and keep the receipt — it shows your test date and time.</li>
        </ol>
        <p>
          In the Western Cape, the provincial government and City of Cape Town both say you book your learner&apos;s test
          at the DLTC. Booking fees differ between municipalities; our{' '}
          <GuideLink id="cost">learner&apos;s licence cost guide</GuideLink> lists the official examples we could verify.
        </p>
        <Callout tone="warn">
          <strong>Avoid touts.</strong> The City of Johannesburg warns the public not to accept help from people outside
          licensing buildings and to pay only at a public cashier, so you get a valid receipt. Be wary of anyone who offers
          a faster test date or a guaranteed pass.
        </Callout>
      </GuideSection>

      <GuideSection id="documents" title="What to take when you book">
        <p>The national government page lists these for a learner&apos;s licence application:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Your identity document.</li>
          <li>Two identical ID photographs. gov.za says black-and-white; the NaTIS manual and the Western Cape also accept
            colour. Ask your DLTC how many and what kind it wants.</li>
          <li>Proof of your postal and residential address, such as a municipal or utility account.</li>
          <li>The booking fee.</li>
        </ul>
        <p>
          If the account is not in your name, the account holder makes an affidavit and you attach it to the bill. If you
          live in an informal settlement, a letter from your ward councillor with an official date stamp is accepted.
          Full details, including age limits and foreign applicants, are in the{' '}
          <GuideLink id="requirements">learner&apos;s licence requirements guide</GuideLink>.
        </p>
      </GuideSection>

      <GuideSection id="eye-test" title="Eye test and the LL1 form">
        <p>
          You complete the <strong>LL1</strong> application form at the DLTC. The category you write on it (Code 1, 2 or
          3) decides which test you write, so check it before you hand it in.
        </p>
        <p>
          Your eyesight is tested at the centre, or you can hand in the required form completed by a qualified
          optometrist. Applicants aged 65 or older also complete a medical certificate on <strong>form MC</strong>.
        </p>
      </GuideSection>

      <PracticeCta
        heading='Waiting for your test date?'
        body='Use the time well. The test has 64 questions and you must pass all three sections, so start with the free practice questions now.'
      />

      <GuideSection id="cancel" title="How to confirm or cancel a booking">
        <p>
          <strong>Confirming:</strong> keep your receipt or booking confirmation and check the date, time and centre on it.
          If you booked online in Gauteng, make sure the booking has been paid and confirmed at the DLTC (see the
          three-day note above).
        </p>
        <p>
          <strong>Cancelling:</strong> rules are set locally. The Western Cape Government and City of Cape Town allow a
          cancellation only if you are sick (with a medical certificate), attending a funeral (with a death certificate)
          or writing exams (with your exam timetable), and the payment is not refunded. Other provinces may handle this
          differently, so phone your DLTC as early as possible.
        </p>
      </GuideSection>

      <GuideSection id="test-day" title="What to take on the day of the test">
        <ul className="list-disc space-y-2 pl-6">
          <li>Your booking receipt.</li>
          <li>Your identity document.</li>
          <li>Glasses or contact lenses, if you need them to see.</li>
        </ul>
        <p>
          Arrive early. To see what the test looks like, including the pass mark for each section, read{' '}
          <GuideLink id="test">how the learner&apos;s licence test works</GuideLink>.
        </p>
      </GuideSection>

      <GuideSection id="after" title="After you pass: paying the issue fee">
        <p>
          When you pass, you pay a separate <strong>issue fee</strong>. According to gov.za, your learner&apos;s licence is
          issued on the same day once you have passed and paid. It is then valid for 24 months — see{' '}
          <GuideLink id="validity">how long a learner&apos;s licence is valid</GuideLink>.
        </p>
        <p>
          Sources for this page: <SourceLink id="govLearners" />, <SourceLink id="westernCape" /> and{' '}
          <SourceLink id="joburg" />.
        </p>
      </GuideSection>
    </GuidePage>
  )
}
