import type { BlogPost } from '@/lib/blog'
import BlogArticle, { A, H2, type FaqItem } from './Article'

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'How long is a learner’s licence valid?',
    a: '24 months from the day you pass the test. It cannot be extended. When it expires you apply again and pass the learner’s test again before you may keep practising.',
  },
  {
    q: 'Can I drive a car alone?',
    a: 'No. Except on a motorcycle, or in a vehicle with no passenger seat, you must be accompanied and directly supervised by a person sitting next to you, or immediately behind you if that is not possible. That person must hold a driving licence for that class of vehicle, not a learner’s licence.',
  },
  {
    q: 'Can I carry a passenger on a motorcycle?',
    a: 'No. A motorcycle learner’s licence does not authorise you to carry another person.',
  },
  {
    q: 'Can I drive on a freeway?',
    a: 'Regulation 323, which lists vehicles that may not use a freeway, does not mention learner drivers as a banned class. The supervision rules still apply. Some vehicles, such as a motorcycle of 50 cc or less, are barred from freeways whoever is riding. If you are unsure about your vehicle, read that regulation and ask your testing centre.',
  },
]

export default function AfterYouPass({ post }: { post: BlogPost }) {
  return (
    <BlogArticle post={post} faqs={FAQ_ITEMS}>
      <p>
        A pass at the testing centre gives you a learner’s licence, not a driving licence. You may practise the class
        of vehicle your code covers, and you may do it only on the conditions in the regulations. Those conditions
        are easy to under-read because the card looks, at a glance, like permission to drive. It is permission to
        learn, for a fixed time, with a licensed driver beside you in most vehicles.
      </p>
      <p>
        The rules in this article come from Regulation 99, the national government learner’s page, and our{' '}
        <A href="/learners-licence-validity">validity guide</A>. Your card shows the dates that apply to you. Put the
        expiry in your phone the day you receive it.
      </p>

      <H2>Twenty-four months, and no extension</H2>
      <p>
        The learner’s licence is valid for 24 months from the day you pass the test. Gov.za says it is issued the
        same day once you have paid the issue fee, so the clock and the card start together. The issue fee is set by
        your municipality. There is no single national amount. Ask the centre, or use the official examples on the{' '}
        <A href="/learners-licence-cost">cost guide</A>, before you assume you know what you will pay at the cashier.
      </p>
      <p>
        It cannot be extended, and it is not “renewed” the way a driving-licence card is renewed. When people search
        for a learner’s renewal they are really looking at a new application: documents again, a new booking, and
        the theory test again. Older pages sometimes still say 18 months. That was the period before February 2010,
        when it was extended to 24 months. Use the date on your card, not a screenshot of an old website.
      </p>
      <p>
        If the licence expires before you have a driving licence, you stop driving on it that day. An expired
        learner’s licence does not authorise you to practise, and it does not authorise you to book a driving test
        as if you still hold one. You gather your documents again — see the{' '}
        <A href="/learners-licence-requirements">requirements guide</A> — and you{' '}
        <A href="/how-to-book-a-learners-licence-test">book a new learner’s test</A>. There is no official national
        waiting time for a new date, so phone the <A href="/centers">testing centre</A> as soon as you know the
        expiry is close. Gauteng bookings go through <A href="https://online.natis.gov.za/#/">online.natis.gov.za</A>.
        Other provinces should ask the centre, because online booking is not available everywhere.
      </p>

      <H2>You may practise, with a licensed driver beside you</H2>
      <p>
        Except on a motorcycle, or in a vehicle that has no passenger seat, you must be accompanied and under the
        direct personal supervision of someone sitting next to you. If the front seat cannot be used, that person
        sits immediately behind you. They must hold a driving licence for that class of vehicle. Another learner’s
        licence does not count. Two learners in one car, with nobody who holds the driving licence, are not legal
        supervision.
      </p>
      <p>
        If the vehicle requires a professional driving permit, gov.za says the supervisor must hold that permit as
        well. The supervisor is not a passenger you are giving a lift to. They are there to supervise. You may not
        use a learner’s licence to carry people for payment, other than the licensed driver who is supervising you.
        “For payment” includes the kind of informal trip that is really a taxi fare. The licence does not authorise it.
      </p>
      <p>
        You may only practise the class your learner’s code covers. A Code 2 learner’s covers light motor vehicles up
        to 3,500 kg, which is the usual code for someone working towards a Code 8 driving licence. It does not cover
        the heavier vehicle a Code 3 learner’s is for. Code 10 and Code 14 candidates usually hold Code 3, and the
        minimum age for that code is 18. If you passed on Code 2, you cannot treat the card as permission to practise
        in a Code 10 truck. The codes are set out in <A href="/learners-licence-codes">learner’s licence codes</A>.
      </p>

      <H2>Motorcycles: no passenger</H2>
      <p>
        A motorcycle learner’s licence does not authorise you to carry another person. The supervision rule is
        different because there is often no seat for a supervisor, but the passenger ban is explicit. A friend on the
        back, even for a short trip, is not allowed. Code 1 is the motorcycle category: from age 16 if the engine is
        125 cc or less, and from 18 if it is bigger. The engine size on the bike you ride has to fit the code you
        were granted. A larger bike is not covered by a learner’s that was issued for 125 cc or less.
      </p>

      <H2>Freeways and the vehicles that may not use them</H2>
      <p>
        Learners often hear that a learner’s licence bans freeways outright. Regulation 323, which lists the vehicles
        restricted on freeways, does not mention learner drivers as a class. We did not find a freeway ban on learners
        in that regulation. The supervision rules still apply on a freeway exactly as they apply on any other public
        road. You do not drive a car onto the freeway alone because the road is a freeway.
      </p>
      <p>
        Some vehicles are barred whoever holds the licence. Pedal cycles, animal-drawn vehicles, motorcycles of 50 cc
        or less, motor quadrucycles and tractors may not use a freeway, and pedestrians may not walk on one. If your
        Code 1 bike is in that small-engine group, the freeway is closed to the vehicle, not only to you as a learner.
        You may not stop on a freeway except in an emergency or when a sign or an officer tells you to. Those are
        ordinary freeway rules. They apply while you are supervised, not instead of supervision.
      </p>

      <H2>Use the 24 months for the driving test, not for another theory scramble</H2>
      <p>
        The useful reading of the card is a deadline. Lessons and the practical driving test have to fit inside the
        24 months, with time left over for a retest if you need one. Waiting until the last month and then discovering
        that your centre’s driving-test dates run past the expiry is a common way to end up rewriting the theory. The
        centre can tell you how its bookings look. We cannot, and there is no national waiting-time figure to quote.
      </p>
      <p>
        If you do have to rewrite the learner’s test, the three sections have not changed. You still need 22 out of
        28 on rules, 23 out of 28 on signs and 6 out of 8 on controls. Start again with the{' '}
        <A href="/k53-learners-study-guide">study guide</A>, the <A href="/k53-questions-and-answers">free
        questions</A> and a timed run on the <A href="/courses">practice tests</A>, and book the new theory test the
        same way you booked the first one. Passing a second time gives you another 24 months. It does not extend the
        card that has already expired.
      </p>
    </BlogArticle>
  )
}
