import type { BlogPost } from '@/lib/blog'
import { NATIS_BOOKING_URL } from '@/lib/guides'
import BlogArticle, { A, H2, type FaqItem } from './Article'

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Can I write the learner’s test online from home?',
    a: 'No. You write it in person at a driving licence testing centre. Booking online, where that is available, and practising online are not the same as the test.',
  },
  {
    q: 'What documents should I take?',
    a: 'Your identity document, the identity photographs your centre accepts, proof of your postal and residential address, and proof of your booking. You complete the LL1 form at the centre. If you are 65 or older you also complete form MC. Take glasses or contact lenses if you wear them.',
  },
  {
    q: 'How do I book if I am not in Gauteng?',
    a: 'Phone or visit your nearest testing centre and ask how it takes bookings. Online booking on online.natis.gov.za is what the national government page tells Gauteng residents to use. It is not available at every centre in every province.',
  },
  {
    q: 'What happens if I pass?',
    a: 'You pay the issue fee at the centre. The national government page says the learner’s licence is issued the same day once you have paid. It is valid for 24 months from the day you pass, and it cannot be extended.',
  },
]

export default function LearnersTestDay({ post }: { post: BlogPost }) {
  return (
    <BlogArticle post={post} faqs={FAQ_ITEMS}>
      <p>
        Test day at a driving licence testing centre is a documents visit and an eye test as well as the 64 questions.
        People who have studied and then arrive without the right papers, or at the wrong kind of booking, do not get
        as far as the questions. This is what to take, what the centre does, and what changes from province to
        province. It follows the national government list and the notes on our{' '}
        <A href="/learners-licence-requirements">requirements guide</A> and{' '}
        <A href="/how-to-book-a-learners-licence-test">booking guide</A>.
      </p>
      <p>
        SK Driving cannot book the test for you, and nobody else can sell you a slot. You book through the official
        NaTIS portal or through your testing centre. If a message offers a booking for a fee on top of the official
        one, ignore it.
      </p>

      <H2>What to pack</H2>
      <p>
        Take your identity document. For a South African applicant that is the green ID book or the smart ID card.
        Take a photocopy as well. The NaTIS learner driver manual mentions a copy, and some centres ask for one even
        when the national page does not spell that out.
      </p>
      <p>
        Take two identical identity photographs, and confirm the number and the colour with your centre before you
        go. The national gov.za page asks for black-and-white photographs. The NaTIS manual and the Western Cape also
        allow colour. Some municipalities ask for more photographs when the licence is issued. Kannaland, for example,
        asks for two more if you pass. A centre that wants a different photo will not accept a guess.
      </p>
      <p>
        Take proof of your postal address and your residential address, such as a municipal or utility account. If the
        account is not in your name, the account holder makes an affidavit — a sworn statement signed in front of a
        commissioner of oaths — and you attach it to the bill. If you live in an informal settlement, gov.za accepts a
        letter from your ward councillor with an official date stamp.
      </p>
      <p>
        Take the booking receipt or the confirmation from your online booking, and the fee if you still have to pay at
        the centre. There is no single national fee. The amount is set by the province or the municipality. Ask the
        centre what it charges, or read the official examples on our <A href="/learners-licence-cost">cost guide</A>,
        and do not rely on a number from social media. If you are 65 or older, also take medical certificate form MC,
        or ask the centre for it when you arrive. If you wear glasses or contact lenses, wear them or carry them. The
        eye test is part of the application for every candidate, not only for older applicants.
      </p>

      <H2>Booking, and why the province matters</H2>
      <p>
        In Gauteng the national government page says residents should apply online on the NaTIS portal at{' '}
        <A href={NATIS_BOOKING_URL}>online.natis.gov.za</A>. An online booking still ends at the testing centre. You
        write the test in person, and you still pay, complete the LL1 form and do the eye test there. A 2021 Gauteng
        report described online bookings as needing a visit to the centre within three days to pay and confirm. That
        description is not a national law. Check the current rule on the portal and with your centre as soon as you
        have a reference number.
      </p>
      <p>
        Outside Gauteng, many centres still take bookings at the counter or by phone. Online booking is not available
        everywhere. Phone the centre before you travel. Numbers and addresses are on the{' '}
        <A href="/centers">testing-centre finder</A>. There is no official national waiting time. It depends on the
        centre and the time of year. If your nearest centre is full, ask about another centre nearby. Do not assume a
        date you were promised in a chat is a booking.
      </p>

      <H2>What happens at the centre</H2>
      <p>
        You complete the LL1 application form at the centre. Check the category before you sign. Code 1 is a
        motorcycle, motor tricycle or quadrucycle. Code 2 is a light motor vehicle with a GVM up to 3,500 kg, which is
        the usual booking for a car. Code 3 is the heavier-vehicle learner’s, which is the usual booking for people
        working towards a Code 10 or Code 14 driving licence. The minimum ages are 16 for a motorcycle of 125 cc or
        less, 18 for a larger motorcycle, 17 for Code 2 and 18 for Code 3. The full table is on the{' '}
        <A href="/learners-licence-codes">codes guide</A>.
      </p>
      <p>
        Everyone does an eye test, either at the centre or on the form completed by a qualified optometrist. After
        that you write the test in person. It is a theory test. You do not drive. The test has 64 questions and you
        must pass all three sections: 22 out of 28 for rules, 23 out of 28 for signs and 6 out of 8 for controls.
        Details are on the <A href="/learners-licence-test">test guide</A>.
      </p>
      <p>
        Some centres use the computerised learner’s licence test on a tablet the centre provides. The Western Cape
        says all learner’s tests in that province are done this way. Hessequa Municipality’s description of the
        system says you have 60 minutes, the questions are drawn from a bank of 1,200, the result is immediate, and
        the test is offered in all 11 official languages. Those details come from provincial and municipal pages, not
        from a single national notice we could treat as universal. Ask your own centre whether it uses a screen or
        paper, how long it allows, and which languages it offers. We could not confirm that every centre in the
        country has switched.
      </p>

      <H2>If you pass, and if you do not</H2>
      <p>
        If you pass, you pay the issue fee and, according to gov.za, the learner’s licence is issued the same day.
        The issue fee is also set locally. It is not the same amount as the booking fee, and you pay it only after a
        pass. The licence is valid for 24 months from the day you pass, and it cannot be extended. What you may and
        may not do with it is covered in{' '}
        <A href="/blog/what-you-can-do-after-passing-your-learners">after you pass</A> and on the{' '}
        <A href="/learners-licence-validity">validity guide</A>.
      </p>
      <p>
        If you fail, you book a new test and pay again. There is no national rule that the first fee is refunded. The
        Western Cape says a cancelled booking is not refunded, and it allows a cancellation only for illness, a
        funeral, or school or university exams, with proof. Other provinces may handle a missed date differently. Ask
        your centre before the day if you already know you cannot attend. Failing one section fails the whole test, so
        the way to avoid a second fee is to practise all three sections. Start with the{' '}
        <A href="/k53-questions-and-answers">free questions</A> and a timed test on <A href="/courses">the practice
        tests</A>.
      </p>
      <p>
        Foreign applicants should phone the centre before booking. The national page does not set out a separate
        process. Some municipalities ask for a passport and a traffic register number. Getting a traffic register
        number is its own application and can take time. Do not leave it for the morning of the test.
      </p>
    </BlogArticle>
  )
}
