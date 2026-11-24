import type { BlogPost } from '@/lib/blog'
import BlogArticle, { A, H2, type FaqItem } from './Article'

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Is a Code 8 learner’s licence a real category?',
    a: 'No. Code 8 is the everyday name for a Code B driving licence, for light vehicles up to 3,500 kg. The learner’s category people usually book for it is Code 2. Confirm that on the LL1 form at the testing centre.',
  },
  {
    q: 'What learner’s code do I book for Code 10 or Code 14?',
    a: 'People aiming for a Code 10 (driving licence Code C1) or a Code 14 (driving licence Code EC) usually book a Code 3 learner’s licence. The minimum age for Code 3 is 18.',
  },
  {
    q: 'Is the learner’s test different for Code 8 and Code 10?',
    a: 'The theory test still has the same three sections: rules of the road, road signs and vehicle controls. The controls diagram follows the kind of vehicle you booked. You do not drive on the learner’s test. The driving test comes later.',
  },
  {
    q: 'How old must I be?',
    a: 'Code 2, the light-vehicle learner’s, is from age 17. Code 3 is from age 18. A Code 1 motorcycle learner’s is from age 16 if the engine is 125 cc or less, and from 18 if it is bigger.',
  },
]

export default function LearnersVsDriversLicence({ post }: { post: BlogPost }) {
  return (
    <BlogArticle post={post} faqs={FAQ_ITEMS}>
      <p>
        “Code 8”, “Code 10” and “Code 14” are the names South Africans use for driving licences. They are not the
        names of the learner’s licence you book first. Official learner’s licences come in three categories only:
        Code 1, Code 2 and Code 3. The learner’s test is the theory test you write at a driving licence testing
        centre. The driver’s test is the practical K53 test you take later, while you hold the learner’s licence.
        Mixing those up is how people book the wrong category or expect to drive a car on the day they write.
      </p>
      <p>
        The tables below follow the national government learner’s page, Regulation 99, and our{' '}
        <A href="/learners-licence-codes">codes guide</A>. On the day, the LL1 form at the centre is what counts.
        Tell the official which driving licence you are working towards and check the learner’s code before you sign.
      </p>

      <H2>The learner’s test and the driving test are different days</H2>
      <p>
        The learner’s test is theory. You do not take a vehicle onto the road for it. You answer 64 questions on rules
        of the road, road signs and vehicle controls, and you must pass each section. When you pass and pay the issue
        fee, you receive a learner’s licence, valid for 24 months, which lets you practise under the conditions in
        the regulations. It is not a driving licence.
      </p>
      <p>
        The driving test comes after that. It is the practical test of whether you can drive the class of vehicle to
        the K53 standard. You cannot book it instead of the learner’s test, and you should not leave it so late that
        the learner’s licence expires first. A learner’s licence cannot be extended. If it expires, you rewrite the
        theory. See <A href="/learners-licence-validity">how long a learner’s licence is valid</A>.
      </p>

      <H2>Code 1, Code 2 and Code 3</H2>
      <p>
        Code 1 is a motorcycle, with or without a sidecar, a motor tricycle or a quadrucycle. You can apply at 16 if
        the engine does not exceed 125 cc, and at 18 if it is bigger. A Code 1 learner’s licence does not allow you
        to carry a passenger.
      </p>
      <p>
        Code 2 is the learner’s licence most car drivers need. It covers a motor vehicle, including a minibus, bus or
        goods vehicle, with a gross vehicle mass not over 3,500 kg. Ordinary cars and bakkies fall here. The minimum
        age is 17. Gross vehicle mass is the most the vehicle is allowed to weigh when it is fully loaded, not what
        it happens to weigh on the morning of the test.
      </p>
      <p>
        Code 3 is for a motor vehicle with a GVM over 3,500 kg, and the minimum age is 18. Regulation 99 describes
        this category more broadly than the short line on the government page, as any motor vehicle or combination
        other than a motorcycle, tricycle or quadrucycle. In practice the centre records the learner’s category that
        matches the driving licence you are working towards. If you are unsure, ask before you sign the LL1. Do not
        guess from the name a driving school used in an advert.
      </p>

      <H2>What Code 8, Code 10 and Code 14 actually are</H2>
      <p>
        These are old driving-licence codes that are still used in ordinary speech. The current driving-licence codes
        include B, C1 and EC. The match most people need is:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Code 8 is the everyday name for driving licence Code B: light motor vehicles up to 3,500 kg. The learner’s code usually booked is Code 2, from age 17.</li>
        <li>Code 10 is the everyday name for driving licence Code C1: vehicles over 3,500 kg up to 16,000 kg. The learner’s code usually booked is Code 3, from age 18.</li>
        <li>Code 14 is the everyday name for driving licence Code EC: heavy articulated vehicles and combinations. The learner’s code usually booked is also Code 3, from age 18.</li>
      </ul>
      <p>
        There is no official “Code 10 learner’s licence” and no “Code 8 learner’s licence”. If a form, a queue or a
        website offers you one of those names, ask which of Code 1, 2 or 3 will be printed on the LL1. Booking a Code
        2 when you need a Code 3, or the other way round, means the learner’s licence you receive is for a different
        class of vehicle from the one you plan to do your driving test in.
      </p>

      <H2>Two bookings that go wrong</H2>
      <p>
        Lerato is 17 and wants what her family calls a Code 10, because a relative drives a truck. Code 10 is a
        driving licence (Code C1), and the learner’s category for it is Code 3. Code 3 starts at 18. At 17 she cannot
        book it. She can book Code 2 and practise in a car. If the centre is asked for “a Code 10 learner’s” and
        nobody checks her age, the form is the thing that matters: if it says Code 3 and she is 17, she is not old
        enough. If it says Code 2, she is practising for a light vehicle, not the truck.
      </p>
      <p>
        Sipho is 19 and says he wants a Code 8. That is a Code B driving licence. The learner’s code on his LL1 should
        be Code 2, minimum age 17, GVM up to 3,500 kg. If he signs Code 3 because the queue moves faster when he nods,
        he has a learner’s for a heavier vehicle than the car his lessons are in. The theory sections are still rules,
        signs and controls, but the controls diagram and the vehicle he may practise in follow the code on the card.
        Before he pays the booking fee he reads the category back to the official. The fee itself depends on the
        municipality, so he checks it with the centre rather than with a screenshot.
      </p>

      <H2>What stays the same, and what changes</H2>
      <p>
        The theory is the same three sections for every category: rules, signs and controls. Speed limits, following
        distance, right of way and the sign shapes do not become optional because you want a Code 10. You still need
        22, 23 and 6 as the three minima. What changes is the controls diagram, because a motorcycle does not have the
        pedals of a car, and a heavy vehicle is not pictured as a light car. Practise the diagram for the category you
        booked. The <A href="/blog/k53-vehicle-controls-questions-explained">controls article</A> uses our light-vehicle
        practice diagram and says so.
      </p>
      <p>
        Our <A href="/courses">practice tests</A> are aimed at the Code 8 and Code 10 theory candidates actually book.
        The <A href="/k53-learners-study-guide">study guide</A> explains the three sections without tying them to a
        single old code name. Use both after you know your learner’s code, not before.
      </p>

      <H2>Age, documents and where you book</H2>
      <p>
        You must already be old enough for the category on the day you apply. Under 16 you cannot apply at all.
        Seventeen is the minimum for Code 2, not for every motorcycle and not for Code 3. Take the identity document,
        photographs, proof of address and booking fee described in the{' '}
        <A href="/learners-licence-requirements">requirements guide</A>. The fee is not a national flat rate. Ask the
        centre, and see the official examples on the <A href="/learners-licence-cost">cost guide</A>.
      </p>
      <p>
        Gauteng residents book on <A href="https://online.natis.gov.za/#/">online.natis.gov.za</A>. Elsewhere, phone
        the centre listed on the <A href="/centers">testing-centre finder</A> and ask how it takes a learner’s
        booking for the code you need. Say “Code 2” or “Code 3”, and also say the driving licence you are working
        towards, so the person on the phone and the person at the counter are talking about the same application.
      </p>
      <p>
        When the learner’s licence is in your hand, you are allowed to practise under supervision. You are not yet
        allowed to drive as a licensed driver. The limits are in{' '}
        <A href="/blog/what-you-can-do-after-passing-your-learners">what you may do after you pass</A>.
      </p>
    </BlogArticle>
  )
}
