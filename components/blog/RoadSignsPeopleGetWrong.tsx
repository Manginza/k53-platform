import type { BlogPost } from '@/lib/blog'
import BlogArticle, { A, H2, type FaqItem } from './Article'

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'How many road-sign questions are in the learner’s test?',
    a: 'There are 28 road traffic sign questions. You need at least 23. That means you can get only five wrong, which is stricter than the rules section.',
  },
  {
    q: 'Do I have to memorise every sign by its picture?',
    a: 'Learn the shape and colour first, then the symbol. The shape tells you whether the sign is an order, a warning or information. The official question bank is not published, so a memorised caption will not match every question.',
  },
  {
    q: 'Is a warning of a stop sign the same as a stop sign?',
    a: 'No. A triangular warning that shows a stop sign and a distance tells you a stop sign is ahead. You stop at the stop sign or the stop line, not at the warning.',
  },
  {
    q: 'Where can I practise sign questions?',
    a: 'SK Driving’s free K53 questions include a road-signs section with the reason for each answer. They are practice questions, not the official test.',
  },
]

export default function RoadSignsPeopleGetWrong({ post }: { post: BlogPost }) {
  return (
    <BlogArticle post={post} faqs={FAQ_ITEMS}>
      <p>
        Road signs are the section where a small mistake costs the learner’s test. There are 28 sign questions and the
        minimum is 23, so five wrong answers is a fail even if your rules score is perfect. The signs themselves are
        not tricks. People lose marks because two signs look similar and the question asks what you must do, not what
        the sign is called.
      </p>
      <p>
        The <A href="/learners-licence-test">test guide</A> puts it simply: learn signs by shape and colour. The shape
        tells you the type before you read the symbol. Use that as the first check on every question, then confirm the
        symbol. The notes below are the mix-ups that show up again and again in K53 practice. They are not a full sign
        catalogue. For that, use the <A href="/k53-learners-study-guide">study guide</A> and the{' '}
        <A href="/k53-questions-and-answers">free questions</A>.
      </p>

      <H2>Shape and colour come before the picture</H2>
      <p>
        A circular sign is an instruction that applies where the sign stands. A red border means something is
        forbidden, such as a speed limit, a prohibited turn, or no entry. A blue circle means something you must do,
        such as a compulsory direction or a minimum speed where one is shown. If you treat every red-and-white circle
        as “be careful”, you will miss the order it actually gives.
      </p>
      <p>
        A triangle pointing up, with a red border, is a warning of a condition ahead. It does not itself tell you to
        stop, turn or take a new lane at the sign. An upside-down triangle is yield: slow down and give way, and stop
        if you need to. The eight-sided sign is the only stop sign. A rectangle is information or direction: where you
        are, which exit is coming, or which route to follow. It does not prohibit anything.
      </p>
      <p>
        When a question shows a sign you do not recognise, say the shape out loud before you look at the options.
        “This is a warning” or “this is an order” knocks out the answers that describe the wrong kind of sign.
      </p>

      <H2>A warning of a hazard is not the hazard</H2>
      <p>
        This is the most common mix-up in the practice questions. A red-bordered triangle with a truck on a steep
        downward slope warns you that heavy vehicles may be moving slowly on a downhill slope ahead. It does not mean
        there is a parked truck, and it does not mean there has been a crash. You prepare for slow heavy vehicles. You
        do not stop at the warning sign.
      </p>
      <p>
        The same idea applies to a warning that contains another sign. A triangle that shows a stop sign, sometimes
        with a flashing light and a distance plate, warns you that a stop sign is ahead. The correct reading is “there
        is a stop coming”, not “yield and carry on” and not “stop here”. You still stop at the stop line when you
        reach it. People who treat every triangle as “stop now” get this one wrong in the other direction.
      </p>
      <p>
        The word STOP painted on the road, together with a solid stop line, is different again. That marking has the
        same purpose as a stop sign: stop completely behind the line. A painted instruction on the road is the
        instruction, not a preview of one.
      </p>

      <H2>Priority, yield and stop are three different jobs</H2>
      <p>
        A yellow diamond with a white and black border marks a priority road. At the next intersection you have right
        of way. It is not a warning of danger, and it is not a sign that you must give way. Candidates who have only
        learned “yellow means caution” choose the wrong option here.
      </p>
      <p>
        Yield means you let the other traffic go and you stop only if continuing would get in their way. Stop means a
        full stop behind the line, even if the road looks empty, and you move only when it is safe. A flashing red
        traffic light works like a stop sign: stop, then go when it is safe. It does not mean you wait until a green
        light appears, and it does not mean there is a roadblock. A flashing red arrow is the same idea for that lane:
        stop behind the line and move only when it is clear.
      </p>
      <p>
        At a traffic circle, the rule of the road and the signs work together. Where traffic moves around a traffic
        island, you yield to traffic approaching from your right. A yield sign at the entrance is telling you to do
        that. It is not telling you that the traffic on your left must wait for you.
      </p>

      <H2>Lines and kerbs are signs too</H2>
      <p>
        The signs section includes markings, not only boards on poles. A continuous yellow line along the kerb means
        no stopping on that side. A yellow line with a black arrow marking means no parking on the side the arrow
        indicates. Stopping and parking are not the same. Parking is leaving the vehicle. Stopping includes a brief
        halt. A “no stopping” restriction is the stricter of the two. If you only remember “yellow means no parking”,
        you will miss the question that asks whether you may stop to let a passenger out.
      </p>
      <p>
        Pedestrian signals belong in this section as well. When the green man shows, pedestrians may start to cross.
        When the red man shows, they may not start. A red man does not mean pedestrians already in the crossing have
        lost their right of way. If someone is already crossing, you wait until they have finished. The rules article
        covers the same point from the driver’s side:{' '}
        <A href="/blog/k53-rules-of-the-road-explained">you may not pass a vehicle that has stopped at a pedestrian crossing</A>.
      </p>

      <H2>Information signs are not orders</H2>
      <p>
        Blue rectangular signs with white bars are a favourite for a rushed guess. The countdown markers with three,
        two and then one diagonal bars tell you the distance to the next freeway exit. They do not count down to a
        town, and they do not count down to an on-ramp. They are information. Nothing in the sign tells you to leave
        the freeway, change speed, or stop.
      </p>
      <p>
        Temporary direction from a person is also tested. A road worker holding a red flag straight out to the side is
        telling you to stop, not to proceed with caution and not to turn back. The flag is the instruction in that
        moment, in the same way a traffic officer’s signal overrides what you think the lane markings mean.
      </p>

      <H2>How to practise signs without memorising captions</H2>
      <p>
        Take sign questions in small sets from the <A href="/k53-questions-and-answers">free questions and answers</A>.
        For each one, cover the options and say three things: the shape, the colour, and what you must do. Then look
        at the options and pick the one that matches the action, not the one that repeats a word from the symbol.
        When you miss a question, write the difference between the sign you chose and the sign it actually was. “I
        confused a warning with an order” is a useful note. “The answer is B” is not.
      </p>
      <p>
        Some driving licence testing centres use the computerised test and draw questions from a large bank. Hessequa
        Municipality’s description of that system mentions a bank of 1,200 questions for the whole test, not a fixed
        paper. That is why a list of captions you memorised from one PDF will not carry you. Our questions are
        practice in the same style. They are not the official questions. When you can explain a sign without looking
        at the choices, move on to a <A href="/courses">timed practice test</A> and check the signs score on its own.
        You need 23 out of 28 on that section, and the other sections cannot donate marks to it.
      </p>
    </BlogArticle>
  )
}
