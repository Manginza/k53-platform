import type { BlogPost } from '@/lib/blog'
import { NATIS_BOOKING_URL } from '@/lib/guides'
import BlogArticle, { A, H2, type FaqItem } from './Article'

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Can I really prepare for the learner’s test in two weeks?',
    a: 'Two weeks is enough to cover the three sections if you study every day and practise questions, not if you only read the night before. It is a plan for understanding the rules, not a promise that you will pass.',
  },
  {
    q: 'Which section should get the most time?',
    a: 'Road signs. The test has 28 sign questions and you need 23. You can miss only five. Rules of the road allows six misses out of 28, and vehicle controls allows two misses out of eight.',
  },
  {
    q: 'Should I memorise answers?',
    a: 'No. Some centres draw the 64 questions from a larger bank, and the official question bank is not published. Learn why an answer is right. A memorised wording will not help when the options are phrased differently.',
  },
  {
    q: 'Where do I book the real test?',
    a: 'In Gauteng, book on the official NaTIS portal at online.natis.gov.za. In other provinces, online booking is not available everywhere, so phone or visit your driving licence testing centre. SK Driving cannot book a slot for you.',
  },
]

export default function StudyInTwoWeeks({ post }: { post: BlogPost }) {
  return (
    <BlogArticle post={post} faqs={FAQ_ITEMS}>
      <p>
        Two weeks is a short window, but it is long enough to prepare for the K53 learner’s test if you use it on the
        three sections the test actually marks. The test has 64 multiple-choice questions: 28 on rules of the road, 28
        on road signs and 8 on vehicle controls. You must reach the minimum in every section. A strong score in one
        cannot rescue a weak score in another.
      </p>
      <p>
        This plan assumes you already know which learner’s category you are writing, and that you can study for about
        an hour on most days. It does not replace the official manuals, and it does not guarantee a pass. It tells you
        what to do on each day so you are not still discovering the pass marks the night before.
      </p>

      <H2>Before day one: know the test you are writing</H2>
      <p>
        Official learner’s licences are Code 1 (motorcycles), Code 2 (light motor vehicles up to 3,500 kg) and Code 3
        (heavier vehicles). “Code 8”, “Code 10” and “Code 14” are everyday names for driving licences. People aiming
        for a Code 8 usually book a Code 2 learner’s. People aiming for a Code 10 or Code 14 usually book a Code 3.
        Confirm the category on the LL1 form at the testing centre. The theory still covers the same three sections,
        but the vehicle-controls diagram follows the kind of vehicle you booked. Read{' '}
        <A href="/learners-licence-codes">learner’s licence codes</A> if you are unsure.
      </p>
      <p>
        The minima, set out in Government Notice R.93 of 2006 and restated on our{' '}
        <A href="/learners-licence-test">test guide</A>, are 22 out of 28 for rules of the road, 23 out of 28 for road
        signs and 6 out of 8 for vehicle controls. There is no official overall percentage. Road signs is the strictest
        section, so the plan gives it the most days.
      </p>

      <H2>Days 1 and 2: the shape of the test</H2>
      <p>
        On the first day, read the <A href="/k53-learners-study-guide">free K53 study guide</A> and the pass-mark table.
        Write the three minima on a piece of paper and keep it where you study. Then do a short set of{' '}
        <A href="/k53-questions-and-answers">free questions and answers</A> without a timer. Do not chase a score. Note
        which section feels unfamiliar.
      </p>
      <p>
        On the second day, sort your notes into the three sections and nothing else. If a fact does not help you answer
        a rules question, a sign question or a controls question, it can wait. Check that you know where you will write.
        Use the <A href="/centers">testing-centre finder</A> for the phone number, and read{' '}
        <A href="/how-to-book-a-learners-licence-test">how to book</A>. Gauteng residents book on the official portal
        at <A href={NATIS_BOOKING_URL}>online.natis.gov.za</A>. Other provinces should ask the centre, because online
        booking is not available everywhere.
      </p>

      <H2>Days 3 to 5: rules of the road</H2>
      <p>
        Spend these three days on rules, one topic at a time. Day 3 is speed and following distance. Unless a sign says
        otherwise, the general limits are 60 km/h in an urban area, 100 km/h outside town on a road that is not a
        freeway, and 120 km/h on a freeway. A bus or minibus is limited to 100 km/h. A goods vehicle with a GVM over
        9,000 kg is limited to 80 km/h. The minimum following distance is two seconds for a light motor vehicle and
        three seconds for a heavy one, and longer in rain or poor visibility. A safe gap is one that lets you stop in
        a straight line if the vehicle ahead stops suddenly.
      </p>
      <p>
        Day 4 is right of way and intersections. At a traffic circle you yield to traffic approaching from your right.
        You yield to a pedestrian who is already in a pedestrian crossing, and you may not pass a vehicle that has
        stopped at one. An emergency vehicle with its siren and warning lights on gets immediate right of way. You
        drive on the left, you overtake on the right, and you may not go over the speed limit to pass. You may not
        overtake near the top of a rise, on a curve, or anywhere you cannot see, and you may not overtake on the
        shoulder.
      </p>
      <p>
        Day 5 is parking, stopping and the duties that catch people out. You may not park within 5 metres of an
        intersection, within 9 metres of the approaching side of a pedestrian crossing, or within 1.5 metres of a fire
        hydrant. You may not stop within 6 metres of a bridge, tunnel or subway. You may not hold a cellphone in your
        hand, or with any other part of your body, while driving. The <A href="/blog/k53-rules-of-the-road-explained">rules
        article</A> walks through these in more detail. After each day, do the matching questions and read the reason
        under every answer, including the ones you got right.
      </p>

      <H2>Days 6 to 9: road signs</H2>
      <p>
        Four days on signs is deliberate. You can get only five sign questions wrong. Start with shape and colour,
        because the shape tells you the kind of sign before you read the symbol. A circle is an instruction. A red
        border on a circle means you must not do something. A blue circle means you must do something. A triangle with
        the point up is a warning of what is ahead, not an order to act at the sign itself. An inverted triangle is
        yield. An octagon is stop. A rectangle gives information or direction.
      </p>
      <p>
        Then work through the mix-ups that the practice questions keep returning to. A yellow diamond marks a priority
        road: you have right of way at the next intersection. A triangle that shows a stop sign and a distance is a
        warning that a stop sign is coming, not the place where you stop. The word STOP painted on the road, with a
        stop line, carries the same instruction as a stop sign. A flashing red light means stop completely and go only
        when it is safe. It is not a signal to wait for green. A continuous yellow line at the kerb means no stopping.
        Read <A href="/blog/k53-road-signs-most-people-get-wrong">road signs most people get wrong</A> and then do a
        fresh set of sign questions each of these four days. If you miss one, copy the sign’s meaning in your own
        words. Do not copy the letter of the option.
      </p>

      <H2>Days 10 and 11: vehicle controls</H2>
      <p>
        Controls is the shortest section and the easiest to rush. The questions use a numbered picture. On SK Driving’s
        light-vehicle practice diagram the numbers run from the mirrors and wipers through the steering wheel,
        indicator, gear lever, parking brake, clutch, foot brake, accelerator and hooter. The official test uses its
        own diagram, so learn what each control does, not a number you hope will match.
      </p>
      <p>
        Know the difference the questions actually test. The foot brake slows and stops the moving vehicle. The parking
        brake holds a vehicle that is already standing still. The clutch disconnects the engine from the gearbox so
        you can change gear or stop without stalling. An automatic has no clutch pedal. The indicator is how you show
        a turn. The wipers are what you use in the rain. Spend day 11 only on the controls you hesitated over. The{' '}
        <A href="/blog/k53-vehicle-controls-questions-explained">vehicle controls article</A> and the controls section
        of the <A href="/k53-questions-and-answers">free questions</A> are enough for these two days.
      </p>

      <H2>Days 12 to 14: score each section, then rest</H2>
      <p>
        On day 12, sit a mixed set and mark it as the test does: three separate scores, not one total. If signs are
        under 23 out of 28, or rules under 22, or controls under 6, that section is the only thing you study on day
        13. Go back to the rule or the sign, then answer a new batch. Repeating the same ten questions until they feel
        familiar is not the same as being ready for a different draw.
      </p>
      <p>
        On day 14, do one timed <A href="/courses">practice test</A> and then stop adding new topics. Use the last
        hour to pack what the centre will ask for: your identity document, the photos your centre accepts, proof of
        address, and your booking proof. Fees differ by municipality, so check the amount with the centre or on our{' '}
        <A href="/learners-licence-cost">cost guide</A> rather than trusting a figure from a group chat. If you wear
        glasses or contact lenses, put them with the documents. The eye test is part of the visit.
      </p>
      <p>
        If two weeks is all you have, the plan works only if the hour happens on the days above. Missing the sign days
        and “catching up” with a long session of rules is how people fail a section they barely touched. When the two
        weeks are done, you still write the test in person at a driving licence testing centre. Practising online is
        not the official test.
      </p>
    </BlogArticle>
  )
}
