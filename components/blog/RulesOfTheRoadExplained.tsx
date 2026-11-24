import type { BlogPost } from '@/lib/blog'
import BlogArticle, { A, H2, type FaqItem } from './Article'

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'What are the general speed limits if there is no sign?',
    a: '60 km/h on a public road in an urban area, 100 km/h outside an urban area on a road that is not a freeway, and 120 km/h on a freeway. A sign can set a different limit. A bus or minibus is limited to 100 km/h, and a goods vehicle with a GVM over 9,000 kg is limited to 80 km/h.',
  },
  {
    q: 'What is the minimum following distance?',
    a: 'Two seconds for a light motor vehicle and three seconds for a heavy motor vehicle. Leave more space in rain, on a slippery road, in poor visibility, or when someone is following you too closely. A safe gap lets you stop without swerving if the vehicle ahead stops suddenly.',
  },
  {
    q: 'Who has right of way at a traffic circle?',
    a: 'You yield to traffic approaching from your right, where traffic moves around a traffic island.',
  },
  {
    q: 'How many rules questions are on the test?',
    a: 'There are 28 rules-of-the-road questions. You need at least 22. You must also pass road signs and vehicle controls. There is no overall percentage that replaces those three minima.',
  },
]

export default function RulesOfTheRoadExplained({ post }: { post: BlogPost }) {
  return (
    <BlogArticle post={post} faqs={FAQ_ITEMS}>
      <p>
        Rules of the road are 28 of the 64 questions on the learner’s test, and you need at least 22. The questions
        are not riddles. They ask what the law requires you to do in a situation you will meet as a driver: how fast
        you may go, how much space to leave, who goes first, and where you may not stop. The basic rule underneath
        the others is to keep to the left side of the road as far as is safe.
      </p>
      <p>
        The figures below are the general rules used in K53 study and in our own rules notes. A road sign or a traffic
        officer can set a different instruction for that place. If you want the pass marks and the way the test is
        drawn, read the <A href="/learners-licence-test">learner’s test guide</A> and then practise on the{' '}
        <A href="/k53-questions-and-answers">free questions</A>.
      </p>

      <H2>Speed limits when no sign is posted</H2>
      <p>
        If no sign shows a different limit, the general limits are 60 km/h on every public road in an urban area,
        100 km/h on a public road outside an urban area that is not a freeway, and 120 km/h on a freeway. People often
        swap the 100 and the 120. The freeway is the higher of the two. A road between towns that is not a freeway
        stays at 100 unless a sign says otherwise.
      </p>
      <p>
        Some vehicles have their own limit even when the road allows more. A bus or a minibus is limited to 100 km/h.
        A goods vehicle with a gross vehicle mass over 9,000 kg is limited to 80 km/h, and the same 80 km/h limit
        applies to a breakdown vehicle that is towing. You may not exceed the limit in order to overtake. Passing
        quickly is not an exception.
      </p>
      <p>
        A speed limit sign replaces the general limit from the sign until another sign ends it or changes it. The sign
        is a regulatory sign, which is why it sits in both this section and the signs section. If you are unsure
        whether a number in a red circle is a warning or an order, it is an order.
      </p>

      <H2>Following distance</H2>
      <p>
        The minimum following distance is two seconds behind the vehicle ahead if you are in a light motor vehicle,
        and three seconds if you are in a heavy motor vehicle. You measure it by watching the vehicle ahead pass a
        fixed point, such as a pole or a mark on the road, and counting the seconds until your own vehicle reaches
        that point. If you arrive before the count is finished, you are too close.
      </p>
      <p>
        Two seconds is a minimum in good conditions, not a target to sit on. Increase the gap in rain, on a slippery
        surface, in poor visibility, and when the driver behind you is too close as well. The test’s idea of a safe
        gap is practical: if the vehicle in front stopped suddenly, you could stop behind it in a straight line
        without swerving. Swerving around it, or stopping beside it, is the wrong reading of “enough space”.
      </p>
      <p>
        Following too closely also makes the signs and the speed limit harder to obey, because you have no time to
        react to either. When you practise, do not think of the two-second rule as a trick question with a metre
        measurement. The rule in the study material is a time gap, not “five metres at 100 km/h” and not “as close as
        possible so you can overtake”.
      </p>

      <H2>Right of way</H2>
      <p>
        Right of way is a set of “who must give way” rules, not a reward for being in a hurry. Where traffic moves
        around a traffic island, such as a traffic circle, you yield to traffic approaching from your right. Yield
        means slow down and, if you have to, stop. It does not mean you edge forward and hope.
      </p>
      <p>
        At a pedestrian crossing you yield, slow down or stop for a pedestrian who is crossing within the crossing.
        If another vehicle has already stopped at that crossing, you may not pass it. Pedestrians who are already
        crossing when the red man appears still have right of way. You wait until they have finished. A green man
        means pedestrians may start to cross. A red man means they may not start.
      </p>
      <p>
        An emergency vehicle that is sounding a siren and showing its warning lights gets immediate right of way. You
        move left and let it pass. Flashing your headlights or switching on hazard lights is not what the rule asks
        for. At a four-way stop, the well-established K53 rule is that the vehicle which stopped first moves first. If
        two vehicles stop at the same time, you give way to the vehicle on your right. A stop is still a complete
        stop. Arriving first does not let you roll through.
      </p>

      <H2>Lane position, signals and overtaking</H2>
      <p>
        You drive on the left side of the roadway and you do not move onto the right half except when the rules allow
        a manoeuvre such as overtaking. On a road that is divided, you use the left-hand roadway unless you are
        directed otherwise. When someone wants to pass you, you keep as far left as is safe and you do not speed up
        until they have passed.
      </p>
      <p>
        You normally overtake on the right, at a safe distance, and you return to the left only when you are safely
        clear. You may not overtake as you approach the top of a rise, a curve, or any place where your view is
        restricted. You may not overtake by driving on the shoulder or the verge. On a freeway you keep left and pass
        on the right. Before you stop, turn or change lanes you signal clearly and in good time, using the direction
        indicators. Signalling as you turn is late. The other driver needed the signal before the manoeuvre.
      </p>

      <H2>Where you may not park or stop</H2>
      <p>
        Parking and stopping have different distance rules, and the questions swap them to see if you noticed. You may
        not park within 5 metres of an intersection, within 9 metres of the approaching side of a pedestrian crossing,
        or within 1.5 metres of a fire hydrant on the same side. You also may not park where the road is less than
        5.5 metres wide, where your vehicle would hide a road sign, or on a sidewalk.
      </p>
      <p>
        Stopping is stricter in some places. You may not stop within 6 metres of a tunnel, subway or bridge, within 9
        metres of the approaching side of a pedestrian crossing, on the right-hand side of the road facing oncoming
        traffic, beside another vehicle where the roadway is less than 9 metres wide, or at a railway level crossing.
        Learn the two lists separately. “Nine metres” is the pedestrian-crossing figure that appears in both. “Five
        metres” is the intersection parking figure. “Six metres” is the bridge and tunnel stopping figure.
      </p>

      <H2>A few duties the test keeps asking</H2>
      <p>
        You may not hold a cellphone, or any other communication device, in your hand or with any other part of your
        body while the vehicle is moving. Putting it on speaker does not make it legal to hold it. For an ordinary
        driver it is an offence to drive with a blood-alcohol concentration of 0.05 grams per 100 millilitres or more.
        For a professional driver the figure is 0.02 grams per 100 millilitres or more.
      </p>
      <p>
        After a crash you stop, check for injured people and help them, and give your particulars. If you have not
        already given those particulars to an officer at the scene, you report the crash at a police station within
        24 hours. You may not drink alcohol after the crash until you have reported it. None of these are “courtesy”
        answers. When a question asks for the most important rule of the road, the answer in our question bank is to
        keep left as far as is safe, not a general instruction to be polite, and not the speed limit on its own.
      </p>
      <p>
        Work through the rules section of the <A href="/k53-questions-and-answers">free questions</A> and then a timed
        test on <A href="/courses">the practice tests</A>. Mark the rules score on its own. Twenty-one out of 28 is a
        fail for that section, whatever the other two sections look like. The signs that go with these rules are
        covered in <A href="/blog/k53-road-signs-most-people-get-wrong">road signs most people get wrong</A>.
      </p>
    </BlogArticle>
  )
}
