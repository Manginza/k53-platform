import type { BlogPost } from '@/lib/blog'
import BlogArticle, { A, H2, type FaqItem } from './Article'

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Is there one official pass rate for the country?',
    a: 'We do not quote a national pass rate here. Published figures differ by source and by who was counted. What is fixed is the pass mark: 22 out of 28 for rules, 23 out of 28 for signs and 6 out of 8 for controls, and you must pass every section.',
  },
  {
    q: 'Can a good rules score make up for signs?',
    a: 'No. There is no overall percentage. Getting every rules question right still fails you if you only get 22 of the 28 sign questions.',
  },
  {
    q: 'Why does memorising a question paper fail?',
    a: 'Where a centre uses the computerised test, the questions are drawn from a bank rather than a single fixed paper. The official bank is not published. You need to understand the rule so a differently worded question is still answerable.',
  },
  {
    q: 'Does failing mean I can rewrite immediately?',
    a: 'You need a new booking. Fees and dates depend on the centre. Ask your driving licence testing centre what it charges to book again. There is no single national fee.',
  },
]

export default function WhyLearnersFail({ post }: { post: BlogPost }) {
  return (
    <BlogArticle post={post} faqs={FAQ_ITEMS}>
      <p>
        People fail the learner’s test for a few repeatable reasons, and none of them require a mystery pass rate to
        explain. The test marks three sections separately. You need 22 out of 28 on rules of the road, 23 out of 28 on
        road signs and 6 out of 8 on vehicle controls. Miss the minimum in one section and the attempt is a fail, even
        if the other two were perfect. Most of the mistakes below are ways of walking into that rule unprepared.
      </p>
      <p>
        This is not a claim about how many candidates fail, or about which province fails more people. Those figures
        move and they are easy to misread. What follows is how the test is built, and the study habits that do not
        match it. The marking is set out on the <A href="/learners-licence-test">test guide</A>.
      </p>

      <H2>Treating three sections as one score</H2>
      <p>
        A total that “feels like a pass” is not how the paper is marked. There is no official overall percentage.
        Twenty-eight rules questions right and twenty-two sign questions right is a fail, because signs needed 23.
        Signs is the strictest section: five wrong is all the room you have. Controls looks small, and it is, which
        is why two wrong answers out of eight is enough to end the attempt.
      </p>
      <p>
        The habit that matches the marking is to score every practice set three times. If you only look at a combined
        mark on the <A href="/courses">practice tests</A>, you can feel ready while one section is under the line.
        Spend the next study session on that section only. The{' '}
        <A href="/blog/how-to-study-for-the-k53-learners-test-in-two-weeks">two-week study plan</A> is built this way,
        with more days on signs than on controls.
      </p>

      <H2>Memorising a paper instead of a rule</H2>
      <p>
        A fixed list of questions and answers used to feel like enough when every candidate sat a similar paper.
        Centres that use the computerised learner’s licence test draw questions from a bank. Hessequa Municipality’s
        description of that system says the 64 questions come from a bank of 1,200. The official bank is not
        published. A sentence you memorised from a PDF will not be there in the same words, and the correct option may
        be phrased as the action you must take rather than the name of the sign.
      </p>
      <p>
        The Western Cape says its learner’s tests are on the computerised system. We could not confirm that every
        centre in the country has moved off paper, so ask yours. Either way, understanding survives both formats.
        When you miss a practice question, write why the right answer is right. “Because the shape is a warning” will
        still help when the picture changes. “Because the answer was B last time” will not. Our{' '}
        <A href="/k53-questions-and-answers">free questions</A> put that reason under each answer for this purpose.
        They are not the official questions.
      </p>

      <H2>Confusing similar signs and similar rules</H2>
      <p>
        Sign questions fail when two pictures feel alike and the options describe different actions. A warning of a
        stop ahead is not a stop. A yellow diamond is a priority road, not a general caution. A flashing red light
        means stop and then go when it is safe, not “wait for green”. A continuous yellow kerb line means no
        stopping, which is stricter than no parking. Those differences are written out in{' '}
        <A href="/blog/k53-road-signs-most-people-get-wrong">road signs most people get wrong</A>.
      </p>
      <p>
        Rules questions fail on swapped numbers. The urban limit is 60 km/h, the open-road limit that is not a freeway
        is 100 km/h, and the freeway limit is 120 km/h, unless a sign says otherwise. Following distance is two
        seconds for a light vehicle and three seconds for a heavy one. Parking is prohibited within 5 metres of an
        intersection. Stopping is prohibited within 6 metres of a bridge or tunnel. The pedestrian-crossing distance
        that comes up in both lists is 9 metres. Mixing any pair of those is a mark. They are explained in{' '}
        <A href="/blog/k53-rules-of-the-road-explained">rules of the road explained</A>.
      </p>
      <p>
        Controls questions fail when the foot brake, the parking brake and the clutch are treated as the same pedal.
        The foot brake stops a moving vehicle. The parking brake holds a parked one. The clutch keeps a manual vehicle
        from stalling and lets you change gear. Two of those swapped is a failed section. See{' '}
        <A href="/blog/k53-vehicle-controls-questions-explained">vehicle controls questions explained</A>.
      </p>

      <H2>Leaving one section until the night before</H2>
      <p>
        Controls is eight questions, so it is the section people skip. Signs feel like flashcards, so people revise
        them without ever answering a question under a time limit. Rules feel like common sense, so people do not
        open them at all. The test does not reward the section you enjoyed. It fails you for the one you skipped.
      </p>
      <p>
        A practical check, a few days before the booking, is a full timed set marked in three columns. Anything under
        the minimum becomes the only topic until it is over the line on a new set of questions, not on the same set
        repeated. Repeating one quiz until you recognise the sentences is a form of memorising.
      </p>

      <H2>Arriving unready for the centre, not the questions</H2>
      <p>
        Some attempts fail before the first question. The centre needs your identity document, the photographs it
        accepts, proof of address, and your booking. The eye test is compulsory. If you wear glasses or contact
        lenses and you do not have them, you may not get a fair eye test or a test at all. The category on the LL1
        form has to match the vehicle you are working towards. A Code 8 aim is usually a Code 2 learner’s. A Code 10
        or Code 14 aim is usually a Code 3. Signing the wrong category is not something the practice tests can fix in
        the waiting room.
      </p>
      <p>
        Fees and booking rules differ. Gauteng residents use <A href="https://online.natis.gov.za/#/">online.natis.gov.za</A>.
        Other provinces should ask the <A href="/centers">nearest testing centre</A>. There is no single national fee,
        and a failed attempt means a new booking. The documents are listed on the{' '}
        <A href="/learners-licence-requirements">requirements guide</A> and in{' '}
        <A href="/blog/what-to-bring-on-learners-licence-test-day">what to bring on test day</A>.
      </p>

      <H2>A worked example: 53 out of 64 is still a fail</H2>
      <p>
        Say a practice test comes back as 26 out of 28 on rules, 20 out of 28 on signs and 7 out of 8 on controls.
        Added up, that is 53 out of 64, which looks comfortable if you were hoping for “about 80%”. It is a fail. Signs
        needed 23, and 20 is three short. The rules score cannot lend those three marks across. Controls passed. Rules
        passed. The attempt did not.
      </p>
      <p>
        The next study session is signs only. Not another mixed test, and not a reread of the speed limits that were
        already fine. Take the signs that were wrong, name the shape, and say what the driver must do. A warning of a
        stop ahead is “prepare to stop at the sign 200 metres on”, not “stop at this board”. A yellow diamond is “I
        have right of way at the next intersection”, not “danger”. Then answer a new set of sign questions that you
        have not just memorised. When that set is 23 or better, and a second new set is also 23 or better, the weak
        section is no longer the reason to delay the booking. Until then, another date at the centre repeats the same
        gap.
      </p>

      <H2>What to do if you have already failed</H2>
      <p>
        Book again only after you know which section failed. If the centre told you, start there. If it did not, sit
        one practice test and read the three scores. Study that section from the rule, not from the options you
        remember, and do not pay for another date until a fresh set of questions clears the minimum. Taking the same
        booking again next week, without changing how you study, repeats the attempt. It does not prepare a different
        one.
      </p>
    </BlogArticle>
  )
}
